import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, getRevenueBreakdown, getSystemHealth } from "@/api/dashboard.api";
import { getActivityFeed } from "@/api/activityFeed.api";

export const useDashboardMetrics = () =>
  useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: getDashboardMetrics,
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