import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { getRevenueBreakdown, getSystemHealth } from "@/api/dashboard.api";
import { getActivityFeed } from "@/api/activityFeed.api";

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a delta_percent value into a display string.
 * null/undefined  → "—"   (no data at all)
 * 0               → "0%"  (not a dash)
 * positive        → "+12%"
 * negative        → "-5%"
 */
const formatDelta = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return "—";
  if (val === 0) return "0%";
  return `${val > 0 ? "+" : ""}${val}%`;
};

export const deltaType = (
  str: string
): "positive" | "negative" | "neutral" => {
  if (str.startsWith("+")) return "positive";
  if (str.startsWith("-")) return "negative";
  return "neutral";
};

// ── hooks ─────────────────────────────────────────────────────────────────────

export const useDashboardMetrics = () =>
  useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      // Fetch KPIs + pending counts in parallel — pending failures are non-fatal
      const [overview, giftcardStats, userStats] = await Promise.all([
        api.get("/admin/overview").then((r) => r.data),
        api
          .get("/admin/giftcards/submissions/stats")
          .then((r) => r.data)
          .catch(() => null),
        api
          .get("/admin/users/stats")
          .then((r) => r.data)
          .catch(() => null),
      ]);

      // ── Total users ───────────────────────────────────────────────────────
      // Backend may return total_users OR total_active_users.
      // Prefer total_users (all registered) to match the Users page count.
      const usersCard =
        overview.total_users ?? overview.total_active_users ?? {};
      const totalUsers: number =
        typeof usersCard === "object" ? (usersCard?.value ?? 0) : usersCard;
      const userDelta = formatDelta(
        typeof usersCard === "object" ? usersCard?.delta_percent : null
      );

      // ── Transaction volume ────────────────────────────────────────────────
      const volCard =
        overview.transaction_volume_ngn ??
        overview.transaction_volume ??
        {};
      const transactionVolume: number =
        typeof volCard === "object" ? (volCard?.value ?? 0) : volCard;
      const volumeDelta = formatDelta(
        typeof volCard === "object" ? volCard?.delta_percent : null
      );

      // ── Total transactions ────────────────────────────────────────────────
      const txCard = overview.total_transactions ?? {};
      const totalTransactions: number =
        typeof txCard === "object" ? (txCard?.value ?? 0) : txCard;
      const txDelta = formatDelta(
        typeof txCard === "object" ? txCard?.delta_percent : null
      );

      // ── Platform revenue ──────────────────────────────────────────────────
      const revCard =
        overview.platform_revenue_ngn ??
        overview.platform_revenue ??
        overview.revenue ??
        {};
      const platformRevenue: number =
        typeof revCard === "object" ? (revCard?.value ?? 0) : revCard;
      const revDelta = formatDelta(
        typeof revCard === "object" ? revCard?.delta_percent : null
      );

      // ── Pending counts ────────────────────────────────────────────────────
      const pendingGiftCards: number =
        giftcardStats?.pending_count ??
        giftcardStats?.pending ??
        giftcardStats?.total_pending ??
        0;

      const pendingKYC: number =
        userStats?.pending_kyc ??
        userStats?.kyc_pending ??
        userStats?.tier3_pending ??
        0;

      return {
        totalUsers,
        transactionVolume: `₦${transactionVolume.toLocaleString("en-NG")}`,
        totalTransactions,
        platformRevenue: `₦${platformRevenue.toLocaleString("en-NG")}`,

        userGrowth: userDelta,
        userGrowthType: deltaType(userDelta),
        userGrowthLabel:
          typeof usersCard === "object"
            ? (usersCard?.delta_label ?? "vs last month")
            : "vs last month",

        volumeGrowth: volumeDelta,
        volumeGrowthType: deltaType(volumeDelta),
        volumeGrowthLabel:
          typeof volCard === "object"
            ? (volCard?.delta_label ?? "vs last week")
            : "vs last week",

        transactionGrowth: txDelta,
        transactionGrowthType: deltaType(txDelta),
        transactionGrowthLabel:
          typeof txCard === "object"
            ? (txCard?.delta_label ?? "vs last week")
            : "vs last week",

        revenueGrowth: revDelta,
        revenueGrowthType: deltaType(revDelta),
        revenueGrowthLabel:
          typeof revCard === "object"
            ? (revCard?.delta_label ?? "vs last month")
            : "vs last month",

        pendingGiftCards,
        pendingKYC,
      };
    },
    staleTime: 30_000,
  });

export const useActivityFeed = (limit = 20) =>
  useQuery({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => getActivityFeed(limit),
    refetchInterval: 30_000,
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