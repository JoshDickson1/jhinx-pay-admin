import { useState } from "react";
import { Search, Check, Trash2, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: "blue" | "orange" | "green" | "purple" | "red";
  time: string;
  read: boolean;
  urgent?: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Gift card queue backlog high",
    description: "High-risk submissions increased by 40%",
    tag: "Transactions",
    tagColor: "blue",
    time: "6 hr ago",
    read: false,
    urgent: true,
  },
  {
    id: "2",
    title: "Fraud risk spike detected",
    description: "Fraud risk spike detected",
    tag: "Fraud / Compliance",
    tagColor: "orange",
    time: "30m ago",
    read: true,
  },
  {
    id: "3",
    title: "New high-priority support ticket assigned",
    description: "Ticket #4821 requires immediate response.",
    tag: "Support",
    tagColor: "blue",
    time: "30m ago",
    read: true,
  },
  {
    id: "4",
    title: "New KYC submissions pending review",
    description: "3 users submitted documents for verification.",
    tag: "Users & Compliance",
    tagColor: "green",
    time: "30m ago",
    read: true,
  },
  {
    id: "5",
    title: "Large transaction flagged for review",
    description: "Transaction TX-88421 exceeded risk threshold.",
    tag: "Transaction",
    tagColor: "blue",
    time: "30m ago",
    read: true,
  },
  {
    id: "6",
    title: "Gift card rate updated successfully",
    description: "Rates were updated by Super Admin.",
    tag: "Rates & Controls",
    tagColor: "green",
    time: "30m ago",
    read: true,
  },
  {
    id: "7",
    title: "System Update",
    description: "Scheduled maintenance tomorrow. Starts at 2:00 AM",
    tag: "System",
    tagColor: "purple",
    time: "20h ago",
    read: false,
  },
  {
    id: "8",
    title: "Fraud risk spike detected",
    description: "Fraud risk spike detected",
    tag: "Fraud / Compliance",
    tagColor: "orange",
    time: "30m ago",
    read: true,
  },
  {
    id: "9",
    title: "New high-priority support ticket assigned",
    description: "Ticket #4821 requires immediate response.",
    tag: "Support",
    tagColor: "blue",
    time: "30m ago",
    read: true,
  },
  {
    id: "10",
    title: "New KYC submissions pending review",
    description: "3 users submitted documents for verification.",
    tag: "Users & Compliance",
    tagColor: "green",
    time: "30m ago",
    read: true,
  },
  {
    id: "11",
    title: "Large transaction flagged for review",
    description: "Transaction TX-88421 exceeded risk threshold.",
    tag: "Transaction",
    tagColor: "blue",
    time: "30m ago",
    read: true,
  },
  {
    id: "12",
    title: "Gift card rate updated successfully",
    description: "Rates were updated by Super Admin.",
    tag: "Rates & Controls",
    tagColor: "green",
    time: "30m ago",
    read: true,
  },
  {
    id: "13",
    title: "System Update",
    description: "Scheduled maintenance tomorrow. Starts at 2:00 AM",
    tag: "System",
    tagColor: "purple",
    time: "20h ago",
    read: false,
  },
];

const tagStyles = {
  blue: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  orange: "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  green: "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  purple: "bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  red: "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const AllNotifications = () => {
  const [items, setItems] = useState(notifications);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All type");

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setItems([]);

  const filtered = items.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || (statusFilter === "Unread" ? !n.read : n.read);
    const matchesType = typeFilter === "All type" || n.tag === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Page Header */}
      <div className="px-1 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200/60 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:border-red-500/20 transition-all duration-200 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Filters Row */}
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notification...."
              className="pl-8 h-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[12px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Sort */}
            {[
              { label: sortOrder, options: ["Newest First", "Oldest First"], setter: setSortOrder },
              { label: statusFilter === "All" ? "Status" : statusFilter, options: ["All", "Unread", "Read"], setter: setStatusFilter },
              { label: typeFilter, options: ["All type", "Transactions", "Support", "Users & Compliance", "Fraud / Compliance", "Rates & Controls", "System"], setter: setTypeFilter },
            ].map(({ label, options, setter }) => (
              <div key={label} className="relative group">
                <select
                  onChange={(e) => setter(e.target.value)}
                  className="appearance-none pl-3 pr-7 h-8 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30"
                >
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-gray-400 dark:text-gray-500">
              No notifications found
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n))}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group",
                  !item.read
                    ? "bg-orange-50/40 dark:bg-orange-500/5 hover:bg-orange-50/70 dark:hover:bg-orange-500/8"
                    : "hover:bg-[#F5F5F5]/60 dark:hover:bg-[#2D2B2B]/60"
                )}
              >
                {/* Unread dot */}
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0">
                  {!item.read && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", item.urgent ? "bg-orange-500" : "bg-orange-400")} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.urgent && <span className="text-[13px]">⚠️</span>}
                    <span className={cn(
                      "text-[13px] font-semibold",
                      !item.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {item.title}
                    </span>
                    <Badge className={cn("text-[10px] px-2 py-0 h-5 rounded-full font-medium border", tagStyles[item.tagColor])}>
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>

                {/* Time */}
                <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;