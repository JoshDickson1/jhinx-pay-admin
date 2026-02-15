import { useState } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle, Eye, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface GiftCardSubmission {
  id: string;
  user: string;
  userEmail: string;
  brand: string;
  cardValue: string;
  payoutAmount: string;
  submittedTime: string;
  timeElapsed: string;
  riskScore: number;
  hasPhoto: boolean;
}

const submissions: GiftCardSubmission[] = [
  {
    id: "GC-001",
    user: "@john_doe",
    userEmail: "john.doe@email.com",
    brand: "Amazon",
    cardValue: "$100",
    payoutAmount: "₦152,000",
    submittedTime: "2:30 PM",
    timeElapsed: "12 mins",
    riskScore: 25,
    hasPhoto: true,
  },
  {
    id: "GC-002",
    user: "@mary_k",
    userEmail: "mary.k@email.com",
    brand: "iTunes",
    cardValue: "$50",
    payoutAmount: "₦75,750",
    submittedTime: "2:18 PM",
    timeElapsed: "24 mins",
    riskScore: 45,
    hasPhoto: true,
  },
  {
    id: "GC-003",
    user: "@new_user99",
    userEmail: "new.user@email.com",
    brand: "Google Play",
    cardValue: "$200",
    payoutAmount: "₦302,000",
    submittedTime: "2:05 PM",
    timeElapsed: "37 mins",
    riskScore: 78,
    hasPhoto: false,
  },
  {
    id: "GC-004",
    user: "@trusted_seller",
    userEmail: "trusted@email.com",
    brand: "Steam",
    cardValue: "$50",
    payoutAmount: "₦76,000",
    submittedTime: "1:55 PM",
    timeElapsed: "47 mins",
    riskScore: 15,
    hasPhoto: true,
  },
  {
    id: "GC-005",
    user: "@giftcard_pro",
    userEmail: "gcpro@email.com",
    brand: "Amazon",
    cardValue: "$25",
    payoutAmount: "₦38,000",
    submittedTime: "1:42 PM",
    timeElapsed: "60 mins",
    riskScore: 32,
    hasPhoto: true,
  },
];

const RiskBadge = ({ score }: { score: number }) => {
  if (score < 35) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle className="w-3 h-3" />
        Low ({score})
      </Badge>
    );
  }
  if (score < 65) {
    return (
      <Badge variant="warning" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Medium ({score})
      </Badge>
    );
  }
  return (
    <Badge variant="error" className="gap-1">
      <XCircle className="w-3 h-3" />
      High ({score})
    </Badge>
  );
};

export const GiftCardQueue = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("oldest");

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === "oldest") return parseInt(b.timeElapsed) - parseInt(a.timeElapsed);
    if (sortBy === "risk") return b.riskScore - a.riskScore;
    if (sortBy === "amount") {
      const aAmount = parseInt(a.payoutAmount.replace(/[₦,]/g, ""));
      const bAmount = parseInt(b.payoutAmount.replace(/[₦,]/g, ""));
      return bAmount - aAmount;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Queue Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card p-3">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-xl font-bold text-orange-500">{submissions.length}</p>
        </div>
        <div className="metric-card p-3">
          <p className="text-xs text-muted-foreground">Avg Wait</p>
          <p className="text-xl font-bold text-foreground">28 mins</p>
        </div>
        <div className="metric-card p-3">
          <p className="text-xs text-muted-foreground">High Risk</p>
          <p className="text-xl font-bold text-destructive">1</p>
        </div>
        <div className="metric-card p-3">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-xl font-bold text-foreground">$425</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48 bg-surface-1 border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="risk">Highest Risk</SelectItem>
            <SelectItem value="amount">Highest Amount</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="itunes">iTunes</SelectItem>
            <SelectItem value="google">Google Play</SelectItem>
            <SelectItem value="steam">Steam</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submission
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Brand
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Time
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="table-row-hover cursor-pointer"
                  onClick={() => navigate(`/transactions/gift-cards/${submission.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-500 text-sm font-medium">
                          {submission.user.charAt(1).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-orange-500">{submission.user}</p>
                        <p className="text-xs text-muted-foreground">ID: {submission.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <Badge variant="outline" className="border-border">
                      {submission.brand}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-foreground">{submission.cardValue}</p>
                      <p className="text-xs text-muted-foreground">{submission.payoutAmount}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-sm">{submission.timeElapsed}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <RiskBadge score={submission.riskScore} />
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transactions/gift-cards/${submission.id}`);
                        }}
                      >
                        Review
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-1">
          <p className="text-sm text-muted-foreground text-center">
            <span className="text-orange-500 font-medium">{submissions.length} submissions</span> awaiting review
          </p>
        </div>
      </div>
    </div>
  );
};
