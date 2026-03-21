import { Users, ArrowLeftRight, TrendingUp, Wallet, CreditCard, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PendingActions } from "@/components/dashboard/PendingActions";
import RevenueBreakdown from "@/components/dashboard/RevenueBreakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";

const Dashboard = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { admin } = useAuthStore();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-[12px]">
          Welcome back, {admin?.full_name ?? "Admin"}. Here's what's happening today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Users"
              value={metrics?.totalUsers?.toLocaleString() ?? "0"}
              change={metrics?.userGrowth !== "—" ? metrics?.userGrowth : undefined}
              changeType={metrics?.userGrowthType ?? "neutral"}
              icon={Users}
              description={metrics?.userGrowthLabel ?? "vs last month"}
            />
            <MetricCard
              title="Transaction Volume"
              value={metrics?.transactionVolume ?? "₦0"}
              change={metrics?.volumeGrowth !== "—" ? metrics?.volumeGrowth : undefined}
              changeType={metrics?.volumeGrowthType ?? "neutral"}
              icon={ArrowLeftRight}
              description={metrics?.volumeGrowthLabel ?? "vs last week"}
            />
            <MetricCard
              title="Total Transactions"
              value={metrics?.totalTransactions?.toLocaleString() ?? "0"}
              change={metrics?.transactionGrowth !== "—" ? metrics?.transactionGrowth : undefined}
              changeType={metrics?.transactionGrowthType ?? "neutral"}
              icon={TrendingUp}
              description={metrics?.transactionGrowthLabel ?? "vs last week"}
            />
            <MetricCard
              title="Platform Revenue"
              value={metrics?.platformRevenue ?? "₦0"}
              change={metrics?.revenueGrowth !== "—" ? metrics?.revenueGrowth : undefined}
              changeType={metrics?.revenueGrowthType ?? "neutral"}
              icon={Wallet}
              description={metrics?.revenueGrowthLabel ?? "vs last month"}
            />
          </>
        )}
      </div>

      {/* Alert Banner — only shown when there are actual pending items */}
      {!isLoading &&
        metrics &&
        (metrics.pendingGiftCards > 0 || metrics.pendingKYC > 0) && (
          <div className="bg-gradient-to-r from-orange-50 via-orange-50/50 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent backdrop-blur-sm border border-orange-200/50 dark:border-orange-500/20 rounded-[16px] p-3.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-[13px]">
                Action Required
              </h3>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-0.5">
                {metrics.pendingGiftCards > 0 && (
                  <>
                    You have{" "}
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      {metrics.pendingGiftCards} gift card approval
                      {metrics.pendingGiftCards !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
                {metrics.pendingGiftCards > 0 && metrics.pendingKYC > 0 && " and "}
                {metrics.pendingKYC > 0 && (
                  <>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      {metrics.pendingKYC} KYC submission
                      {metrics.pendingKYC !== 1 ? "s" : ""}
                    </span>
                  </>
                )}{" "}
                pending review.
              </p>
            </div>
            <a
              href="/transactions/gift-cards"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-[11px] hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/30 text-[12px]"
            >
              <CreditCard className="w-[13px] h-[13px]" />
              Review Now
            </a>
          </div>
        )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <ActivityFeed />
          <SystemHealth />
        </div>
        {/* Right Column */}
        <div className="space-y-4">
          <RevenueBreakdown />
          <PendingActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;