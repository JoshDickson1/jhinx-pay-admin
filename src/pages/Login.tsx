import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Shield, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginMutation = useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      api.post("/admin/login", creds).then((r) => r.data),
    onSuccess: async (data) => {
  console.log("LOGIN RESPONSE:", data);

  const token = data.access_token;

  if (!token) {
    console.error("NO TOKEN RECEIVED");
    return;
  }

  // 1. SET AUTH FIRST (CRITICAL)
  setAuth(token, null);

  // 2. FORCE TOKEN INTO AXIOS CONTEXT
  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  try {
    // 3. NOW /me will work because header is guaranteed
    const me = await api.get("/admin/me").then((r) => r.data);

    console.log("ME RESPONSE:", me);

    setAuth(token, {
      id: me.id ?? "",
      email: me.email ?? "",
      full_name: me.full_name ?? "",
      first_name: me.first_name ?? null,
      last_name: me.last_name ?? null,
      phone: me.phone ?? null,
      avatar_url: me.avatar_url ?? null,
      role: me.role ?? "",
      is_active: me.is_active ?? true,
      last_login_at: me.last_login_at ?? null,
      created_at: me.created_at ?? "",
      updated_at: me.updated_at ?? "",
    });
  } catch (err) {
    console.error("FAILED TO FETCH /me:", err);
  }

  onLogin();
  navigate("/", { replace: true });
},
    onError: (err: any) => {
      console.error("LOGIN ERROR:", err?.response?.data);
      toast.error("Login failed", { description: "Invalid email or password." });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    navigate("/");
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const stats = [
  { label: "Active",    value: "Gift Cards" },
  { label: "Active",        value: "Crypto" },
  { label: "Active",    value: "Game Topup" },
];

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: "#f8f8f6",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,146,60,0.12) 0%, transparent 70%)",
      }}
    >
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% -5%, rgba(251,146,60,0.20) 0%, transparent 70%),
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-sm">JP</span>
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white">JhinxPay</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Admin Panel</p>
            </div>
          </div>

          <div>
            <h2 className="text-[36px] font-bold text-white leading-tight mb-4">
              Manage your platform<br />
              <span className="text-orange-400">with confidence.</span>
            </h2>
            <p className="text-[14px] text-gray-400 max-w-sm leading-relaxed">
              Monitor transactions, approve gift cards, verify users, and keep your platform running smoothly.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {stats.map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-6">
                <div>
                  <p className="text-[24px] font-bold text-orange-400">{value}</p>
                  <p className="text-[11px] text-gray-500">{label}</p>
                </div>
                {i < stats.length - 1 && <div className="w-px h-10 bg-gray-800" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">

          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/25">
              <span className="text-white font-black text-xs">JP</span>
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-gray-900 dark:text-white">JhinxPay</h1>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1C1C1C]/90 backdrop-blur-2xl rounded-[24px] border border-gray-200/60 dark:border-gray-700/40 shadow-2xl shadow-gray-200/60 dark:shadow-black/40 p-7">

            {step === "login" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-[20px] font-bold text-gray-900 dark:text-white">Welcome back</h2>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Sign in to your admin account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@jhinxpay.com"
                        required
                        className="pl-9 h-11 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Password</Label>
                      <button type="button" className="text-[11px] text-orange-500 hover:text-orange-600 transition-colors font-medium">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="pl-9 pr-10 h-11 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-11 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/25 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loginMutation.isPending ? "Signing in…" : "Sign In"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => setStep("login")}
                    className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                  </button>

                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-[20px] font-bold text-gray-900 dark:text-white">Two-Factor Auth</h2>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Enter the 6-digit code from your authenticator app</p>
                </div>

                <form onSubmit={handle2FA} className="space-y-5">
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(i, e)}
                        className={cn(
                          "w-11 h-13 text-center text-[18px] font-bold rounded-[12px] border transition-all focus:outline-none",
                          digit
                            ? "bg-gradient-to-br from-orange-400/10 to-orange-500/10 border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400"
                            : "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 text-gray-900 dark:text-white"
                        )}
                        style={{ height: "52px" }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={otp.some((d) => !d)}
                    className="w-full h-11 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Verify & Continue
                  </button>

                  <p className="text-center text-[11px] text-gray-500 dark:text-gray-400">
                    Didn't receive a code?{" "}
                    <button type="button" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                      Resend
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-4 px-4">
            Protected by enterprise-grade security. Session expires after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;