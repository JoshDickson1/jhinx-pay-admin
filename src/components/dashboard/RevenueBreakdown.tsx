import { Bitcoin, CreditCard, Gamepad2 } from "lucide-react";

interface RevenueItem {
  label: string;
  amount: string;
  percentage: number;
  icon: React.ElementType;
  color: string;
}

const revenueItems: RevenueItem[] = [
  { label: "Crypto Fees", amount: "₦800K", percentage: 68, icon: Bitcoin, color: "bg-warning" },
  { label: "Gift Cards", amount: "₦300K", percentage: 26, icon: CreditCard, color: "bg-orange-500" },
  { label: "Game Recharge", amount: "₦100K", percentage: 6, icon: Gamepad2, color: "bg-purple-500" },
];

export const RevenueBreakdown = () => {
  return (
    <div className="card-glow bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Revenue Breakdown</h3>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 rounded-full bg-surface-2 flex overflow-hidden mb-4">
        {revenueItems.map((item, i) => (
          <div
            key={item.label}
            className={`${item.color} transition-all duration-500`}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {revenueItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{item.amount}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
