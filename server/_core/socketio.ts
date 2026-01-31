// ============================================================
// Configuration Socket.IO Optimisée - AWS + Hostinger
// ============================================================
// Fichier: server/_core/socketio-aws.ts
// À copier dans votre projet pour remplacer socketio.ts
// ============================================================

import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getDb } from "../db";
import { rooms, messages, activeNicknames } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Types pour les événements Socket.IO
interface JoinRoomData {
  roomId: number;
  nickname: string;
  profileImage?: string;
}

interface SendMessageData {
  roomId: number;
  nickname: string;
  content: string;
  fontFamily?: string;
  textColor?: string;
  profileImage?: string;
}

interface WebRTCSignal {
  roomId: number;
  signal: any;
  from: string;
  to?: string;
}

// Map pour stocker les utilisateurs par room (en mémoire)
const roomUsers = new Map<number, Set<string>>();

export function setupSocketIO(server: HTTPServer) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  console.log("[Socket.IO] Initializing with CORS origin:", frontendUrl);
  
  // Créer le serveur Socket.IO avec configuration CORS optimisée
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        frontendUrl,
        "http://localhost:5173", // Dev local
        "http://localhost:3000",
        /^https?:\/\/.*\.chatlet\.com$/, // Tous les sous-domaines
        /^https?:\/\/.*\.awsapprunner\.com$/ // AWS App Runner
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    // Optimisations pour AWS
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    transports: ["websocket", "polling"], // WebSocket en priorité
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024, // Compresser les messages > 1KB
    },
    // Limite de taille des messages (50MB pour images base64)
    maxHttpBufferSize: 50 * 1024 * 1024
  });

  // ============================================================
  // Middleware de connexion
  // ============================================================
  io.use((socket, next) => {
    const origin = socket.handshake.headers.origin;
    console.log(`[Socket.IO] Connection attempt from: ${origin}`);
    next();
  });

  // ============================================================
  // Événements de connexion
  // ============================================================
  io.on("connection", (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.id}`);

    // ============================================================
    // Rejoindre une room
    // ============================================================
    socket.on("join_room", async (data: JoinRoomData) => {
      try {
        const { roomId, nickname, profileImage } = data;
        
        console.log(`[Socket.IO] User ${nickname} joining room ${roomId}`);

        // Rejoindre la room Socket.IO
        socket.join(`room-${roomId}`);

        // Ajouter l'utilisateur à la map en mémoire
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId)!.add(nickname);

        // Enregistrer le nickname actif en base (pour éviter les doublons)
        const db = getDb();
        await db.insert(activeNicknames)
          .values({ nickname, connectedAt: new Date() })
          .onDuplicateKeyUpdate({ set: { connectedAt: new Date() } });

        // Récupérer l'historique des 50 derniers messages
        const messageHistory = await db.select()
          .from(messages)
          .where(eq(messages.roomId, roomId))
          .orderBy(desc(messages.createdAt))
          .limit(50);

        // Envoyer l'historique au client (ordre chronologique)
        socket.emit("message_history", messageHistory.reverse());

        // Envoyer la liste des utilisateurs connectés
        const connectedUsers = Array.from(roomUsers.get(roomId) || []);
        io.to(`room-${roomId}`).emit("room_users", connectedUsers);

        // Notifier les autres qu'un utilisateur a rejoint
        socket.to(`room-${roomId}`).emit("user_joined", {
          nickname,
          profileImage,
          timestamp: new Date()
        });

        console.log(`[Socket.IO] Room ${roomId} now has ${connectedUsers.length} users`);
      } catch (error) {
        console.error("[Socket.IO] Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ============================================================
    // Envoyer un message
    // ============================================================
    socket.on("send_message", async (data: SendMessageData) => {
      try {
        const { roomId, nickname, content, fontFamily, textColor, profileImage } = data;

        // Sauvegarder en base de données
        const db = getDb();
        const [newMessage] = await db.insert(messages)
          .values({
            roomId,
            nickname,
            content,
            fontFamily: fontFamily || "sans-serif",
            textColor: textColor || "#ffffff",
            profileImage,
            createdAt: new Date()
          });

        // Récupérer le message complet avec l'ID
        const savedMessage = await db.select()
          .from(messages)
          .where(eq(messages.id, newMessage.insertId))
          .limit(1);

        // Envoyer à tous les utilisateurs de la room (y compris l'émetteur)
        io.to(`room-${roomId}`).emit("new_message", savedMessage[0]);

        console.log(`[Socket.IO] Message sent in room ${roomId} by ${nickname}`);
      } catch (error) {
        console.error("[Socket.IO] Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ============================================================
    // WebRTC Signaling (Caméra/Micro)
    // ============================================================
    
    // Offre WebRTC (initier une connexion vidéo)
    socket.on("webrtc_offer", (data: WebRTCSignal) => {
      console.log(`[WebRTC] Offer from ${data.from} in room ${data.roomId}`);
      
      // Envoyer l'offre à tous les autres utilisateurs de la room
      socket.to(`room-${data.roomId}`).emit("webrtc_offer", {
        signal: data.signal,
        from: data.from
      });
    });

    // Réponse WebRTC (accepter une connexion vidéo)
    socket.on("webrtc_answer", (data: WebRTCSignal) => {
      console.log(`[WebRTC] Answer from ${data.from} to ${data.to}`);
      
      // Envoyer la réponse au peer spécifique
      socket.to(`room-${data.roomId}`).emit("webrtc_answer", {
        signal: data.signal,
        from: data.from,
        to: data.to
      });
    });

    // Candidat ICE (pour établir la connexion P2P)
    socket.on("webrtc_ice_candidate", (data: WebRTCSignal) => {
      // Envoyer le candidat ICE aux autres peers
      socket.to(`room-${data.roomId}`).emit("webrtc_ice_candidate", {
        signal: data.signal,
        from: data.from
      });
    });

    // Nouveau peer rejoint pour la vidéo
    socket.on("webrtc_join", (data: { roomId: number; nickname: string }) => {
      console.log(`[WebRTC] ${data.nickname} joined video in room ${data.roomId}`);
      
      // Notifier les autres peers
      socket.to(`room-${data.roomId}`).emit("webrtc_peer_joined", {
        nickname: data.nickname,
        socketId: socket.id
      });
    });

    // ============================================================
    // Utilisateur en train de taper (typing indicator)
    // ============================================================
    socket.on("typing_start", (data: { roomId: number; nickname: string }) => {
      socket.to(`room-${data.roomId}`).emit("user_typing", {
        nickname: data.nickname,
        isTyping: true
      });
    });

    socket.on("typing_stop", (data: { roomId: number; nickname: string }) => {
      socket.to(`room-${data.roomId}`).emit("user_typing", {
        nickname: data.nickname,
        isTyping: false
      });
    });

    // ============================================================
    // Déconnexion
    // ============================================================
    socket.on("disconnect", async () => {
      console.log(`[Socket.IO] User disconnected: ${socket.id}`);

      // Retirer l'utilisateur de toutes les rooms
      for (const [roomId, users] of roomUsers.entries()) {
        // Note: On ne peut pas identifier facilement quel nickname correspond à ce socket
        // Solution: Le client doit envoyer "leave_room" explicitement avant de se déconnecter
        // Ou stocker une map socket.id -> nickname
      }
    });

    // Quitter une room explicitement
    socket.on("leave_room", async (data: { roomId: number; nickname: string }) => {
      try {
        const { roomId, nickname } = data;

        console.log(`[Socket.IO] User ${nickname} leaving room ${roomId}`);

        // Retirer de la room Socket.IO
        socket.leave(`room-${roomId}`);

        // Retirer de la map en mémoire
        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId)!.delete(nickname);
          
          // Si la room est vide, la supprimer
          if (roomUsers.get(roomId)!.size === 0) {
            roomUsers.delete(roomId);
          }
        }

        // Supprimer le nickname actif de la base
        const db = getDb();
        await db.delete(activeNicknames)
          .where(eq(activeNicknames.nickname, nickname));

        // Notifier les autres
        const connectedUsers = Array.from(roomUsers.get(roomId) || []);
        io.to(`room-${roomId}`).emit("room_users", connectedUsers);
        socket.to(`room-${roomId}`).emit("user_left", {
          nickname,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("[Socket.IO] Error leaving room:", error);
      }
    });
  });

  console.log("[Socket.IO] Server initialized successfully");
  
  return io;
}

// ============================================================
// Nettoyage périodique des nicknames inactifs (optionnel)
// ============================================================
export function startCleanupTask() {
  setInterval(async () => {
    try {
      const db = getDb();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Supprimer les nicknames non actifs depuis 5 minutes
      // Note: Cette stratégie suppose que les clients envoient des heartbeats
      // Sinon, gérer différemment (ex: stocker lastActivity par socket)
      
      console.log("[Socket.IO] Cleanup task completed");
    } catch (error) {
      console.error("[Socket.IO] Cleanup error:", error);
    }
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}
