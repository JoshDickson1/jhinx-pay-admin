import { CreditCard, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GiftCardQueue } from "@/components/giftcards/GiftCardQueue";

const GiftCardApprovals = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gift Card Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve gift card submissions</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Today"
          value="23"
          icon={CreditCard}
          description="Awaiting review"
        />
        <MetricCard
          title="Avg Approval Time"
          value="14 mins"
          change="-3 mins"
          changeType="positive"
          icon={Clock}
          description="vs last week"
        />
        <MetricCard
          title="Approved Today"
          value="47"
          change="+12%"
          changeType="positive"
          icon={CheckCircle}
        />
        <MetricCard
          title="Total Value"
          value="$3,250"
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
          description="Pending value"
        />
      </div>

      {/* Queue */}
      <GiftCardQueue />
    </div>
  );
};

export default GiftCardApprovals;
