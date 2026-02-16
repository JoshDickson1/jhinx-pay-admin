import { useState } from "react";
import { ArrowLeftRight, Eye, Download, Search, MoreHorizontal, Calendar, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  type: "crypto_buy" | "crypto_sell" | "gift_card_buy" | "gift_card_sell" | "game_recharge";
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  details: string;
}

const transactions: Transaction[] = [
  { 
    id: "JPX-TRX-829503", 
    user: { name: "John Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=12" },
    type: "gift_card_buy", 
    amount: "₦38,000", 
    status: "completed", 
    date: "Jan 13, 2:30 PM", 
    details: "Amazon $25" 
  },
  { 
    id: "JPX-TRX-829503", 
    user: { name: "Obed Vine", email: "beddv@gmail.com", avatar: "https://i.pravatar.cc/150?img=33" },
    type: "gift_card_sell", 
    amount: "₦38,000", 
    status: "pending", 
    date: "Jan 13, 2:30 PM", 
    details: "Amazon $25" 
  },
  { 
    id: "JPX-TRX-829503", 
    user: { name: "Wizz John", email: "wizzy@gmail.com", avatar: "https://i.pravatar.cc/150?img=15" },
    type: "crypto_buy", 
    amount: "₦79,000", 
    status: "completed", 
    date: "Jan 13, 2:30 PM", 
    details: "50 USDT" 
  },
  { 
    id: "JPX-TRX-829503", 
    user: { name: "Precious Chisom", email: "pcc@gmail.com", avatar: "https://i.pravatar.cc/150?img=45" },
    type: "game_recharge", 
    amount: "₦5,000", 
    status: "pending", 
    date: "Jan 13, 2:30 PM", 
    details: "COD Mobile 800 CP" 
  },
  { 
    id: "JPX-TRX-829503", 
    user: { name: "Benedita Josh", email: "benvyj@gmail.com", avatar: "https://i.pravatar.cc/150?img=47" },
    type: "game_recharge", 
    amount: "₦10,000", 
    status: "failed", 
    date: "Jan 13, 2:30 PM", 
    details: "COD Mobile 1200 CP" 
  },
  { 
    id: "JPX-TRX-829503", 
    user: { name: "Charity Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=26" },
    type: "game_recharge", 
    amount: "₦10,000", 
    status: "failed", 
    date: "Jan 13, 2:30 PM", 
    details: "COD Mobile 1200 CP" 
  },
];

const typeLabels: Record<Transaction["type"], string> = {
  crypto_buy: "Crypto Buy",
  crypto_sell: "Crypto Sell",
  gift_card_buy: "Gift Card Buy",
  gift_card_sell: "Gift Card Sell",
  game_recharge: "Gamepoints Recharge",
};

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState("MM/DD/YY - MM/DD/YY");

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === "all") return true;
    if (activeTab === "giftcard") return tx.type.includes("gift_card");
    if (activeTab === "crypto") return tx.type.includes("crypto");
    if (activeTab === "gamepoints") return tx.type === "game_recharge";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button 
          variant="outline"
          className="h-11 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
        >
          <Calendar className="w-4 h-4" />
          Sort by: {dateRange}
        </Button>
        <Button 
          variant="outline"
          className="h-11 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </Button>
        <Button 
          variant="outline"
          className="h-11 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
        >
          <Download className="w-4 h-4" />
          Download Invoices
        </Button>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
        {/* Tabs and Filters */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="bg-transparent border-b border-gray-200/50 dark:border-gray-700/30 rounded-none h-auto p-0 w-full justify-start">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-3 text-[14px] font-semibold data-[state=active]:text-orange-500 text-gray-600 dark:text-gray-400"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="giftcard"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-3 text-[14px] font-semibold data-[state=active]:text-orange-500 text-gray-600 dark:text-gray-400"
                >
                  Giftcard
                </TabsTrigger>
                <TabsTrigger 
                  value="crypto"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-3 text-[14px] font-semibold data-[state=active]:text-orange-500 text-gray-600 dark:text-gray-400"
                >
                  Crypto
                </TabsTrigger>
                <TabsTrigger 
                  value="gamepoints"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none pb-3 text-[14px] font-semibold data-[state=active]:text-orange-500 text-gray-600 dark:text-gray-400"
                >
                  Gamepoints
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <Input
                  placeholder="Search by ID or user...."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 pr-4 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600/50 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300 shadow-sm"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-36 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 text-[13px] shadow-sm">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-40 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 text-[13px] shadow-sm">
                  <SelectValue placeholder="Amount Range" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
                  <SelectItem value="all">Amount Range</SelectItem>
                  <SelectItem value="0-10k">₦0 - ₦10,000</SelectItem>
                  <SelectItem value="10k-50k">₦10,000 - ₦50,000</SelectItem>
                  <SelectItem value="50k+">₦50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-[#F5F5F5]/50 dark:bg-[#2D2B2B]/50">
              <tr>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  Transaction ID
                </th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  User
                </th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  Type
                </th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                  Details
                </th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-right p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr 
                  key={`${tx.id}-${index}`} 
                  className="hover:bg-[#F5F5F5]/30 dark:hover:bg-[#2D2B2B]/30 cursor-pointer transition-all duration-200 border-t border-gray-200/30 dark:border-gray-700/30"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-mono text-[13px] font-medium text-gray-900 dark:text-white">{tx.id}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-500">{tx.date}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0">
                        <img 
                          src={tx.user.avatar} 
                          alt={tx.user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                  <span class="text-white text-sm font-semibold">${tx.user.name.charAt(0)}</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-[13px] truncate">
                          {tx.user.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">
                          {tx.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[13px] text-gray-900 dark:text-white font-medium">
                      {typeLabels[tx.type]}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">
                      {tx.details}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[14px] font-bold text-gray-900 dark:text-white">
                      {tx.amount}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={`border-0 rounded-full text-[11px] font-semibold px-3 py-1 ${
                        tx.status === "completed"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : tx.status === "pending"
                          ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2"
                      >
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
                          Flag for Review
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
                          Refund
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
        <div className="p-4 bg-[#F5F5F5]/20 dark:bg-[#2D2B2B]/20 flex items-center justify-between border-t border-gray-200/30 dark:border-gray-700/30">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">1-7</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">5,648</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 text-[13px] font-medium" 
              disabled
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium"
            >
              Next
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

export default Transactions;