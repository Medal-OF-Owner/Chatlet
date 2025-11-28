import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, CheckCircle2, Video, Lock, Eye } from "lucide-react";

export default function Home() {
  const [roomName, setRoomName] = useState("");

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Starfield effect */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center transform -rotate-45">
              <div className="transform rotate-45 text-white font-bold text-lg">S</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button className="border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-lg px-6">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 rounded-lg px-6 font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Section - Join Room */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-400/20 transition-all duration-300">
              <h2 className="text-4xl font-bold text-cyan-400 mb-3">Join a Room</h2>
              <p className="text-slate-300 mb-8">Connect instantly with friends or colleagues.</p>

              <form className="space-y-6">
                <div>
                  <input
                    placeholder="24px"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-cyan-400/30 text-cyan-400 placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {roomName.trim() ? (
                  <Link href={`/room/${roomName}`}>
                    <Button className="w-full bg-cyan-400 text-slate-900 hover:bg-cyan-300 rounded-lg py-3 font-semibold text-lg">
                      Enter Room
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full bg-slate-700 text-slate-400 rounded-lg py-3 font-semibold text-lg cursor-not-allowed">
                    Enter Room
                  </Button>
                )}
              </form>
            </div>
          </div>

          {/* Right Section - Features */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-900/40 to-purple-900/40 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-400/20 transition-all duration-300">
              <h2 className="text-4xl font-bold text-cyan-400 mb-8">Features</h2>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300">Real-time messaging</span>
                </div>
                <div className="flex items-center gap-4">
                  <Video className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300">Video & audio calls</span>
                </div>
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300">Custom room creation</span>
                </div>
                <div className="flex items-center gap-4">
                  <Eye className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300">No account required</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300">Completely anonymous</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 right-6 text-slate-500 text-sm">
          Owner - Mark Landers 2025
        </div>
      </div>
    </div>
  );
}
