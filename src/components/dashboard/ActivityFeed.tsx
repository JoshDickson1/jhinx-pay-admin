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
    gift_card_buy: { 
      icon: CreditCard, 
      className: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" 
    },
    gift_card_sell: { 
      icon: CreditCard, 
      className: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20" 
    },
    crypto_buy: { 
      icon: Bitcoin, 
      className: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20" 
    },
    crypto_sell: { 
      icon: Bitcoin, 
      className: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20" 
    },
    game_recharge: { 
      icon: Gamepad2, 
      className: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20" 
    },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${className} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
  );
};

export const ActivityFeed = () => {
  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-[18px] h-[18px] text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">Live Activity</h3>
        </div>
        <Badge 
          variant="accent" 
          className="text-[10px] px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 rounded-full font-semibold animate-pulse shadow-sm"
        >
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live
        </Badge>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 flex items-center gap-3 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-all duration-200 cursor-pointer group"
          >
            <TypeIcon type={activity.type} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-orange-600 dark:text-orange-400">
                  {activity.user}
                </span>
                <span className="text-[13px] text-gray-700 dark:text-gray-300 truncate">
                  {activity.description}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 dark:text-gray-500">{activity.time}</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {activity.amount}
              </p>
              <Badge
                variant={
                  activity.status === "completed"
                    ? "success"
                    : activity.status === "pending"
                    ? "warning"
                    : "error"
                }
                className={`text-[10px] px-2 py-0.5 border-0 rounded-full font-semibold ${
                  activity.status === "completed"
                    ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                    : activity.status === "pending"
                    ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                    : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                }`}
              >
                {activity.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-500/5 dark:to-transparent">
        <button className="w-full text-center text-[13px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors py-1.5 rounded-[12px] hover:bg-orange-50 dark:hover:bg-orange-500/10">
          View all transactions →
        </button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        
        .custom-scrollbar:hover {
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        .dark .custom-scrollbar:hover {
          scrollbar-color: rgba(75, 85, 99, 0.4) transparent;
        }
        
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.6);
        }
      `}</style>
    </div>
  );
};