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

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const result = await signupMutation.mutateAsync({ email, nickname, password });
      if (result.success) {
        setSuccess("Compte créé! Un email de confirmation a été envoyé.");
        setTimeout(() => setLocation("/login"), 2000);
      } else {
        setError(result.error || "Signup failed");
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <Link href="/">
            <Button className="border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400/10 rounded-lg px-4 py-2 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="w-full max-w-md px-6">
            <div className="relative bg-gradient-to-br from-purple-900/50 via-slate-900/70 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-400/50 shadow-2xl" style={{ boxShadow: '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' }}>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-6">
                {isLogin ? "Login" : "Create Account"}
              </h2>

              {error && (
                <div className="bg-red-900/40 border-2 border-red-400/60 text-red-200 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/40 border-2 border-green-400/60 text-green-200 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    {isLogin ? "Email ou Pseudo" : "Email"}
                  </label>
                  <Input
                    type={isLogin ? "text" : "email"}
                    placeholder={isLogin ? "email@example.com ou pseudo" : "your@email.com"}
                    value={isLogin ? identifier : email}
                    onChange={(e) => isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                    className="bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Pseudo
                  </label>
                  <Input
                    placeholder="Ton pseudo unique"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
                    required
                    minLength={3}
                  />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-300 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/30 transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-900 hover:shadow-xl hover:shadow-cyan-400/50 rounded-xl py-3 font-bold text-lg transition-all"
                  disabled={signupMutation.isPending || loginMutation.isPending}
                >
                  {isLogin ? "Login" : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-cyan-400/30 text-center space-y-3">
                {isLogin ? (
                  <>
                    <p className="text-slate-300">Don't have an account?</p>
                    <Link href="/signup">
                      <Button variant="link" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                        Sign up here
                      </Button>
                    </Link>
                    <p className="text-slate-300 pt-2">Forgot your password?</p>
                    <Link href="/forgot-password">
                      <Button variant="link" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                        Reset it here
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300">Already have an account?</p>
                    <Link href="/login">
                      <Button variant="link" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                        Login here
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
