import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {

    // For Render deployment, use explicit URL in production to avoid wss issues
    const isProduction = process.env.NODE_ENV === "production";
    const url = isProduction ? window.location.origin : undefined; // Use window.location.origin in production
    
    socket = io(url, {
      path: "/socket.io/",
      transports: ["polling"], // Force polling only to avoid unstable WebSocket upgrade on Render
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 60000, // Match server pingTimeout
      upgrade: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
