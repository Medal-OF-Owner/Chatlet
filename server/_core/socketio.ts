import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getDb } from "../db";
import { rooms, messages, activeNicknames } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

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

const roomUsers = new Map<number, Set<string>>();

export function setupSocketIO(server: HTTPServer) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  console.log("[Socket.IO] Initializing with CORS origin:", frontendUrl);
  
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        frontendUrl,
        "http://localhost:5173",
        "http://localhost:3000",
        /^https?:\/\/.*\.chatlet\.com$/,
        /^https?:\/\/.*\.awsapprunner\.com$/
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    transports: ["websocket", "polling"],
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024,
    },
    maxHttpBufferSize: 50 * 1024 * 1024
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.id}`);

    socket.on("join_room", async (data: JoinRoomData) => {
      try {
        const { roomId, nickname, profileImage } = data;
        socket.join(`room-${roomId}`);

        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId)!.add(nickname);

        const db = await getDb();
        if (!db) return;

        await db.insert(activeNicknames)
          .values({ nickname, connectedAt: new Date() })
          .onDuplicateKeyUpdate({ set: { connectedAt: new Date() } });

        const messageHistory = await db.select()
          .from(messages)
          .where(eq(messages.roomId, roomId))
          .orderBy(desc(messages.createdAt))
          .limit(50);

        socket.emit("message_history", messageHistory.reverse());

        const connectedUsers = Array.from(roomUsers.get(roomId) || []);
        io.to(`room-${roomId}`).emit("room_users", connectedUsers);

        socket.to(`room-${roomId}`).emit("user_joined", {
          nickname,
          profileImage,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("[Socket.IO] Error joining room:", error);
      }
    });

    socket.on("send_message", async (data: SendMessageData) => {
      try {
        const { roomId, nickname, content, fontFamily, textColor, profileImage } = data;
        const db = await getDb();
        if (!db) return;

        const [result] = await db.insert(messages).values({
          roomId,
          nickname,
          content,
          fontFamily: fontFamily || "sans-serif",
          textColor: textColor || "#ffffff",
          profileImage,
          createdAt: new Date()
        });

        const insertId = (result as any).insertId;

        const savedMessage = await db.select()
          .from(messages)
          .where(eq(messages.id, insertId))
          .limit(1);

        io.to(`room-${roomId}`).emit("new_message", savedMessage[0]);
      } catch (error) {
        console.error("[Socket.IO] Error sending message:", error);
      }
    });

    socket.on("webrtc_offer", (data: WebRTCSignal) => {
      socket.to(`room-${data.roomId}`).emit("webrtc_offer", {
        signal: data.signal,
        from: data.from
      });
    });

    socket.on("webrtc_answer", (data: WebRTCSignal) => {
      socket.to(`room-${data.roomId}`).emit("webrtc_answer", {
        signal: data.signal,
        from: data.from,
        to: data.to
      });
    });

    socket.on("webrtc_ice_candidate", (data: WebRTCSignal) => {
      socket.to(`room-${data.roomId}`).emit("webrtc_ice_candidate", {
        signal: data.signal,
        from: data.from
      });
    });

    socket.on("webrtc_join", (data: { roomId: number; nickname: string }) => {
      socket.to(`room-${data.roomId}`).emit("webrtc_peer_joined", {
        nickname: data.nickname,
        socketId: socket.id
      });
    });

    socket.on("disconnect", async () => {
      console.log(`[Socket.IO] User disconnected: ${socket.id}`);
    });

    socket.on("leave_room", async (data: { roomId: number; nickname: string }) => {
      try {
        const { roomId, nickname } = data;
        socket.leave(`room-${roomId}`);

        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId)!.delete(nickname);
          if (roomUsers.get(roomId)!.size === 0) {
            roomUsers.delete(roomId);
          }
        }

        const db = await getDb();
        if (!db) return;
        await db.delete(activeNicknames).where(eq(activeNicknames.nickname, nickname));

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

  return io;
}

export function startCleanupTask() {
  setInterval(async () => {
    try {
      console.log("[Socket.IO] Cleanup task completed");
    } catch (error) {
      console.error("[Socket.IO] Cleanup error:", error);
    }
  }, 5 * 60 * 1000);
}
