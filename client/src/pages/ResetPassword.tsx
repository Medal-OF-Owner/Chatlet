import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (!resetToken) {
      toast.error("Lien de réinitialisation invalide");
      navigate("/login");
      return;
    }
    setToken(resetToken);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !passwordConfirm) {
      toast.error("Veuillez entrer votre mot de passe");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const result = await resetMutation.mutateAsync({
        token,
        newPassword: password,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Mot de passe réinitialisé avec succès!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation");
    }
  };

  if (success) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4">Succès ✅</h1>
          <p className="text-slate-200 mb-6">
            Ton mot de passe a été réinitialisé avec succès!
          </p>
          <p className="text-slate-400 text-sm">Redirection vers le login...</p>
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-2">Réinitialiser le mot de passe</h1>
        <p className="text-slate-300 mb-6">
          Entre ton nouveau mot de passe ci-dessous.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={resetMutation.isPending}
              className="w-full bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              placeholder="Confirme ton mot de passe"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={resetMutation.isPending}
              className="w-full bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold"
          >
            {resetMutation.isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}
