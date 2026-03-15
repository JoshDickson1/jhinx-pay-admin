import { useEffect, useState } from "react";

interface LoadingProps {
  onComplete: () => void;
}

const DURATION = 3000;

const statusMessages = [
  "Authenticating session...",
  "Loading platform data...",
  "Syncing transactions...",
  "Fetching user records...",
  "Almost there...",
];

export const Loading = ({ onComplete }: LoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      setMessageIndex(Math.min(Math.floor(elapsed / (DURATION / statusMessages.length)), statusMessages.length - 1));
      if (elapsed < DURATION) {
        requestAnimationFrame(tick);
      } else {
        setFadeOut(true);
        setTimeout(onComplete, 400);
      }
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 transition-opacity duration-400 ${fadeOut ? "opacity-0" : "opacity-100"}`}>

      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-orange-400/8 dark:bg-orange-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-7 w-full max-w-[240px] px-6">

        {/* Logo */}
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/25">
          <span className="text-white font-black text-base tracking-tight">JP</span>
        </div>

        {/* Brand */}
        <div className="text-center space-y-0.5">
          <h1 className="text-gray-900 dark:text-white font-bold text-[18px] tracking-tight">JhinxPay</h1>
          <p className="text-gray-400 dark:text-gray-600 text-[10px] uppercase tracking-[0.2em] font-medium">Admin Console</p>
        </div>

        {/* Progress */}
        <div className="w-full space-y-2">
          <div className="w-full h-[2px] bg-gray-200 dark:bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
              style={{ width: `${progress}%`, transition: "width 60ms linear" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 dark:text-gray-600 text-[10px] font-medium">
              {statusMessages[messageIndex]}
            </span>
            <span className="text-orange-500 text-[10px] font-semibold tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-orange-400/50"
              style={{ animation: "dotBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 left-0 right-0 text-center space-y-0.5">
        <p className="text-gray-400 dark:text-gray-600 text-[10px] font-medium">
          Powered by <span className="text-orange-500/80 font-semibold">JhinxPay</span> · Secure Admin Infrastructure
        </p>
        <p className="text-gray-300 dark:text-gray-700 text-[9px] uppercase tracking-widest">
          v2.4.1 · © {new Date().getFullYear()} JhinxPay Ltd
        </p>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};