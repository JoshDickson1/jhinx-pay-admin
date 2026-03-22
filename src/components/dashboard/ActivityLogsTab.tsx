import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

interface LogEntry {
  id: string;
  admin_user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
  message: string | null;
  ip_address: string;
  user_agent: string;
  details: Record<string, any> | null;
  created_at: string;
}

const parseUA = (ua: string) => {
  const browser = ua.includes("Edg") ? "Edge"
    : ua.includes("Chrome") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") ? "Safari"
    : ua.includes("curl") ? "curl"
    : "Browser";
  const os = ua.includes("Windows") ? "Windows"
    : ua.includes("Mac OS") ? "macOS"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux"
    : ua.includes("curl") ? "Terminal"
    : "Unknown";
  return { browser, os };
};

const formatAction = (action: string) => {
  const map: Record<string, string> = {
    "admin.login.json": "Login",
    "admin.logout": "Logout",
    "admin.security.password.change": "Password Change",
    "admin.security.sessions.logout_all": "Logout All Sessions",
    "admin.security.sessions.logout": "Logout Session",
    "admin.profile.update": "Profile Update",
    "admin.profile.picture.update": "Profile Picture Update",
    "admin.profile.picture.delete": "Profile Picture Removed",
    "admin.notifications.preferences.update": "Notification Prefs Updated",
  };
  return map[action] ?? action.split(".").slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const getSection = (action: string) => {
  if (action.includes("login") || action.includes("logout")) return "System";
  if (action.includes("password") || action.includes("session")) return "Security";
  if (action.includes("profile") || action.includes("notification")) return "Settings";
  if (action.includes("transaction") || action.includes("gift")) return "Transactions";
  if (action.includes("user")) return "Users";
  return "System";
};

const sectionColors: Record<string, string> = {
  System:       "bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-700/40",
  Security:     "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  Transactions: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Users:        "bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  Settings:     "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

const statusColors: Record<string, string> = {
  SUCCESS: "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  FAILED:  "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  ERROR:   "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export const ActivityLogsTab = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest First");
  const [viewEntry, setViewEntry] = useState<LogEntry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "logs", search],
    queryFn: () =>
      api.get("/admin/admin-logs", {
        params: { limit: 50, search: search || undefined },
      }).then((r) => r.data),
  });

  const rawLogs: LogEntry[] = data?.items ?? data?.logs ?? data?.data ?? [];

  const logs: LogEntry[] = [...rawLogs]
    .filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        formatAction(log.action).toLowerCase().includes(q) ||
        (log.ip_address ?? "").includes(q) ||
        (log.resource_type ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sort === "Newest First" ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Activity Logs</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="pl-8 h-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[12px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-7 h-8 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all focus:outline-none"
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile — card view */}
      <div className="sm:hidden divide-y divide-gray-100/80 dark:divide-gray-700/20">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-gray-400">No activity logs found</div>
        ) : (
          logs.map((log) => {
            const { browser, os } = parseUA(log.user_agent ?? "");
            const section = getSection(log.action);
            return (
              <div
                key={log.id}
                className="p-4 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors cursor-pointer"
                onClick={() => setViewEntry(log)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                    {formatAction(log.action)}
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[log.status] ?? statusColors.SUCCESS}`}>
                    {log.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sectionColors[section] ?? sectionColors.System}`}>
                    {section}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{os} · {browser}</span>
                  <span className="text-[10px] text-gray-400">IP: {log.ip_address}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{formatDate(log.created_at)}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop — table view */}
      <div className="hidden sm:block overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
              {["Timestamp", "Device", "Action", "Section", "Status", ""].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 py-2 whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j} className="py-2.5"><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[12px] text-gray-400 py-8">No activity logs found</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const { browser, os } = parseUA(log.user_agent ?? "");
                const section = getSection(log.action);
                return (
                  <TableRow key={log.id} className="border-gray-100/80 dark:border-gray-700/20 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                    <TableCell className="text-[11px] text-gray-600 dark:text-gray-400 py-2.5 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <p className="text-[12px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">{os}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500">{browser}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600">IP: {log.ip_address}</p>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatAction(log.action)}
                      </p>
                      {log.details?.email && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-500">{log.details.email}</p>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${sectionColors[section] ?? sectionColors.System}`}>
                        {section}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusColors[log.status] ?? statusColors.SUCCESS}`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <button
                        onClick={() => setViewEntry(log)}
                        className="px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 border border-gray-200/60 dark:border-gray-700/40 transition-all whitespace-nowrap"
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{logs.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{rawLogs.length}</span>{" "}
          entries
          {search && <span className="text-gray-400"> (filtered)</span>}
        </p>
      </div>

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold text-gray-900 dark:text-white">Activity Detail</DialogTitle>
            <DialogDescription className="text-[11px] text-gray-500 dark:text-gray-400">Full details for this log entry.</DialogDescription>
          </DialogHeader>
          {viewEntry && (() => {
            const { browser, os } = parseUA(viewEntry.user_agent ?? "");
            return (
              <div className="space-y-3 py-1">
                {[
                  { label: "Timestamp",  value: formatDate(viewEntry.created_at)         },
                  { label: "Action",     value: formatAction(viewEntry.action)            },
                  { label: "Section",    value: getSection(viewEntry.action)              },
                  { label: "Device",     value: `${os} · ${browser}`                     },
                  { label: "IP Address", value: viewEntry.ip_address                     },
                  { label: "Status",     value: viewEntry.status                         },
                  ...(viewEntry.resource_type ? [{ label: "Resource", value: viewEntry.resource_type }] : []),
                  ...(viewEntry.details
                    ? Object.entries(viewEntry.details).map(([k, v]) => ({
                        label: k.charAt(0).toUpperCase() + k.slice(1),
                        value: String(v),
                      }))
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
                    <span className="text-[11px] font-medium text-gray-900 dark:text-white text-right break-all">{value}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};