import { CreditCard, UserCheck, TicketCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PendingAction {
  id: string;
  type: "gift_card" | "kyc" | "support";
  title: string;
  count: number;
  urgent: boolean;
  route: string;
}

const actions: PendingAction[] = [
  {
    id: "1",
    type: "gift_card",
    title: "Gift Card Approvals",
    count: 23,
    urgent: true,
    route: "/transactions/gift-cards",
  },
  {
    id: "2",
    type: "kyc",
    title: "KYC Submissions",
    count: 14,
    urgent: false,
    route: "/users/kyc-pending",
  },
  {
    id: "3",
    type: "support",
    title: "Support Tickets",
    count: 8,
    urgent: false,
    route: "/support",
  },
];

const TypeConfig = {
  gift_card: { icon: CreditCard, className: "text-orange-500 bg-orange-500/10" },
  kyc: { icon: UserCheck, className: "text-info bg-info/10" },
  support: { icon: TicketCheck, className: "text-success bg-success/10" },
};

export const PendingActions = () => {
  const navigate = useNavigate();

  return (
    <div className="card-glow bg-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Pending Actions</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Items requiring your attention</p>
      </div>
      <div className="divide-y divide-border">
        {actions.map((action) => {
          const { icon: Icon, className } = TypeConfig[action.type];
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.route)}
              className="w-full p-4 flex items-center gap-4 hover:bg-surface-2 transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${className}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{action.title}</span>
                  {action.urgent && (
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.count} pending
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-orange-500">{action.count}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
