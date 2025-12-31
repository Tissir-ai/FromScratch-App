'use client'
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { forgotPassword } from "@/services/auth.service";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await forgotPassword(email);
      setMessage("If an account with that email exists, we've sent you a password reset link.");
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logos/fromScratch.png" alt="FromScratch.ai Logo" className="h-10 w-10 rounded-md" />
              <span className="text-xl font-semibold">FromScratch.ai</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
            <p className="text-muted-foreground">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}

            {message && (
              <p className="text-sm text-green-500 mt-2">{message}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-foreground hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-glow items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center text-white p-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Mail className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-xl opacity-90 mb-8">We'll send you a secure link to reset your password and get back to creating amazing projects.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;