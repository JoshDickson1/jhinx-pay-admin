import { CreditCard, Bitcoin, Gamepad2, ArrowRightLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFeed } from "@/hooks/useDashboard";
import type { ActivityFeedItem } from "@/api/activityFeed.api";

// Derive icon type from title string
const deriveType = (title: string): "gift_card_buy" | "gift_card_sell" | "crypto_buy" | "crypto_sell" | "game_recharge" => {
  const t = title.toLowerCase();
  if (t.includes("bought") && (t.includes("card") || t.includes("gift"))) return "gift_card_buy";
  if (t.includes("sold") && (t.includes("card") || t.includes("gift"))) return "gift_card_sell";
  if (t.includes("game") || t.includes("recharge") || t.includes("cp") || t.includes("uc")) return "game_recharge";
  if (t.includes("bought") || t.includes("buy")) return "crypto_buy";
  if (t.includes("sold") || t.includes("sell")) return "crypto_sell";
  return "gift_card_buy";
};
const formatAmount = (amount: number) =>
  `₦${amount.toLocaleString("en-NG")}`;

const formatTime = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return new Date(dateStr).toLocaleDateString();
};

const TypeIcon = ({ type }: { type: ReturnType<typeof deriveType> }) => {
  const config = {
    gift_card_buy: { icon: CreditCard, className: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" },
    gift_card_sell: { icon: CreditCard, className: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20" },
    crypto_buy: { icon: Bitcoin, className: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20" },
    crypto_sell: { icon: Bitcoin, className: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20" },
    game_recharge: { icon: Gamepad2, className: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20" },
  };
  const { icon: Icon, className } = config[type];
  return (
    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${className} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
  );
};

export const ActivityFeed = () => {
  const { data, isLoading } = useActivityFeed(20);
  const items: ActivityFeedItem[] = data?.items ?? [];

const navigate = useNavigate();
  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-[18px] h-[18px] text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">Live Activity</h3>
        </div>
        <Badge
          variant="accent"
          className="text-[10px] px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 rounded-full font-semibold animate-pulse shadow-sm"
        >
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live
        </Badge>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-[12px] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-400 dark:text-gray-500">
            No activity yet
          </div>
        ) : (
          items.map((item) => {
            const type = deriveType(item.title);
            const status = (item.status?.toLowerCase() ?? "completed") as "completed" | "pending" | "failed";

            return (
              <div
                key={item.transaction_id}
                className="p-4 flex items-center gap-3 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-all duration-200 cursor-pointer group"
              >
                <TypeIcon type={type} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-orange-600 dark:text-orange-400">
                      {item.user_full_name}
                    </span>
                    <span className="text-[13px] text-gray-700 dark:text-gray-300 truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-[11px] text-gray-500 dark:text-gray-500">
                      {formatTime(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatAmount(item.amount_ngn)}
                  </p>
                  <Badge
                    variant={status === "completed" ? "success" : status === "pending" ? "warning" : "error"}
                    className={`text-[10px] px-2 py-0.5 border-0 rounded-full font-semibold ${
                      status === "completed"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : status === "pending"
                        ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-500/5 dark:to-transparent">
        <button
  onClick={() => navigate("/transactions")}
  className="w-full text-center text-[13px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors py-1.5 rounded-[12px] hover:bg-orange-50 dark:hover:bg-orange-500/10"
>
  View all transactions →
</button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s ease; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156, 163, 175, 0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; transition: background 0.3s ease; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
        .dark .custom-scrollbar:hover { scrollbar-color: rgba(75, 85, 99, 0.4) transparent; }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.4); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 0.6); }
      `}</style>
    </div>
  );
};