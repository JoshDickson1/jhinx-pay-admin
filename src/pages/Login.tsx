import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("2fa");
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 flex items-center justify-center">
                <span className="text-black font-bold text-xl">JP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">JhinxPay</h1>
                <span className="text-sm text-muted-foreground">Admin Panel</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Manage your platform
              <br />
              <span className="text-accent-gradient">with confidence.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Monitor transactions, approve gift cards, verify users, and keep your platform running smoothly.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-orange-500">5,247</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold text-orange-500">₦45.2M</p>
              <p className="text-sm text-muted-foreground">Monthly Volume</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold text-orange-500">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 flex items-center justify-center">
              <span className="text-black font-bold">JP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">JhinxPay</h1>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>

          {step === "login" ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground mt-2">Sign in to your admin account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@jhinxpay.com"
                      className="pl-11 h-12 bg-surface-1 border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-sm text-orange-500 hover:text-orange-400">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 h-12 bg-surface-1 border-border"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="accent" className="w-full h-12" size="lg">
                  Sign In
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h2>
                <p className="text-muted-foreground mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <form onSubmit={handle2FA} className="space-y-5">
                <div className="flex gap-2 justify-center">
                  {[...Array(6)].map((_, i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 text-center text-xl font-bold bg-surface-1 border-border"
                    />
                  ))}
                </div>

                <Button type="submit" variant="accent" className="w-full h-12" size="lg">
                  Verify & Continue
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to login
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Protected by enterprise-grade security. Session expires after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
