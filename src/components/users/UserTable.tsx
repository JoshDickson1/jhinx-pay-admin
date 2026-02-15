import { useState } from "react";
import { Eye, MoreHorizontal, Snowflake, Ban, Search, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycTier: 0 | 1 | 2;
  status: "active" | "frozen" | "banned";
  joinDate: string;
  lastActive: string;
  totalVolume: string;
}

const users: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+234 801 234 5678",
    kycTier: 2,
    status: "active",
    joinDate: "Jan 5, 2024",
    lastActive: "2 hours ago",
    totalVolume: "₦2.5M",
  },
  {
    id: "USR-002",
    name: "Mary Kolawole",
    email: "mary.k@email.com",
    phone: "+234 802 345 6789",
    kycTier: 1,
    status: "active",
    joinDate: "Dec 12, 2023",
    lastActive: "5 mins ago",
    totalVolume: "₦1.8M",
  },
  {
    id: "USR-003",
    name: "Tunde Adebayo",
    email: "tunde.a@email.com",
    phone: "+234 803 456 7890",
    kycTier: 2,
    status: "frozen",
    joinDate: "Nov 20, 2023",
    lastActive: "3 days ago",
    totalVolume: "₦4.2M",
  },
  {
    id: "USR-004",
    name: "Chioma Obi",
    email: "chioma.obi@email.com",
    phone: "+234 804 567 8901",
    kycTier: 0,
    status: "active",
    joinDate: "Jan 10, 2024",
    lastActive: "1 hour ago",
    totalVolume: "₦0",
  },
  {
    id: "USR-005",
    name: "Ahmed Musa",
    email: "ahmed.m@email.com",
    phone: "+234 805 678 9012",
    kycTier: 1,
    status: "banned",
    joinDate: "Oct 5, 2023",
    lastActive: "15 days ago",
    totalVolume: "₦850K",
  },
  {
    id: "USR-006",
    name: "Funke Adeyemi",
    email: "funke.a@email.com",
    phone: "+234 806 789 0123",
    kycTier: 2,
    status: "active",
    joinDate: "Sep 18, 2023",
    lastActive: "30 mins ago",
    totalVolume: "₦6.1M",
  },
  {
    id: "USR-007",
    name: "Emeka Johnson",
    email: "emeka.j@email.com",
    phone: "+234 807 890 1234",
    kycTier: 1,
    status: "active",
    joinDate: "Aug 22, 2023",
    lastActive: "4 hours ago",
    totalVolume: "₦3.2M",
  },
];

const KycBadge = ({ tier }: { tier: 0 | 1 | 2 }) => {
  const config = {
    0: { label: "Tier 0", variant: "tier0" as const },
    1: { label: "Tier 1", variant: "tier1" as const },
    2: { label: "Tier 2", variant: "tier2" as const },
  };

  return <Badge variant={config[tier].variant}>{config[tier].label}</Badge>;
};

const StatusBadge = ({ status }: { status: User["status"] }) => {
  const config = {
    active: { label: "Active", variant: "active" as const },
    frozen: { label: "Frozen", variant: "frozen" as const },
    banned: { label: "Banned", variant: "banned" as const },
  };

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};

export const UserTable = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-1 border-border"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-32 bg-surface-1 border-border">
              <SelectValue placeholder="KYC Tier" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="0">Tier 0</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-32 bg-surface-1 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="border-border">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="border-border gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-1 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Phone
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  KYC
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Last Active
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Volume
                </th>
                <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="table-row-hover cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-500 text-sm font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{user.phone}</span>
                  </td>
                  <td className="p-4">
                    <KycBadge tier={user.kycTier} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{user.joinDate}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                  </td>
                  <td className="p-4 text-right hidden sm:table-cell">
                    <span className="text-sm font-medium text-foreground">{user.totalVolume}</span>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Snowflake className="w-4 h-4 mr-2" />
                          {user.status === "frozen" ? "Unfreeze" : "Freeze"} Account
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
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
            <span className="font-medium text-foreground">5,247</span> users
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
