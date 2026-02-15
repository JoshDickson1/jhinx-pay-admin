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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Sarah. Here's what's happening today.</p>
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
      <div className="bg-orange-500/8 border border-orange-500/20 rounded-lg p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Action Required</h3>
          <p className="text-sm text-muted-foreground">
            You have <span className="text-orange-500 font-medium">23 gift card approvals</span> and{" "}
            <span className="text-orange-500 font-medium">14 KYC submissions</span> pending review.
          </p>
        </div>
        <a
          href="/transactions/gift-cards"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400 transition-colors"
        >
          <CreditCard className="w-4 h-4" />
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
