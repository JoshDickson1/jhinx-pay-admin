import { useState } from "react";
import { Eye, MoreHorizontal, Snowflake, Ban, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
    0: { label: "Tier 0", className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    1: { label: "Tier 1", className: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    2: { label: "Tier 2", className: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
  };

  return (
    <Badge className={`${config[tier].className} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {config[tier].label}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: User["status"] }) => {
  const config = {
    active: { label: "Active", className: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
    frozen: { label: "Frozen", className: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    banned: { label: "Banned", className: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" },
  };

  return (
    <Badge className={`${config[status].className} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {config[status].label}
    </Badge>
  );
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600/50 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all duration-300 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 text-[13px] shadow-sm">
              <SelectValue placeholder="KYC Tier" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="0">Tier 0</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 text-[13px] shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="frozen">Frozen</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-11 w-11 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] shadow-sm"
          >
            <Filter className="w-[18px] h-[18px]" />
          </Button>
          <Button 
            variant="outline" 
            className="h-11 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
          >
            <Download className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
              <tr>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Phone
                </th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  KYC
                </th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Last Active
                </th>
                <th className="text-right p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Volume
                </th>
                <th className="text-right p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 cursor-pointer transition-all duration-200 border-t border-gray-200/30 dark:border-gray-700/30"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-[14px] font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-[13px]">
                          {user.name}
                        </p>
                        <p className="text-[12px] text-gray-500 dark:text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">{user.phone}</span>
                  </td>
                  <td className="p-4">
                    <KycBadge tier={user.kycTier} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">{user.joinDate}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">{user.lastActive}</span>
                  </td>
                  <td className="p-4 text-right hidden sm:table-cell">
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                      {user.totalVolume}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                          <MoreHorizontal className="w-[18px] h-[18px]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2"
                      >
                        <DropdownMenuLabel className="text-[12px] font-semibold">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
                        <DropdownMenuItem 
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="rounded-[10px] text-[13px] cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
                          <Snowflake className="w-4 h-4 mr-2" />
                          {user.status === "frozen" ? "Unfreeze" : "Freeze"} Account
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400 rounded-[10px] text-[13px] cursor-pointer">
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
        <div className="p-4 bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30 flex items-center justify-between border-t border-gray-200/30 dark:border-gray-700/30">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">1-7</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">5,247</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 text-[13px] font-medium" 
              disabled
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
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
          height: 6px;
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