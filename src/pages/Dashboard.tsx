import { Users, ArrowLeftRight, TrendingUp, Wallet, CreditCard, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PendingActions } from "@/components/dashboard/PendingActions";
import { RevenueBreakdown } from "@/components/dashboard/RevenueBreakdown";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-[13px]">
          Welcome back, Sarah. Here's what's happening today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value="5,247"
          change="+12%"
          changeType="positive"
          icon={Users}
          description="This week"
        />
        <MetricCard
          title="Transaction Volume"
          value="₦45.2M"
          change="+8%"
          changeType="positive"
          icon={ArrowLeftRight}
          description="This month"
        />
        <MetricCard
          title="Total Transactions"
          value="12,834"
          change="+15%"
          changeType="positive"
          icon={TrendingUp}
          description="This week"
        />
        <MetricCard
          title="Platform Revenue"
          value="₦1.2M"
          change="+5%"
          changeType="positive"
          icon={Wallet}
          description="This month"
        />
      </div>

      {/* Alert Banner for pending items */}
      <div className="bg-gradient-to-r from-orange-50 via-orange-50/50 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent backdrop-blur-sm border border-orange-200/50 dark:border-orange-500/20 rounded-[20px] p-5 flex items-center gap-4 shadow-sm">
        <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[14px]">Action Required</h3>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5">
            You have <span className="text-orange-600 dark:text-orange-400 font-semibold">23 gift card approvals</span> and{" "}
            <span className="text-orange-600 dark:text-orange-400 font-semibold">14 KYC submissions</span> pending review.
          </p>
        </div>
        
        <a  href="/transactions/gift-cards"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-[14px] hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/30 text-[13px]"
        >
          <div className="w-[18px] h-[18px] flex items-center justify-center">
            <CreditCard className="w-[16px] h-[16px]" />
          </div>
          Review Now
        </a>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed />
          <SystemHealth />
        </div>

        {/* Right Column - Pending Actions & Revenue */}
        <div className="space-y-6">
          <PendingActions />
          <RevenueBreakdown />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;