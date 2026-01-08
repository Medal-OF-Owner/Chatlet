import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    const verify = async () => {
      if (hasVerified.current) return;
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
        } else {
          setStatus("error");
          setMessage(result.error || "La vérification a échoué");
          toast.error("Lien de vérification invalide ou expiré");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Une erreur est survenue");
        toast.error("Erreur lors de la vérification");
      }
    };

    verify();
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl text-center" style={{ boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }}>
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">Vérification en cours...</h1>
            <p className="text-slate-300">On confirme ton email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">Email vérifié ✅</h1>
            <p className="text-slate-200">{message}</p>
            <p className="text-slate-400 text-sm mt-4">Redirection vers le login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">Erreur ❌</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = "/login"}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Retour au login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
