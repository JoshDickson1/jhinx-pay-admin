import { useState, useMemo } from "react";
import { Search, Check, ChevronDown, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

// ─── Tag styles by notification type ─────────────────────────────────────────

const tagStyles: Record<string, string> = {
  error:
    "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  warning:
    "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  success:
    "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  info: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

const tagLabel: Record<string, string> = {
  error: "Alert",
  warning: "Warning",
  success: "Success",
  info: "Info",
};

// ─── Dot colour per type ──────────────────────────────────────────────────────

const dotColor: Record<string, string> = {
  error: "bg-red-500",
  warning: "bg-orange-500",
  success: "bg-green-500",
  info: "bg-blue-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

const AllNotifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isLoading,
  } = useNotifications();

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All type");

  // ── Client-side filter + sort (server already returns all) ─────────────────
  const filtered = useMemo(() => {
    let list = [...notifications];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "Unread") list = list.filter((n) => !n.read);
    if (statusFilter === "Read") list = list.filter((n) => n.read);

    if (typeFilter !== "All type")
      list = list.filter((n) => n.type === typeFilter);

    list.sort((a, b) => {
      const diff =
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === "Newest First" ? diff : -diff;
    });

    return list;
  }, [notifications, search, statusFilter, typeFilter, sortOrder]);

  // ── Filter controls config ─────────────────────────────────────────────────
  const filterControls = [
    {
      value: sortOrder,
      options: ["Newest First", "Oldest First"],
      setter: setSortOrder,
      key: "sort",
    },
    {
      value: statusFilter,
      options: ["All", "Unread", "Read"],
      setter: setStatusFilter,
      key: "status",
    },
    {
      value: typeFilter,
      options: ["All type", "error", "warning", "success", "info"],
      setter: setTypeFilter,
      key: "type",
    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="px-1 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading
              ? "Loading…"
              : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      {/* ── Main Card ────────────────────────────────────────────────────────── */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Filters Row */}
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications…"
              className="pl-8 h-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[12px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {filterControls.map(({ value, options, setter, key }) => (
              <div key={key} className="relative">
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="appearance-none pl-3 pr-7 h-8 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30"
                >
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Notification List ─────────────────────────────────────────────── */}
        <div className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-3 w-12 flex-shrink-0" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────────── */
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
                <BellOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white mb-1">
                  {search || statusFilter !== "All" || typeFilter !== "All type"
                    ? "No matching notifications"
                    : "No notifications yet"}
                </p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500">
                  {search
                    ? "Try a different search term"
                    : statusFilter !== "All" || typeFilter !== "All type"
                    ? "Try adjusting the filters above"
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => {
              const dot = dotColor[item.type] ?? dotColor.info;
              const tag = tagStyles[item.type] ?? tagStyles.info;
              const label = tagLabel[item.type] ?? item.type;

              const rowContent = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group w-full text-left",
                    !item.read
                      ? "bg-orange-50/40 dark:bg-orange-500/5 hover:bg-orange-50/70 dark:hover:bg-orange-500/[0.08]"
                      : "hover:bg-[#F5F5F5]/60 dark:hover:bg-[#2D2B2B]/60"
                  )}
                  onClick={() => markAsRead(item.id)}
                >
                  {/* Unread dot */}
                  <div className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0">
                    {!item.read && <div className={cn("w-1.5 h-1.5 rounded-full", dot)} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-[13px] font-semibold",
                          !item.read
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {item.title}
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px] px-2 py-0 h-5 rounded-full font-medium border",
                          tag
                        )}
                      >
                        {label}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Timestamp + remove */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-gray-400"
                      aria-label="Dismiss"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );

              // If the notification has a link, wrap in a router Link
              return item.link ? (
                <Link key={item.id} to={item.link} className="block">
                  {rowContent}
                </Link>
              ) : (
                <div key={item.id}>{rowContent}</div>
              );
            })
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        {!isLoading && notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {notifications.length}
              </span>{" "}
              notifications
            </p>
            {unreadCount > 0 && (
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotifications;