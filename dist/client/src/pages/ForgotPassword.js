import { jsx as _jsx, jsxs as _jsxs } from "same-runtime/dist/jsx-runtime";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export default function ForgotPassword() {
    const [, navigate] = useLocation();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const resetMutation = trpc.auth.requestPasswordReset.useMutation();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Veuillez entrer votre email");
            return;
        }
        try {
            const result = await resetMutation.mutateAsync({ email });
            if (result.success) {
                setSent(true);
                toast.success("Email de réinitialisation envoyé!");
            }
            else {
                toast.error(result.error || "Une erreur est survenue");
            }
        }
        catch (error) {
            toast.error("Erreur lors de l'envoi de l'email");
        }
    };
    if (sent) {
        return (_jsxs("div", { className: "min-h-screen relative overflow-hidden flex items-center justify-center p-4", style: {
                backgroundImage: 'url(/space-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsxs("div", { className: "relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl", style: { boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }, children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4", children: "Email envoy\u00E9 \u2705" }), _jsxs("p", { className: "text-slate-200 mb-6", children: ["Nous avons envoy\u00E9 un lien de r\u00E9initialisation \u00E0 ", _jsx("strong", { children: email }), ". Clique sur le lien dans ton email pour r\u00E9initialiser ton mot de passe."] }), _jsx(Button, { onClick: () => navigate("/login"), className: "w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold", children: "Retour au login" })] })] }));
    }
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden flex items-center justify-center p-4", style: {
            backgroundImage: 'url(/space-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsxs("div", { className: "relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl", style: { boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }, children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "Mot de passe oubli\u00E9 ?" }), _jsx("p", { className: "text-slate-300 mb-6", children: "Saisis ton email et nous t'enverrons un lien pour r\u00E9initialiser ton mot de passe." }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-cyan-300 mb-2", children: "Email" }), _jsx(Input, { type: "email", placeholder: "ton.email@example.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: resetMutation.isPending, className: "w-full bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all" })] }), _jsx(Button, { type: "submit", disabled: resetMutation.isPending, className: "w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold", children: resetMutation.isPending ? "Envoi en cours..." : "Envoyer le lien" })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-cyan-400/30", children: _jsxs("p", { className: "text-slate-300 text-sm text-center", children: ["Tu te souviens de ton mot de passe ?", " ", _jsx("button", { onClick: () => navigate("/login"), className: "text-cyan-400 hover:text-cyan-300 font-semibold", children: "Retour au login" })] }) })] })] }));
}
