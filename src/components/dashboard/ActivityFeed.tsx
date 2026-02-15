import { CreditCard, Bitcoin, Gamepad2, ArrowRightLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: "gift_card_buy" | "gift_card_sell" | "crypto_buy" | "crypto_sell" | "game_recharge";
  user: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "gift_card_buy",
    user: "@john_doe",
    description: "Bought $50 Amazon card",
    amount: "₦79,000",
    status: "completed",
    time: "2 mins ago",
  },
  {
    id: "2",
    type: "gift_card_sell",
    user: "@mary_k",
    description: "Sold iTunes $100",
    amount: "₦152,000",
    status: "pending",
    time: "5 mins ago",
  },
  {
    id: "3",
    type: "game_recharge",
    user: "@tunde99",
    description: "Recharged COD Mobile 800 CP",
    amount: "₦5,000",
    status: "completed",
    time: "8 mins ago",
  },
  {
    id: "4",
    type: "crypto_buy",
    user: "@crypto_king",
    description: "Bought 50 USDT",
    amount: "₦79,000",
    status: "completed",
    time: "12 mins ago",
  },
  {
    id: "5",
    type: "crypto_sell",
    user: "@btc_lover",
    description: "Sold 0.002 BTC",
    amount: "₦250,000",
    status: "completed",
    time: "15 mins ago",
  },
  {
    id: "6",
    type: "gift_card_sell",
    user: "@gift_master",
    description: "Sold Google Play $25",
    amount: "₦38,000",
    status: "pending",
    time: "18 mins ago",
  },
  {
    id: "7",
    type: "game_recharge",
    user: "@gamer_x",
    description: "Recharged PUBG Mobile 1800 UC",
    amount: "₦12,500",
    status: "completed",
    time: "22 mins ago",
  },
];

const TypeIcon = ({ type }: { type: Activity["type"] }) => {
  const config = {
    gift_card_buy: { icon: CreditCard, className: "text-orange-500 bg-orange-500/10" },
    gift_card_sell: { icon: CreditCard, className: "text-info bg-info/10" },
    crypto_buy: { icon: Bitcoin, className: "text-warning bg-warning/10" },
    crypto_sell: { icon: Bitcoin, className: "text-success bg-success/10" },
    game_recharge: { icon: Gamepad2, className: "text-purple-400 bg-purple-400/10" },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${className}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

export const ActivityFeed = () => {
  return (
    <div className="card-glow bg-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-foreground">Live Activity</h3>
        </div>
        <Badge variant="accent" className="text-[10px] animate-pulse">
          Live
        </Badge>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 flex items-center gap-3 hover:bg-surface-2 transition-colors cursor-pointer group"
          >
            <TypeIcon type={activity.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-orange-500">{activity.user}</span>
                <span className="text-sm text-foreground truncate">
                  {activity.description}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{activity.amount}</p>
              <Badge
                variant={
                  activity.status === "completed"
                    ? "success"
                    : activity.status === "pending"
                    ? "warning"
                    : "error"
                }
                className="text-[10px]"
              >
                {activity.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border bg-surface-1">
        <button className="w-full text-center text-sm text-orange-500 hover:text-orange-400 transition-colors">
          View all transactions →
        </button>
      </div>
    </div>
  );
};
