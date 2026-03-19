import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, getRevenueBreakdown, getSystemHealth } from "@/api/dashboard.api";
import { getActivityFeed } from "@/api/activityFeed.api";

export const useDashboardMetrics = () =>
  useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      const data = await getDashboardMetrics();
      return {
        totalUsers: data.total_active_users?.value ?? 0,
        userGrowth: data.total_active_users?.delta_percent != null
          ? `${data.total_active_users.delta_percent > 0 ? "+" : ""}${data.total_active_users.delta_percent}%`
          : null,
        userGrowthLabel: data.total_active_users?.delta_label ?? "",

        transactionVolume: `₦${(data.transaction_volume_ngn?.value ?? 0).toLocaleString("en-NG")}`,
        volumeGrowth: data.transaction_volume_ngn?.delta_percent != null
          ? `${data.transaction_volume_ngn.delta_percent > 0 ? "+" : ""}${data.transaction_volume_ngn.delta_percent}%`
          : null,
        volumeGrowthLabel: data.transaction_volume_ngn?.delta_label ?? "",

        totalTransactions: data.total_transactions?.value ?? 0,
        transactionGrowth: data.total_transactions?.delta_percent != null
          ? `${data.total_transactions.delta_percent > 0 ? "+" : ""}${data.total_transactions.delta_percent}%`
          : null,
        transactionGrowthLabel: data.total_transactions?.delta_label ?? "",

        platformRevenue: `₦${(data.platform_revenue_ngn?.value ?? 0).toLocaleString("en-NG")}`,
        revenueGrowth: data.platform_revenue_ngn?.delta_percent != null
          ? `${data.platform_revenue_ngn.delta_percent > 0 ? "+" : ""}${data.platform_revenue_ngn.delta_percent}%`
          : null,
        revenueGrowthLabel: data.platform_revenue_ngn?.delta_label ?? "",

        pendingGiftCards: 0,
        pendingKYC: 0,
      };
    },
  });

export const useActivityFeed = (limit = 20) =>
  useQuery({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => getActivityFeed(limit),
    refetchInterval: 30000, // auto-refresh every 30s since it's "live"
  });

export const useRevenueBreakdown = () =>
  useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: getRevenueBreakdown,
  });

export const useSystemHealth = () =>
  useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: getSystemHealth,
  });