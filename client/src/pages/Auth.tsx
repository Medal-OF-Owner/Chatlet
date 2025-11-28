import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function Auth() {
  const [location, setLocation] = useLocation();
  const isLogin = location === "/login";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signupMutation = trpc.auth.signup.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLogin) {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        setSuccess("Login successful! Your pseudo: " + result.account?.nickname);
        setTimeout(() => setLocation("/"), 2000);
      } else {
        setError(result.error || "Login failed");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">Chat App</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-6 pt-12">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isLogin ? "Login" : "Create Account"}
          </h2>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nickname
                </label>
                <Input
                  placeholder="Your unique nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  minLength={3}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={signupMutation.isPending || loginMutation.isPending}
            >
              {isLogin ? "Login" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {isLogin ? (
              <>
                <p className="text-slate-400">Don't have an account?</p>
                <Link href="/signup">
                  <Button variant="link" className="text-blue-400 hover:text-blue-300">
                    Sign up here
                  </Button>
                </Link>
                <p className="text-slate-400 pt-4">Forgot your password?</p>
                <Link href="/forgot-password">
                  <Button variant="link" className="text-yellow-400 hover:text-yellow-300">
                    Reset it here
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-400">Already have an account?</p>
                <Link href="/login">
                  <Button variant="link" className="text-blue-400 hover:text-blue-300">
                    Login here
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
