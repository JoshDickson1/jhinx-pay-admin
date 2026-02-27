import { useState } from "react";
import { Search, MoreHorizontal, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  subject: string;
  priority: "High" | "Mid" | "Low";
  status: "Open" | "Pending" | "Resolved" | "Closed";
  lastReply: string;
  date: string;
}

const tickets: Ticket[] = [
  {
    id: "#23122",
    user: { name: "John Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=12" },
    subject: "Withdrawal delay",
    priority: "High",
    status: "Open",
    lastReply: "50 min",
    date: "Jan 13, 2:30 PM",
  },
  {
    id: "#23123",
    user: { name: "Obed Vine", email: "beddv@gmail.com", avatar: "https://i.pravatar.cc/150?img=33" },
    subject: "Gift card issue",
    priority: "Mid",
    status: "Pending",
    lastReply: "41 min",
    date: "Jan 12, 1:30 PM",
  },
  {
    id: "#23124",
    user: { name: "Wizz John", email: "wizzy@gmail.com", avatar: "https://i.pravatar.cc/150?img=15" },
    subject: "Login problem",
    priority: "Low",
    status: "Open",
    lastReply: "32 min",
    date: "Jan 12, 12:30 PM",
  },
  {
    id: "#23125",
    user: { name: "Precious Chisom", email: "pcc@gmail.com", avatar: "https://i.pravatar.cc/150?img=45" },
    subject: "Wrong player ID charged",
    priority: "Low",
    status: "Resolved",
    lastReply: "22 min",
    date: "Jan 12, 10:30 AM",
  },
  {
    id: "#23126",
    user: { name: "Benedita Josh", email: "bennyj@gmail.com", avatar: "https://i.pravatar.cc/150?img=47" },
    subject: "Unable to login",
    priority: "High",
    status: "Pending",
    lastReply: "10 min",
    date: "Jan 12, 6:30 AM",
  },
  {
    id: "#23128",
    user: { name: "Charity Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=26" },
    subject: "Card not approved",
    priority: "High",
    status: "Resolved",
    lastReply: "5 min",
    date: "Jan 12, 2:30 AM",
  },
];

const PriorityBadge = ({ priority }: { priority: Ticket["priority"] }) => {
  const config = {
    High: "border border-red-400 text-red-500 dark:text-red-400 bg-transparent",
    Mid: "border border-orange-400 text-orange-500 dark:text-orange-400 bg-transparent",
    Low: "border border-green-400 text-green-600 dark:text-green-400 bg-transparent",
  };
  return (
    <Badge className={`${config[priority]} rounded-full text-[12px] font-semibold px-3 py-1`}>
      {priority}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const config = {
    Open: "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent",
    Pending: "border border-orange-400 text-orange-500 dark:text-orange-400 bg-transparent",
    Resolved: "border border-green-400 text-green-600 dark:text-green-400 bg-transparent",
    Closed: "border border-gray-400 text-gray-500 dark:text-gray-400 bg-transparent",
  };
  return (
    <Badge className={`${config[status]} rounded-full text-[12px] font-semibold px-3 py-1`}>
      {status}
    </Badge>
  );
};

const Support = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-[13px]">
          Manage and respond to user support submissions
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">

        {/* Filters */}
        <div className="p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
            <Input
              placeholder="Search by ID or user...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 h-12 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent hover:border-gray-200 dark:hover:border-gray-700/50 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="h-12 px-4 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent text-[13px] font-medium min-w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="h-12 px-4 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent text-[13px] font-medium min-w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
                <SelectItem value="all">Priority: All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="h-12 px-4 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent text-[13px] font-medium min-w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
                <SelectItem value="all">Category: All</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="giftcard">Gift Card</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-[#F5F5F5]/50 dark:bg-[#2D2B2B]/50">
              <tr>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Ticket ID</th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Subject</th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Priority</th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Last Reply</th>
                <th className="text-right p-4 text-[12px] font-semibold text-gray-600 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr
                  key={`${ticket.id}-${index}`}
                  className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 cursor-pointer transition-all duration-200 border-t border-gray-200/30 dark:border-gray-700/20"
                  onClick={() => navigate(`/support/${ticket.id.replace("#", "")}`)}
                >
                  {/* Ticket ID */}
                  <td className="p-4">
                    <p className="font-bold text-[14px] text-gray-900 dark:text-white">{ticket.id}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500">{ticket.date}</p>
                  </td>

                  {/* User */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0">
                        <img
                          src={ticket.user.avatar}
                          alt={ticket.user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const p = e.currentTarget.parentElement;
                            if (p) p.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white text-sm font-semibold">${ticket.user.name.charAt(0)}</span></div>`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-gray-900 dark:text-white truncate">{ticket.user.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">{ticket.user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="p-4">
                    <span className="text-[14px] text-gray-900 dark:text-white">{ticket.subject}</span>
                  </td>

                  {/* Priority */}
                  <td className="p-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* Last Reply */}
                  <td className="p-4">
                    <span className="text-[13px] text-gray-600 dark:text-gray-400">{ticket.lastReply}</span>
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-9 h-9 rounded-full text-black dark:text-white flex items-center justify-center transition-colors duration-200 ml-auto">
                          <MoreHorizontal className="w-4 h-4 text-current" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2"
                      >
                        <DropdownMenuItem
                          className="rounded-[10px] text-[13px] cursor-pointer"
                          onClick={() => navigate(`/support/${ticket.id.replace("#", "")}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View & Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer text-green-600 dark:text-green-400">
                          Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer text-red-600 dark:text-red-400">
                          Close Ticket
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
        <div className="p-5 bg-[#F5F5F5]/20 dark:bg-[#2D2B2B]/20 flex items-center justify-between border-t border-gray-200/30 dark:border-gray-700/20">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">1-7</span> of{" "}
            <span className="font-bold text-gray-900 dark:text-white">5,648</span> submission
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

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.4); }
      `}</style>
    </div>
  );
};

export default Support;