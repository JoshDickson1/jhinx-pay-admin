import { CreditCard, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { GiftCardQueue } from "@/components/giftcards/GiftCardQueue";

const stats = [
  { label: "Total Pending value", value: "$3,250", change: "23% vs yesterday", icon: CreditCard },
  { label: "Pending", value: "28", change: "23% vs yesterday", icon: CreditCard },
  { label: "Approved", value: "112", change: "4.3% today", icon: CheckCircle },
  { label: "Rejected", value: "14", change: "23% this week", icon: XCircle },
  { label: "Avg Review Time", value: "3m 42s", change: "23% this week", icon: Clock },
];

const GiftCardApprovals = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gift Card Queue</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[12px]">
          Review and verify submitted gift cards before approval or rejection.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Table */}
      <GiftCardQueue />
    </div>
  );
};

export default GiftCardApprovals;