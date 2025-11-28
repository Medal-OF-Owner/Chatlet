import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    try {
      const result = await trpc.auth.requestPasswordReset.mutate({ email });
      if (result.success) {
        setSent(true);
        toast.success("Email de réinitialisation envoyé!");
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-4">Email envoyé ✅</h1>
          <p className="text-slate-300 mb-6">
            Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
            Clique sur le lien dans ton email pour réinitialiser ton mot de passe.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Retour au login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
        <p className="text-slate-400 mb-6">
          Saisis ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="ton.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Tu te souviens de ton mot de passe ?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Retour au login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
