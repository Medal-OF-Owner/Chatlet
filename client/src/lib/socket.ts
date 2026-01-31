import { io, Socket } from "socket.io-client";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 
                    "https://VOTRE_URL_APP_RUNNER.awsapprunner.com";

console.log("[Socket.IO Client] Connecting to backend:", BACKEND_URL);

export const socket: Socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  withCredentials: true,
  extraHeaders: {
    "X-Client-Version": "2.0.0"
  }
});

socket.on("connect", () => {
  console.log("[Socket.IO] ✅ Connected to backend:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket.IO] ⚠️ Disconnected:", reason);
  if (reason === "io server disconnect") {
    socket.connect();
  }
});

socket.on("connect_error", (error) => {
  console.error("[Socket.IO] ❌ Connection error:", error.message);
  if (socket.io.opts.transports?.includes("websocket" as any)) {
    socket.io.opts.transports = ["polling", "websocket"] as any;
  }
});

export const getSocket = () => socket;
export const disconnectSocket = () => socket.disconnect();

export function joinRoom(roomId: number, nickname: string, profileImage?: string) {
  socket.emit("join_room", { roomId, nickname, profileImage });
}

export function leaveRoom(roomId: number, nickname: string) {
  socket.emit("leave_room", { roomId, nickname });
}

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

export function startTyping(roomId: number, nickname: string) {
  socket.emit("typing_start", { roomId, nickname });
}

export function stopTyping(roomId: number, nickname: string) {
  socket.emit("typing_stop", { roomId, nickname });
}

export function isConnected(): boolean {
  return socket.connected;
}

export function getSocketId(): string | undefined {
  return socket.id;
}

export default socket;
