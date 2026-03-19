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
  change={metrics?.userGrowth ?? "—"}
  changeType={metrics?.userGrowth?.startsWith("-") ? "negative" : "positive"}
  icon={Users}
  description={metrics?.userGrowthLabel ?? "This month"}
/>
<MetricCard
  title="Transaction Volume"
  value={metrics?.transactionVolume ?? "₦0"}
  change={metrics?.volumeGrowth ?? "—"}
  changeType={metrics?.volumeGrowth?.startsWith("-") ? "negative" : "positive"}
  icon={ArrowLeftRight}
  description={metrics?.volumeGrowthLabel ?? "This week"}
/>
<MetricCard
  title="Total Transactions"
  value={metrics?.totalTransactions?.toLocaleString() ?? "0"}
  change={metrics?.transactionGrowth ?? "—"}
  changeType={metrics?.transactionGrowth?.startsWith("-") ? "negative" : "positive"}
  icon={TrendingUp}
  description={metrics?.transactionGrowthLabel ?? "This week"}
/>
<MetricCard
  title="Platform Revenue"
  value={metrics?.platformRevenue ?? "₦0"}
  change={metrics?.revenueGrowth ?? "—"}
  changeType={metrics?.revenueGrowth?.startsWith("-") ? "negative" : "positive"}
  icon={Wallet}
  description={metrics?.revenueGrowthLabel ?? "This month"}
/>
          </>
        )}
      </div>

      {/* Alert Banner for pending items */}
      {(isLoading || (metrics && (metrics.pendingGiftCards > 0 || metrics.pendingKYC > 0))) && (
        <div className="bg-gradient-to-r from-orange-50 via-orange-50/50 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent backdrop-blur-sm border border-orange-200/50 dark:border-orange-500/20 rounded-[16px] p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-[13px]">Action Required</h3>
            {isLoading ? (
              <Skeleton className="h-3 w-64 mt-1" />
            ) : (
              <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-0.5">
                You have{" "}
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  {metrics?.pendingGiftCards} gift card approvals
                </span>{" "}
                and{" "}
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  {metrics?.pendingKYC} KYC submissions
                </span>{" "}
                pending review.
              </p>
            )}
          </div>

          
          <a  href="/transactions/gift-cards"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-[11px] hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/30 text-[12px]"
          >
            <div className="w-[15px] h-[15px] flex items-center justify-center">
              <CreditCard className="w-[13px] h-[13px]" />
            </div>
            Review Now
          </a>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <ActivityFeed />
          <SystemHealth />
        </div>

        {/* Right Column - Pending Actions & Revenue */}
        <div className="space-y-4">
          <RevenueBreakdown />
          <PendingActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;