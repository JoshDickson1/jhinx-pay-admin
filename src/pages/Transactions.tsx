import { useState } from "react";
import { ArrowLeftRight, Eye, Filter, Download, Search, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricCard } from "@/components/dashboard/MetricCard";

interface Transaction {
  id: string;
  user: string;
  type: "crypto_buy" | "crypto_sell" | "gift_card_buy" | "gift_card_sell" | "game_recharge";
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  details: string;
}

const transactions: Transaction[] = [
  { id: "TX-001", user: "@john_doe", type: "crypto_buy", amount: "₦79,000", status: "completed", date: "Jan 13, 2:30 PM", details: "50 USDT" },
  { id: "TX-002", user: "@mary_k", type: "gift_card_sell", amount: "₦152,000", status: "pending", date: "Jan 13, 2:18 PM", details: "iTunes $100" },
  { id: "TX-003", user: "@tunde99", type: "game_recharge", amount: "₦5,000", status: "completed", date: "Jan 13, 2:05 PM", details: "COD Mobile 800 CP" },
  { id: "TX-004", user: "@crypto_king", type: "crypto_sell", amount: "₦250,000", status: "completed", date: "Jan 13, 1:55 PM", details: "0.002 BTC" },
  { id: "TX-005", user: "@gift_master", type: "gift_card_buy", amount: "₦38,000", status: "completed", date: "Jan 13, 1:42 PM", details: "Amazon $25" },
  { id: "TX-006", user: "@new_user", type: "crypto_buy", amount: "₦15,000", status: "failed", date: "Jan 13, 1:30 PM", details: "10 USDT" },
  { id: "TX-007", user: "@whale", type: "gift_card_sell", amount: "₦456,000", status: "completed", date: "Jan 13, 1:15 PM", details: "Amazon $300" },
];

const typeLabels: Record<Transaction["type"], string> = {
  crypto_buy: "Crypto Buy",
  crypto_sell: "Crypto Sell",
  gift_card_buy: "Gift Card Buy",
  gift_card_sell: "Gift Card Sell",
  game_recharge: "Game Recharge",
};

const typeVariants: Record<Transaction["type"], "accent" | "info" | "secondary"> = {
  crypto_buy: "info",
  crypto_sell: "accent",
  gift_card_buy: "info",
  gift_card_sell: "accent",
  game_recharge: "secondary",
};

const Transactions = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Transactions</h1>
        <p className="text-muted-foreground mt-1">View and manage all platform transactions</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Today"
          value="847"
          change="+15%"
          changeType="positive"
          icon={ArrowLeftRight}
        />
        <MetricCard
          title="Volume Today"
          value="₦12.5M"
          change="+8%"
          changeType="positive"
          icon={ArrowLeftRight}
        />
        <MetricCard
          title="Completed"
          value="812"
          icon={ArrowLeftRight}
          description="96% success rate"
        />
        <MetricCard
          title="Pending"
          value="35"
          icon={ArrowLeftRight}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-1 border-border"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-44 bg-surface-1 border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="gift_card">Gift Cards</SelectItem>
            <SelectItem value="game">Games</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-36 bg-surface-1 border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-border gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Transaction
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Details
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="table-row-hover">
                  <td className="p-4">
                    <div>
                      <p className="font-mono text-sm text-foreground">{tx.id}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-orange-500 font-medium">{tx.user}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={typeVariants[tx.type]}>{typeLabels[tx.type]}</Badge>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{tx.details}</span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        tx.status === "completed" ? "success" :
                        tx.status === "pending" ? "warning" : "error"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-foreground">{tx.amount}</span>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Flag for Review</DropdownMenuItem>
                        <DropdownMenuItem>Refund</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1-7</span> of{" "}
            <span className="font-medium text-foreground">12,834</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-border" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-border">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
