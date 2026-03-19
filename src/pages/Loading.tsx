import { useEffect } from "react";

interface LoadingProps {
  onComplete: () => void;
}

const DURATION = 2000;

export const Loading = ({ onComplete }: LoadingProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, DURATION);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
      
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-orange-400/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">JP</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            JhinxPay
          </h1>
          <p className="text-xs text-gray-400">Initializing admin panel...</p>
        </div>

        {/* Loader bar */}
        <div className="w-48 h-[3px] bg-gray-200 dark:bg-white/10 overflow-hidden rounded-full">
          <div className="h-full bg-orange-500 animate-loading-bar" />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { width: 0% }
          50% { width: 70% }
          100% { width: 100% }
        }
        .animate-loading-bar {
          animation: loadingBar 2s ease forwards;
        }
      `}</style>
    </div>
  );
};