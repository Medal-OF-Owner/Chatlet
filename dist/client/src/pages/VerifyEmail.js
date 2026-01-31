import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "same-runtime/dist/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
export default function VerifyEmail() {
    const [, navigate] = useLocation();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const hasVerified = useRef(false);
    const verifyMutation = trpc.auth.verifyEmail.useMutation();
    useEffect(() => {
        const verify = async () => {
            if (hasVerified.current)
                return;
            hasVerified.current = true;
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            if (!token) {
                setStatus("error");
                setMessage("Lien de vérification invalide");
                return;
            }
            try {
                const result = await verifyMutation.mutateAsync({ token });
                if (result.success) {
                    setStatus("success");
                    setMessage("Email vérifié avec succès!");
                    toast.success("Email confirmé ! Tu peux maintenant te connecter.");
                    setTimeout(() => navigate("/login"), 2000);
                }
                else {
                    setStatus("error");
                    setMessage(result.error || "La vérification a échoué");
                    toast.error("Lien de vérification invalide ou expiré");
                }
            }
            catch (error) {
                setStatus("error");
                setMessage("Une erreur est survenue");
                toast.error("Erreur lors de la vérification");
            }
        };
        verify();
    }, []);
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden flex items-center justify-center p-4", style: {
            backgroundImage: 'url(/space-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40 pointer-events-none" }), _jsxs("div", { className: "relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl text-center", style: { boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }, children: [status === "loading" && (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" }), _jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "V\u00E9rification en cours..." }), _jsx("p", { className: "text-slate-300", children: "On confirme ton email..." })] })), status === "success" && (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "Email v\u00E9rifi\u00E9 \u2705" }), _jsx("p", { className: "text-slate-200", children: message }), _jsx("p", { className: "text-slate-400 text-sm mt-4", children: "Redirection vers le login..." })] })), status === "error" && (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "Erreur \u274C" }), _jsx("p", { className: "text-slate-300 mb-6", children: message }), _jsx("button", { onClick: () => window.location.href = "/login", className: "text-cyan-400 hover:text-cyan-300 font-semibold", children: "Retour au login" })] }))] })] }));
}
