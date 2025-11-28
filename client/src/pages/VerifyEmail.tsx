import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Lien de vérification invalide");
        return;
      }

      try {
        const result = await trpc.auth.verifyEmail.mutate({ token });
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Vérification en cours...</h1>
            <p className="text-slate-300">On confirme ton email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Email vérifié ✅</h1>
            <p className="text-slate-300">{message}</p>
            <p className="text-slate-400 text-sm mt-4">Redirection vers le login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Erreur ❌</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = "/login"}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Retour au login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
