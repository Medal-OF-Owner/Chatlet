// ============================================================
// Configuration Socket.IO Client - Frontend Hostinger
// ============================================================
// Fichier: client/src/lib/socket-aws.ts
// À utiliser pour connecter le frontend au backend AWS
// ============================================================

import { io, Socket } from "socket.io-client";

// ============================================================
// Configuration de connexion
// ============================================================

// URL du backend AWS App Runner
// IMPORTANT: Remplacez par votre vraie URL après déploiement AWS
const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 
                    "https://VOTRE_URL_APP_RUNNER.awsapprunner.com";

console.log("[Socket.IO Client] Connecting to backend:", BACKEND_URL);

// ============================================================
// Créer l'instance Socket.IO
// ============================================================
export const socket: Socket = io(BACKEND_URL, {
  // Options de connexion
  transports: ["websocket", "polling"] as any, // Essayer WebSocket en premier
  autoConnect: true, // Connexion automatique
  reconnection: true, // Reconnexion automatique
  reconnectionDelay: 1000, // Délai entre tentatives (1s)
  reconnectionDelayMax: 5000, // Délai max (5s)
  reconnectionAttempts: Infinity, // Tentatives infinies
  timeout: 20000, // Timeout de connexion (20s)
  
  // Compression des données
  // @ts-ignore
  perMessageDeflate: {
    threshold: 1024 // Compresser > 1KB
  },
  
  // Credentials (pour CORS)
  withCredentials: true,
  
  // Headers personnalisés (optionnel)
  extraHeaders: {
    "X-Client-Version": "2.0.0"
  }
});

// ============================================================
// Événements de diagnostic
// ============================================================
socket.on("connect", () => {
  console.log("[Socket.IO] ✅ Connected to backend:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket.IO] ⚠️ Disconnected:", reason);
  
  if (reason === "io server disconnect") {
    // Le serveur a fermé la connexion, reconnexion manuelle
    socket.connect();
  }
});

socket.on("connect_error", (error) => {
  console.error("[Socket.IO] ❌ Connection error:", error.message);
  
  // Stratégie de fallback: basculer sur polling si WebSocket échoue
  // @ts-ignore
  const currentTransports = socket.io.opts.transports;
  // @ts-ignore
  if (Array.isArray(currentTransports) && currentTransports.includes("websocket")) {
    console.log("[Socket.IO] Switching to polling transport...");
    // @ts-ignore
    socket.io.opts.transports = ["polling", "websocket"] as any;
  }
});

socket.on("reconnect", (attemptNumber) => {
  console.log(`[Socket.IO] 🔄 Reconnected after ${attemptNumber} attempts`);
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`[Socket.IO] 🔄 Reconnection attempt ${attemptNumber}...`);
});

socket.on("reconnect_error", (error) => {
  console.error("[Socket.IO] ❌ Reconnection error:", error.message);
});

socket.on("reconnect_failed", () => {
  console.error("[Socket.IO] ❌ Reconnection failed after max attempts");
  alert("Impossible de se connecter au serveur. Veuillez actualiser la page.");
});

// ============================================================
// Événements personnalisés (debug)
// ============================================================
socket.on("error", (error) => {
  console.error("[Socket.IO] Server error:", error);
  alert(`Erreur serveur: ${error.message || "Erreur inconnue"}`);
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Rejoindre une room de chat
 */
export function joinRoom(roomId: number, nickname: string, profileImage?: string) {
  console.log(`[Socket.IO] Joining room ${roomId} as ${nickname}`);
  socket.emit("join_room", { roomId, nickname, profileImage });
}

/**
 * Quitter une room
 */
export function leaveRoom(roomId: number, nickname: string) {
  console.log(`[Socket.IO] Leaving room ${roomId}`);
  socket.emit("leave_room", { roomId, nickname });
}

/**
 * Envoyer un message
 */
export function sendMessage(
  roomId: number,
  nickname: string,
  content: string,
  fontFamily?: string,
  textColor?: string,
  profileImage?: string
) {
  socket.emit("send_message", {
    roomId,
    nickname,
    content,
    fontFamily: fontFamily || "sans-serif",
    textColor: textColor || "#ffffff",
    profileImage
  });
}

/**
 * Indicateur de frappe (typing)
 */
export function startTyping(roomId: number, nickname: string) {
  socket.emit("typing_start", { roomId, nickname });
}

export function stopTyping(roomId: number, nickname: string) {
  socket.emit("typing_stop", { roomId, nickname });
}

// ============================================================
// WebRTC Helpers
// ============================================================

/**
 * Envoyer une offre WebRTC
 */
export function sendWebRTCOffer(roomId: number, from: string, signal: any) {
  socket.emit("webrtc_offer", { roomId, from, signal });
}

/**
 * Envoyer une réponse WebRTC
 */
export function sendWebRTCAnswer(roomId: number, from: string, to: string, signal: any) {
  socket.emit("webrtc_answer", { roomId, from, to, signal });
}

/**
 * Envoyer un candidat ICE
 */
export function sendICECandidate(roomId: number, from: string, signal: any) {
  socket.emit("webrtc_ice_candidate", { roomId, from, signal });
}

/**
 * Rejoindre la room vidéo
 */
export function joinVideoRoom(roomId: number, nickname: string) {
  socket.emit("webrtc_join", { roomId, nickname });
}

// ============================================================
// État de la connexion
// ============================================================

/**
 * Vérifier si connecté
 */
export function isConnected(): boolean {
  return socket.connected;
}

/**
 * Obtenir l'ID du socket
 */
export function getSocketId(): string | undefined {
  return socket.id;
}

/**
 * Forcer la reconnexion
 */
export function forceReconnect() {
  if (!socket.connected) {
    console.log("[Socket.IO] Forcing reconnection...");
    socket.connect();
  }
}

/**
 * Obtenir l'instance socket (alias pour l'export par défaut)
 */
export function getSocket() {
  return socket;
}

/**
 * Déconnecter le socket
 */
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
