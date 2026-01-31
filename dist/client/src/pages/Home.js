import { jsx as _jsx, jsxs as _jsxs } from "same-runtime/dist/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Video, Lock, Eye, CheckCircle2, User, Check, X } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { useGuestNickname } from "@/hooks/useGuestNickname";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
export default function Home() {
    const [roomName, setRoomName] = useState("");
    const { nickname, isLoading: nicknameLoading, updateNickname } = useGuestNickname();
    const { user, logout, isLoggingOut } = useAuth();
    const [profileImage, setProfileImage] = useState(typeof window !== 'undefined' ? localStorage.getItem("profileImage") : null);
    const [tempNickname, setTempNickname] = useState(nickname || "");
    // Sync tempNickname with nickname when it changes (e.g., on initial load or after save)
    useEffect(() => {
        if (nickname && tempNickname === "") {
            setTempNickname(nickname);
        }
    }, [nickname]);
    const [nicknameError, setNicknameError] = useState(null);
    // Check for local login session
    const sessionNickname = typeof window !== 'undefined' ? sessionStorage.getItem("sessionNickname") : null;
    const isUserLoggedIn = !!user || !!sessionNickname;
    const displayNickname = sessionNickname || user?.name || nickname;
    const checkNicknameQuery = trpc.guest.checkNicknameAvailable.useQuery({ nickname: tempNickname }, { enabled: false });
    const handleSaveNickname = async () => {
        setNicknameError(null); // Clear previous error
        if (!tempNickname.trim() || tempNickname.length < 3) {
            setNicknameError("Nickname must be at least 3 characters");
            return;
        }
        if (tempNickname === nickname) {
            return;
        }
        const result = await checkNicknameQuery.refetch();
        if (result.data?.available) {
            updateNickname(tempNickname);
            sessionStorage.setItem("sessionNickname", tempNickname); // Persistance du pseudo
            toast.success("Nickname updated!");
        }
        else {
            setNicknameError("This nickname is already taken or too similar to an existing one");
        }
    };
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden", style: {
            backgroundImage: 'url(/space-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsx("style", { children: `
        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .glow-blob { animation: glow 8s ease-in-out infinite; }
        .float { animation: float 6s ease-in-out infinite; }
        .glow-border {
          border: 2px solid;
          border-image: linear-gradient(135deg, #00d9ff, #ff00ff) 1;
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2);
        }
      ` }), _jsx("div", { className: "absolute inset-0 pointer-events-none", children: [...Array(50)].map((_, i) => (_jsx("div", { className: "absolute w-1 h-1 bg-white rounded-full", style: {
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.7 + 0.3,
                        animation: `glow ${Math.random() * 3 + 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                    } }, i))) }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-6", children: [_jsx("div", { className: "w-12 h-12 float", children: _jsxs("svg", { className: "w-full h-full", viewBox: "0 0 40 40", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M10 8L20 15L10 22", stroke: "#00d9ff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M20 8L30 15L20 22", stroke: "#00d9ff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M10 22L20 29L10 36", stroke: "#00d9ff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M20 22L30 29L20 36", stroke: "#ff00ff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }) }), isUserLoggedIn ? (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileImageUpload, { nickname: user?.name || displayNickname || "Guest", currentImage: user?.profileImage || profileImage, onImageChange: setProfileImage }), _jsx("span", { className: "text-cyan-300 font-semibold text-lg hidden sm:inline", children: displayNickname }), _jsx(Button, { onClick: () => {
                                            sessionStorage.removeItem("sessionNickname");
                                            logout();
                                        }, disabled: isLoggingOut, className: "border-2 border-red-400 bg-transparent text-red-400 hover:bg-red-400/10 rounded-lg px-4 py-2 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-400/50", children: "Logout" })] })) : (_jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { href: "/login", children: _jsx(Button, { className: "border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-lg px-8 py-2 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-400/50", children: "Login" }) }), _jsx(Link, { href: "/signup", children: _jsx(Button, { className: "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-lg hover:shadow-cyan-400/50 rounded-lg px-8 py-2 font-semibold transition-all duration-300", children: "Sign Up" }) })] }))] }), _jsx("div", { className: "flex items-center justify-center min-h-[calc(100vh-100px)] px-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl", children: [_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" }), _jsxs("div", { className: "relative bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-12 glow-border", children: [_jsx("h2", { className: "text-4xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4", children: "Join a Room" }), _jsx("p", { className: "text-slate-200 mb-10 text-lg sm:text-xl", children: "Connect instantly with friends or colleagues." }), _jsxs("form", { className: "space-y-6", children: [isUserLoggedIn ? (
                                                        // Logged-in User Nickname
                                                        _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Your Nickname" }), _jsxs("div", { className: "flex items-center gap-2 bg-slate-800/60 border-2 border-cyan-400/60 rounded-xl px-4 py-3 backdrop-blur-sm", children: [_jsx(User, { className: "w-5 h-5 text-cyan-400" }), _jsx("span", { className: "flex-1 text-cyan-300 font-semibold text-lg", children: displayNickname || "Guest" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Logged in as a registered user." })] })) : (
                                                        // Guest Nickname Logic
                                                        !nicknameLoading && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Your Nickname" }), nicknameError && (_jsx("p", { className: "text-red-400 text-sm font-semibold mb-2", children: nicknameError })), _jsxs("div", { className: "flex items-center gap-2 bg-slate-800/60 border-2 border-cyan-400/60 rounded-xl px-4 py-3 backdrop-blur-sm", children: [_jsx(User, { className: "w-5 h-5 text-cyan-400" }), _jsx(Input, { value: tempNickname, onChange: (e) => setTempNickname(e.target.value), className: "flex-1 bg-transparent border-0 text-cyan-300 text-lg font-semibold p-0 focus-visible:ring-0", placeholder: "Nickname", onKeyDown: (e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleSaveNickname();
                                                                                }
                                                                            } }), tempNickname && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { type: "button", onClick: handleSaveNickname, className: "h-7 w-7 p-0 bg-green-500/80 hover:bg-green-500 text-white rounded-full transition-all", title: "Save Nickname", children: _jsx(Check, { className: "h-4 w-4" }) }), _jsx(Button, { type: "button", onClick: () => setTempNickname(""), className: "h-7 w-7 p-0 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all", title: "Clear Nickname", children: _jsx(X, { className: "h-4 w-4" }) })] }))] })] }))), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Room Name" }), _jsx("input", { placeholder: "Enter room name...", value: roomName, onChange: (e) => setRoomName(e.target.value), className: "w-full bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-300 rounded-xl px-6 py-5 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/50 transition-all backdrop-blur-sm text-lg font-semibold" })] }), roomName.trim() ? (_jsx(Link, { href: `/room/${roomName}`, children: _jsx(Button, { className: "w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-2xl hover:shadow-cyan-400/70 rounded-xl py-5 font-bold text-xl transition-all duration-300 transform hover:scale-105", children: "Enter Room \u2192" }) })) : (_jsx(Button, { disabled: true, className: "w-full bg-slate-700/50 text-slate-500 rounded-xl py-5 font-bold text-xl cursor-not-allowed", children: "Enter Room \u2192" }))] })] })] }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" }), _jsxs("div", { className: "relative bg-gradient-to-br from-slate-900/30 via-purple-900/20 to-slate-900/30 backdrop-blur-xl rounded-3xl p-6 sm:p-12 glow-border", children: [_jsx("h2", { className: "text-3xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-10", children: "Features" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(MessageSquare, { className: "w-6 h-6 text-cyan-400 flex-shrink-0" }), _jsx("span", { className: "text-slate-300 text-lg", children: "Real-time messaging" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Video, { className: "w-6 h-6 text-cyan-400 flex-shrink-0" }), _jsx("span", { className: "text-slate-300 text-lg", children: "Video & audio calls" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Lock, { className: "w-6 h-6 text-cyan-400 flex-shrink-0" }), _jsx("span", { className: "text-slate-300 text-lg", children: "Custom room creation" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Eye, { className: "w-6 h-6 text-cyan-400 flex-shrink-0" }), _jsx("span", { className: "text-slate-300 text-lg", children: "No account required" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(CheckCircle2, { className: "w-6 h-6 text-cyan-400 flex-shrink-0" }), _jsx("span", { className: "text-slate-300 text-lg", children: "Completely anonymous" })] })] })] })] })] }) }), _jsx("div", { className: "absolute bottom-6 right-8 text-slate-400 text-sm font-semibold", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-6 h-6 text-cyan-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" }) }), _jsx("span", { children: "OG -2025" })] }) })] })] }));
}
