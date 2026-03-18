import React from "react";
import { Bitcoin, Gift, Gamepad2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueBreakdown } from "@/hooks/useDashboard";

interface RevenueItem {
  id: string;
  label: string;
  amount: string;
  percentage: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// Map category names from backend to icon + style
const categoryConfig: Record<string, Pick<RevenueItem, "icon" | "iconBg" | "iconColor">> = {
  crypto: {
    icon: Bitcoin,
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-500",
    iconColor: "text-white",
  },
  giftcard: {
    icon: Gift,
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
  },
  gift_card: {
    icon: Gift,
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
  },
  game: {
    icon: Gamepad2,
    iconBg: "bg-gradient-to-br from-gray-800 to-gray-900",
    iconColor: "text-white",
  },
  game_points: {
    icon: Gamepad2,
    iconBg: "bg-gradient-to-br from-gray-800 to-gray-900",
    iconColor: "text-white",
  },
};

const fallbackConfig = {
  icon: Bitcoin,
  iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
  iconColor: "text-white",
};

const formatAmount = (amount: number) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

const RevenueBreakdown = () => {
  const { data, isLoading } = useRevenueBreakdown();

  // Normalize backend response — handles both array and object with breakdown key
  const rawItems: any[] =
    data?.breakdown ?? data?.items ?? data?.data ?? (Array.isArray(data) ? data : []);

  // Calculate total for percentage
  const total = rawItems.reduce((sum: number, item: any) => sum + (item.amount ?? item.total ?? 0), 0);

  const revenueItems: RevenueItem[] = rawItems.map((item: any, i: number) => {
    const key = (item.category ?? item.label ?? item.type ?? "").toLowerCase().replace(/ /g, "_");
    const config = categoryConfig[key] ?? fallbackConfig;
    const amount = item.amount ?? item.total ?? item.value ?? 0;
    const percentage = item.percentage ?? (total > 0 ? Math.round((amount / total) * 100) : 0);

    return {
      id: item.id ?? String(i),
      label: item.label ?? item.category ?? item.type ?? key,
      amount: formatAmount(amount),
      percentage,
      ...config,
    };
  });

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-[14px]">
          Revenue Breakdown
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">This month</p>
      </div>

      {/* Revenue Items */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-[9px]" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
              </div>
            </div>
          ))
        ) : revenueItems.length === 0 ? (
          <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 py-4">
            No revenue data available
          </p>
        ) : (
          revenueItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] px-3 py-2.5 hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-[9px] flex-shrink-0 ${item.iconBg} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-[13px] truncate capitalize">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-[13px]">
                      {item.amount}
                    </p>
                    <p className="font-semibold text-green-600 dark:text-green-400 text-[11px]">
                      {item.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RevenueBreakdown;