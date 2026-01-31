import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "same-runtime/dist/jsx-runtime";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
export default function Auth() {
    const [location, setLocation] = useLocation();
    const isLogin = location === "/login";
    const [identifier, setIdentifier] = useState(""); // Utilisé pour email ou pseudo
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState(""); // Reste pour l'inscription
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const signupMutation = trpc.auth.signup.useMutation();
    const loginMutation = trpc.auth.login.useMutation();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (isLogin) {
            const result = await loginMutation.mutateAsync({ identifier, password });
            if (result.success) {
                const nickname = result.account?.nickname;
                if (nickname) {
                    sessionStorage.setItem("sessionNickname", nickname);
                }
                setSuccess("Connexion réussie! Pseudo: " + nickname);
                setTimeout(() => setLocation("/"), 2000);
            }
            else {
                setError(result.error || "Erreur de connexion");
            }
        }
        else {
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
            const result = await signupMutation.mutateAsync({ email, nickname, password });
            if (result.success) {
                setSuccess("Compte créé! Un email de confirmation a été envoyé.");
                setTimeout(() => setLocation("/login"), 2000);
            }
            else {
                setError(result.error || "Signup failed");
            }
        }
    };
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden", style: {
            backgroundImage: 'url(/space-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "flex items-center justify-between px-8 py-6", children: _jsx(Link, { href: "/", children: _jsxs(Button, { className: "border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-lg px-4 py-2 gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back"] }) }) }), _jsx("div", { className: "flex items-center justify-center min-h-[calc(100vh-100px)]", children: _jsx("div", { className: "w-full max-w-md px-6", children: _jsxs("div", { className: "relative bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl", style: { boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }, children: [_jsx("h2", { className: "text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-6", children: isLogin ? "Login" : "Create Account" }), error && (_jsx("div", { className: "bg-red-900/40 border-2 border-red-400/60 text-red-200 px-4 py-3 rounded-lg mb-4", children: error })), success && (_jsx("div", { className: "bg-green-900/40 border-2 border-green-400/60 text-green-200 px-4 py-3 rounded-lg mb-4", children: success })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: isLogin ? "Email ou Pseudo" : "Email" }), _jsx(Input, { type: isLogin ? "text" : "email", placeholder: isLogin ? "email@example.com ou pseudo" : "your@email.com", value: isLogin ? identifier : email, onChange: (e) => isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value), className: "bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all", required: true })] }), !isLogin && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Pseudo" }), _jsx(Input, { placeholder: "Ton pseudo unique", value: nickname, onChange: (e) => setNickname(e.target.value), className: "bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all", required: true, minLength: 3 })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Password" }), _jsx(Input, { type: "password", placeholder: "At least 6 characters", value: password, onChange: (e) => setPassword(e.target.value), className: "bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all", required: true, minLength: 6 })] }), _jsx(Button, { type: "submit", className: "w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold text-lg transition-all", disabled: signupMutation.isPending || loginMutation.isPending, children: isLogin ? "Login" : "Create Account" })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-cyan-400/30 text-center space-y-3", children: isLogin ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-slate-300", children: "Don't have an account?" }), _jsx(Link, { href: "/signup", children: _jsx(Button, { variant: "link", className: "text-cyan-400 hover:text-cyan-300 font-semibold", children: "Sign up here" }) }), _jsx("p", { className: "text-slate-300 pt-2", children: "Forgot your password?" }), _jsx(Link, { href: "/forgot-password", children: _jsx(Button, { variant: "link", className: "text-cyan-400 hover:text-cyan-300 font-semibold", children: "Reset it here" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-slate-300", children: "Already have an account?" }), _jsx(Link, { href: "/login", children: _jsx(Button, { variant: "link", className: "text-cyan-400 hover:text-cyan-300 font-semibold", children: "Login here" }) })] })) })] }) }) })] })] }));
}
