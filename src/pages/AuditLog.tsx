import { useState } from "react";
import { Shield, Search, Download, Filter } from "lucide-react";
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

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  details: string;
  type: "approval" | "rejection" | "account" | "settings";
}

const auditLog: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "Jan 13, 3:55 PM",
    admin: "Admin Sarah",
    action: "Approved Gift Card",
    target: "User @john_doe",
    details: "Amazon $100 → ₦152K",
    type: "approval",
  },
  {
    id: "AUD-002",
    timestamp: "Jan 13, 3:42 PM",
    admin: "Admin Mike",
    action: "Froze Account",
    target: "User @scammer99",
    details: "Reason: Fraud detected",
    type: "account",
  },
  {
    id: "AUD-003",
    timestamp: "Jan 13, 2:10 PM",
    admin: "Admin Sarah",
    action: "Updated Rate",
    target: "Amazon Gift Cards",
    details: "Sell rate: ₦1,520 → ₦1,515",
    type: "settings",
  },
  {
    id: "AUD-004",
    timestamp: "Jan 13, 1:30 PM",
    admin: "Admin John",
    action: "Rejected Gift Card",
    target: "User @new_user99",
    details: "Reason: Invalid code",
    type: "rejection",
  },
  {
    id: "AUD-005",
    timestamp: "Jan 13, 12:45 PM",
    admin: "Admin Sarah",
    action: "Approved KYC",
    target: "User @trusted_seller",
    details: "Tier 1 → Tier 2",
    type: "approval",
  },
  {
    id: "AUD-006",
    timestamp: "Jan 13, 11:20 AM",
    admin: "Admin Mike",
    action: "Unfroze Account",
    target: "User @wrongly_flagged",
    details: "Investigation cleared",
    type: "account",
  },
  {
    id: "AUD-007",
    timestamp: "Jan 13, 10:00 AM",
    admin: "Super Admin",
    action: "Updated Limits",
    target: "Tier 2 Users",
    details: "Daily limit: ₦1M → ₦1.5M",
    type: "settings",
  },
];

const typeVariants: Record<AuditEntry["type"], "success" | "error" | "info" | "accent"> = {
  approval: "success",
  rejection: "error",
  account: "info",
  settings: "accent",
};

const AuditLog = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">Track all admin actions for compliance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by admin, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-1 border-border"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Admin" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Admins</SelectItem>
            <SelectItem value="sarah">Admin Sarah</SelectItem>
            <SelectItem value="mike">Admin Mike</SelectItem>
            <SelectItem value="john">Admin John</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="approval">Approvals</SelectItem>
            <SelectItem value="rejection">Rejections</SelectItem>
            <SelectItem value="account">Account Actions</SelectItem>
            <SelectItem value="settings">Settings Changes</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-border gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Audit Log Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Admin
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Target
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLog.map((entry) => (
                <tr key={entry.id} className="table-row-hover">
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {entry.timestamp}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{entry.admin}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={typeVariants[entry.type]}>{entry.action}</Badge>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-orange-500">{entry.target}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{entry.details}</span>
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
            <span className="font-medium text-foreground">1,234</span> entries
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

export default AuditLog;
