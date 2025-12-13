import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {

    // For Render deployment, use relative path and force polling first
    // to ensure connection works over HTTP/HTTPS proxy
    socket = io({
      path: "/socket.io/",
      transports: ["polling", "websocket"], // Polling first for better compatibility with Render's proxy
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
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
