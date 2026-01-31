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

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  if (sent) {
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
        <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl" style={{ boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4">Email envoyé ✅</h1>
          <p className="text-slate-200 mb-6">
            Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
            Clique sur le lien dans ton email pour réinitialiser ton mot de passe.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold"
          >
            Retour au login
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl" style={{ boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">Mot de passe oublié ?</h1>
        <p className="text-slate-300 mb-6">
          Saisis ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="ton.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={resetMutation.isPending}
              className="w-full bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold"
          >
            {resetMutation.isPending ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cyan-400/30">
          <p className="text-slate-300 text-sm text-center">
            Tu te souviens de ton mot de passe ?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Retour au login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
