import { useState, useEffect, useRef } from "react";

import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { WebRTCManager } from "@/lib/webrtc";
import { generateRandomNickname } from "@shared/utils";
import { useGuestNickname } from "@/hooks/useGuestNickname";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/Avatar";

import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { Send, Video, Mic, Home, Edit2, Check, X, Smile } from "lucide-react";

interface Message {
  id?: number;
  roomId?: number;
  nickname: string;
  content: string;
  fontFamily: string | null;
  textColor?: string | null;
  profileImage?: string | null;
  createdAt: Date;
}

interface RemoteUser {
  id: string;
  nickname: string;
  stream?: MediaStream;
}

export default function Chat() {
  const { room } = useParams<{ room: string }>();
  const [nickname, setNickname] = useState("");
  const [displayNickname, setDisplayNickname] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [fontFamily, setFontFamily] = useState("Courier New");
  const [textColor, setTextColor] = useState("#ffffff");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map());
  const [connected, setConnected] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [usedNicknames, setUsedNicknames] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const socketRef = useRef(getSocket());
  const webrtcRef = useRef<WebRTCManager | null>(null);

  const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "😢", "😡", "🔥", "💯", "👍", "👏", "🎉", "🎊", "🚀", "💡", "⭐", "🌟", "💪", "🙌"];

  const createRoomMutation = trpc.chat.getOrCreateRoom.useMutation();



  const { user, isAuthLoading } = useAuth();
  const { nickname: guestNickname, isLoading: isGuestLoading } = useGuestNickname();

  // Initialize room and set nickname
  useEffect(() => {
    if (!room || isAuthLoading || isGuestLoading) return;

    const initRoom = async () => {
      try {
        const result = await createRoomMutation.mutateAsync({ slug: room });
        setRoomId(result.id);

        const finalNickname = user ? user.nickname : guestNickname;

        if (finalNickname) {
          setNickname(finalNickname);
          setDisplayNickname(finalNickname);
        }
      } catch (error) {
        console.error("Failed to create/get room:", error);
      }
    };

    initRoom();
  }, [room, isAuthLoading, isGuestLoading, user, guestNickname]);

  // Setup Socket.IO and WebRTC
  useEffect(() => {
    // Get fresh socket instance (in case it was disconnected)
    const socket = getSocket();
    socketRef.current = socket;

    const handleJoinRoom = () => {
      if (roomId && nickname) {
        console.log("🚪 Joining room:", { roomId, nickname });
        const profileImageToSend = user ? user.profileImage : profileImage;
        socket.emit("join_room", { roomId, nickname, profileImage: profileImageToSend });

        // Initialize WebRTC manager
        if (!webrtcRef.current && roomId) {
          webrtcRef.current = new WebRTCManager(socket, socket.id || "", roomId);
        }
      }
    };

    socket.on("connect", () => {
      console.log("Connected to Socket.IO");
      setConnected(true);
      handleJoinRoom();
    });

    // If already connected (e.g., component remounted), join the room immediately
    if (socket.connected) {
      setConnected(true);
      handleJoinRoom();
    }

    socket.on("nickname_taken", () => {
      console.log("❌ Nickname is already taken, please choose another");
      alert("This nickname is already taken! Please choose a different one.");
      setEditingNickname(true);
      setNewNickname(nickname);
    });

    socket.on("message_history", (msgs: Message[]) => {
      console.log("📜 Message history received:", msgs.length, "messages");
      setMessages(msgs);
      const nicks = new Set(msgs.map(m => m.nickname).filter(n => n !== "System"));
      setUsedNicknames(nicks);
    });

    socket.on("new_message", (msg: Message & { profileImage?: string }) => {
      console.log("📩 RECEIVED new_message:", msg);

      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) =>
            m.nickname === msg.nickname &&
            m.content === msg.content &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 5000
        );

        if (isDuplicate) {
          console.log("⚠️ Skipping duplicate message");
          return prev;
        }

        return [...prev, msg];
      });
    });
        
            socket.on("user_joined", (data: { nickname: string; timestamp: Date; userId?: string }) => {
              setUsedNicknames((prev) => new Set([...Array.from(prev), data.nickname]));
              if (data.userId) {
                const userId = data.userId as string;
                setRemoteUsers((prev) => {
                  const updated = new Map(Array.from(prev));
                  updated.set(userId, { id: userId, nickname: data.nickname });
                  return updated;
                });
        
                // The user who joins is NOT the initiator for existing users.
                // Existing users (who receive this event) are the initiators for the new user.
                // This is correct: webrtcRef.current.createPeerConnection(userId, data.nickname, true);
                if (webrtcRef.current) {
                  webrtcRef.current.createPeerConnection(userId, data.nickname, true);
                }
              }
        
              setMessages((prev) => [
                ...prev,
                {
                  nickname: "System",
                  content: `${data.nickname} joined the room`,
                  fontFamily: null,
                  createdAt: new Date(data.timestamp),
                },
              ]);
            });

      socket.on("existing_users", (users: { nickname: string; userId: string }[]) => {
        console.log("👥 Existing users received:", users);
        users.forEach((user) => {
          setRemoteUsers((prev) => {
            const updated = new Map(Array.from(prev));
            updated.set(user.userId, { id: user.userId, nickname: user.nickname });
            return updated;
          });

          // The newly joined user (who receives this event) is NOT the initiator for existing users.
          // The existing users have already initiated the connection (they are the initiators).
          // The newly joined user must NOT be the initiator, so we pass 'false'.
          if (webrtcRef.current) {
            webrtcRef.current.createPeerConnection(user.userId, user.nickname, false);
          }
        });
      });

    socket.on("user_left", (data: { nickname: string; timestamp: Date; userId?: string }) => {
      setUsedNicknames((prev) => {
        const updated = new Set(Array.from(prev));
        updated.delete(data.nickname);
        return updated;
      });
      if (data.userId) {
        setRemoteUsers((prev) => {
          const updated = new Map(Array.from(prev));
          updated.delete(data.userId as string);
          return updated;
        });
      }
      setMessages((prev) => [
        ...prev,
        {
          nickname: "System",
          content: `${data.nickname} left the room`,
          fontFamily: null,
          createdAt: new Date(data.timestamp),
        },
      ]);
    });

    socket.on("nickname_changed", (data: { oldNickname: string; newNickname: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: "System",
          content: `${data.oldNickname} changed nickname to ${data.newNickname}`,
          fontFamily: null,
          createdAt: new Date(),
        },
      ]);
      setUsedNicknames((prev) => {
        const updated = new Set(Array.from(prev));
        updated.delete(data.oldNickname);
        updated.add(data.newNickname);
        return updated;
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO");
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("message_history");
      socket.off("new_message");
      socket.off("user_joined");
      socket.off("existing_users");
      socket.off("user_left");
      socket.off("nickname_changed");
      socket.off("nickname_taken");
      socket.off("disconnect");
    };
  }, [roomId, nickname, user, profileImage]);

  // Disconnect socket only when component fully unmounts
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  // Handle camera and microphone
  useEffect(() => {
    if (cameraOn || micOn) {
      navigator.mediaDevices
        .getUserMedia({ video: cameraOn, audio: micOn })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          if (webrtcRef.current) {
            webrtcRef.current.setLocalStream(stream);
          }
        })
        .catch((error) => {
          console.error("Error accessing media:", error);
          setCameraOn(false);
          setMicOn(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      if (webrtcRef.current) {
        webrtcRef.current.clearLocalStream();
      }
    }
  }, [cameraOn, micOn]);

  // Monitor WebRTC streams
  useEffect(() => {
    if (!webrtcRef.current) return;

    const interval = setInterval(() => {
      const connections = webrtcRef.current?.getAllPeerConnections() || [];

      setRemoteUsers((prev) => {
        const updated = new Map(Array.from(prev));

        for (const connection of connections) {
          if (connection.stream) {
            const user = updated.get(connection.peerId);
            if (user) {
              user.stream = connection.stream;
              updated.set(connection.peerId, user);
            }
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔥 SENDING MESSAGE:", { roomId, displayNickname, message, connected });

    if (!roomId || !displayNickname.trim() || !message.trim()) {
      console.log("❌ BLOCKED:", { roomId, displayNickname, message });
      return;
    }

    const socket = socketRef.current;
    console.log("📤 Emitting to socket:", socket.connected);

    // Stockage Base64 local pour éviter le besoin de S3/Forge API
    const profileImageToSend = user ? user.profileImage : profileImage;
    const finalProfileImage = profileImageToSend && profileImageToSend.startsWith("data:") ? profileImageToSend : null;

    const optimisticMessage: Message = {
      roomId,
      nickname: displayNickname.trim(),
      content: message.trim(),
      fontFamily,
      textColor,
      profileImage: finalProfileImage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send_message", {
      roomId,
      nickname: displayNickname.trim(),
      content: message.trim(),
      fontFamily,
      textColor,
      profileImage: finalProfileImage,
    });

    setMessage("");
  };

  const handleChangeNickname = () => {
    if (!newNickname.trim()) {
      setEditingNickname(false);
      return;
    }

    if (usedNicknames.has(newNickname.trim())) {
      alert("Ce pseudo est déjà utilisé dans cette room.");
      return;
    }

    const oldNickname = displayNickname;
    const socket = socketRef.current;

    socket.emit("change_nickname", {
      roomId,
      oldNickname,
      newNickname: newNickname.trim(),
    });

    // Mise à jour du sessionStorage pour la persistance
    sessionStorage.setItem("sessionNickname", newNickname.trim());

    setNickname(newNickname.trim());
    setDisplayNickname(newNickname.trim());
    setNewNickname("");
    setEditingNickname(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (!nickname) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/space-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        <Card className="relative z-10 bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl border-2 border-cyan-400/50 p-8 w-full max-w-md rounded-3xl shadow-2xl" style={{ boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-6">Loading...</h1>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900/60 to-transparent border-b border-cyan-400/30 p-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-semibold">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">/{room}</h1>
            <span className={`text-sm font-semibold ${connected ? "text-cyan-400" : "text-red-400"}`}>
              {connected ? "● Connected" : "● Disconnected"}
            </span>
          </div>

          {/* Nickname Display and Edit */}
          <div className="flex items-center gap-2">
            {editingNickname ? (
              <>
                <Input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="New nickname"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-40"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleChangeNickname}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingNickname(false);
                    setNewNickname("");
                  }}
                  className="text-slate-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Avatar src={profileImage} nickname={displayNickname} size="md" />
                <span className="text-slate-300">{displayNickname}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingNickname(true);
                    setNewNickname(displayNickname);
                  }}
                  className="text-slate-300 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-80px)]">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Messages */}
          <Card className="flex-1 bg-gradient-to-br from-purple-900/40 via-slate-900/50 to-slate-900/40 backdrop-blur-md border-2 border-cyan-400/40 p-4 overflow-y-auto rounded-2xl shadow-lg" style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)' }}>
            <div className="space-y-4">
              {!messages || messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                (messages as Message[]).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 break-words ${
                      msg.nickname === "System"
                        ? "bg-slate-700 text-slate-300 text-center text-sm italic"
                        : "bg-slate-700"
                    }`}
                  >
                    {msg.nickname !== "System" && (
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar src={msg.profileImage} nickname={msg.nickname} size="sm" />
                          <span className="font-semibold text-blue-400">
                            {msg.nickname}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <p
                      className="text-white"
                      style={{ 
                        fontFamily: msg.fontFamily || "sans-serif",
                        color: msg.textColor || "#ffffff"
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>

          {/* Input Area */}
          <Card className="bg-gradient-to-br from-purple-900/40 via-slate-900/50 to-slate-900/40 backdrop-blur-md border-2 border-cyan-400/40 p-4 rounded-2xl shadow-lg" style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)' }}>
            <ProfileImageUpload
              nickname={displayNickname}
              currentImage={profileImage}
              onImageChange={setProfileImage}

            />
            <form onSubmit={handleSendMessage} className="space-y-3 mt-3">
              <div className="flex gap-2">
                

                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 p-0 border-none cursor-pointer rounded-full overflow-hidden"
                  title="Choisir la couleur du texte"
                />
              </div>

              <div className="flex gap-2 relative">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 flex-1"
                  style={{ color: textColor }}
                />
                <Button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!connected}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {showEmojiPicker && (
                <div className="bg-slate-700 border border-slate-600 rounded p-3 grid grid-cols-10 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:bg-slate-600 rounded p-1 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Media Controls and Videos */}
        <div className="flex flex-col gap-4">
          {/* Media Controls */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-white font-semibold mb-4">Media</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setCameraOn(!cameraOn)}
                variant={cameraOn ? "default" : "outline"}
                className="w-full"
              >
                <Video className="w-4 h-4 mr-2" />
                Camera {cameraOn ? "ON" : "OFF"}
              </Button>
              <Button
                onClick={() => setMicOn(!micOn)}
                variant={micOn ? "default" : "outline"}
                className="w-full"
              >
                <Mic className="w-4 h-4 mr-2" />
                Mic {micOn ? "ON" : "OFF"}
              </Button>
            </div>
          </Card>

          {/* Your Video */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-white font-semibold mb-2">Your Video</h3>
            <div className="bg-slate-900 rounded aspect-video flex items-center justify-center overflow-hidden">
              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-500 text-sm">Camera off</span>
              )}
            </div>
          </Card>

          {/* Remote Videos */}
          {remoteUsers.size > 0 && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="text-white font-semibold mb-2">
                Users ({remoteUsers.size})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(remoteUsers.values()).map((user) => (
                  <div key={user.id} className="space-y-1">
                    <p className="text-sm text-slate-300">{user.nickname}</p>
                    <div className="bg-slate-900 rounded aspect-video flex items-center justify-center overflow-hidden">
                      {user.stream ? (
                        <video
                          ref={(el) => {
                            if (el) remoteVideoRefs.current.set(user.id, el);
                          }}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                          onLoadedMetadata={(e) => {
                            const video = e.currentTarget;
                            if (user.stream) {
                              video.srcObject = user.stream;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-slate-500 text-xs">No video</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
