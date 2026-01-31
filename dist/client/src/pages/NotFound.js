import { jsx as _jsx, jsxs as _jsxs } from "same-runtime/dist/jsx-runtime";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
export default function NotFound() {
    const [, setLocation] = useLocation();
    const handleGoHome = () => {
        setLocation("/");
    };
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden w-full flex items-center justify-center", style: {
            backgroundImage: 'url(/space-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsxs("div", { className: "relative z-10 w-full max-w-lg mx-4 bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl text-center", style: { boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }, children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-cyan-400/20 rounded-full animate-pulse" }), _jsx(AlertCircle, { className: "relative h-16 w-16 text-cyan-400" })] }) }), _jsx("h1", { className: "text-6xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "404" }), _jsx("h2", { className: "text-2xl font-bold text-slate-200 mb-4", children: "Page Not Found" }), _jsxs("p", { className: "text-slate-300 mb-8 leading-relaxed", children: ["Sorry, the page you are looking for doesn't exist.", _jsx("br", {}), "It may have been moved or deleted."] }), _jsx("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: _jsxs(Button, { onClick: handleGoHome, className: "bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl px-6 py-3 font-bold transition-all duration-200", children: [_jsx(Home, { className: "w-4 h-4 mr-2" }), "Go Home"] }) })] })] }));
}
