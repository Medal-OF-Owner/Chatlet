import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { addMessage, getMessages, reserveNickname, releaseNickname, checkNicknameAvailable } from "../db";

interface SocketUser {
  id: string;
  nickname: string;
  roomId: number;
}

const users: Map<string, SocketUser> = new Map();

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on("join_room", async (data: { roomId: number; nickname: string }) => {
      const { roomId, nickname } = data;

      // Check if nickname is available
      const available = await checkNicknameAvailable(nickname);
      if (!available) {
        console.log(`❌ Nickname "${nickname}" is already taken`);
        socket.emit("nickname_taken", { nickname });
        return;
      }

      // Try to reserve the nickname
      const reserved = await reserveNickname(nickname);
      if (!reserved) {
        console.log(`❌ Failed to reserve nickname "${nickname}"`);
        socket.emit("nickname_taken", { nickname });
        return;
      }

      socket.join(`room_${roomId}`);

      const user: SocketUser = {
        id: socket.id,
        nickname,
        roomId,
      };

      users.set(socket.id, user);

      // 1. Notify all existing users in the room that a new user joined
      io.to(`room_${roomId}`).emit("user_joined", {
        nickname,
        userId: socket.id,
        timestamp: new Date(),
      });

      // 2. Send a list of existing users to the newly joined user
      const existingUsers = Array.from(users.values()).filter(
        (u) => u.roomId === roomId && u.id !== socket.id
      );
      
      if (existingUsers.length > 0) {
        socket.emit("existing_users", existingUsers.map(u => ({
          nickname: u.nickname,
          userId: u.id,
        })));
      }

      // Don't send message history - fresh start for each session
      socket.emit("message_history", []);

      console.log(`✅ ${nickname} joined room ${roomId}`);
    });

    // Send message
    socket.on("send_message", async (data: { 
      roomId: number; 
      nickname: string; 
      content: string; 
      fontFamily?: string; 
      textColor?: string;
      profileImage?: string 
    }) => {
      const { roomId, nickname, content, fontFamily, textColor, profileImage } = data;
      console.log(`📨 Received message from ${nickname} in room ${roomId}: ${content}`);

      try {
        await addMessage(roomId, nickname, content, fontFamily, profileImage);
        console.log(`✅ Message saved to DB`);

        // Broadcast to all users in the room
        io.to(`room_${roomId}`).emit("new_message", {
          nickname,
          content,
          fontFamily: fontFamily || "sans-serif",
          textColor: textColor || "#ffffff",
          profileImage: profileImage || null,
          createdAt: new Date(),
        });
        console.log(`📤 Message broadcasted to room_${roomId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        console.error("❌ Failed message data:", data);
        socket.emit("error", "Failed to send message");
      }
    });

    // WebRTC offer
    socket.on("webrtc_offer", (data: { to: string; offer: any }) => {
      io.to(data.to).emit("webrtc_offer", {
        from: socket.id,
        offer: data.offer,
      });
    });

    // WebRTC answer
    socket.on("webrtc_answer", (data: { to: string; answer: any }) => {
      io.to(data.to).emit("webrtc_answer", {
        from: socket.id,
        answer: data.answer,
      });
    });

    // WebRTC ICE candidate
    socket.on("webrtc_ice_candidate", (data: { to: string; candidate: any }) => {
      io.to(data.to).emit("webrtc_ice_candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    // Change nickname
    socket.on("change_nickname", (data: { roomId: number; oldNickname: string; newNickname: string }) => {
      const user = users.get(socket.id);
      if (user) {
        user.nickname = data.newNickname;
        users.set(socket.id, user);

        io.to(`room_${data.roomId}`).emit("nickname_changed", {
          oldNickname: data.oldNickname,
          newNickname: data.newNickname,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      const user = users.get(socket.id);
      if (user) {
        // Release the nickname
        await releaseNickname(user.nickname);
        
        io.to(`room_${user.roomId}`).emit("user_left", {
          nickname: user.nickname,
          userId: socket.id,
          timestamp: new Date(),
        });
        users.delete(socket.id);
        console.log(`👋 ${user.nickname} left room ${user.roomId}`);
      }
    });
  });

  return io;
}
