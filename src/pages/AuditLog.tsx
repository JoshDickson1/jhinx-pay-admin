import { useState } from "react";
import {
  Search, Download, ChevronLeft, ChevronRight,
  ChevronDown, Shield, Monitor, Smartphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const parseUA = (ua: string) => {
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
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
    : "Unknown";
  return { browser, os, isMobile };
};

const ACTION_LABELS: Record<string, string> = {
  "admin.login.json": "Login",
  "admin.login.failed": "Failed Login",
  "admin.logout": "Logout",
  "admin.features.pause": "Paused Feature",
  "admin.features.resume": "Resumed Feature",
  "admin.management.permissions.add": "Added Permission",
  "admin.management.permissions.remove": "Removed Permission",
  "admin.management.permissions.reset": "Reset Permissions",
  "admin.management.role_update": "Updated Role",
  "admin.management.suspend": "Suspended Admin",
  "admin.management.resume": "Resumed Admin",
  "admin.management.audit_logs.read": "Viewed Audit Logs",
  "admin.management.delete": "Deleted Admin",
  "admin.users.create": "Created Admin",
  "admin.platform_users.flag": "Flagged User",
  "admin.platform_users.unflag": "Unflagged User",
  "admin.platform_users.update_status": "Updated User Status",
  "admin.transactions.flag": "Flagged Transaction",
  "admin.transactions.refund": "Processed Refund",
  "admin.support.ticket.reply": "Replied to Ticket",
  "admin.support.ticket.close": "Closed Ticket",
  "admin.support.ticket.resolve": "Resolved Ticket",
  "admin.support.ticket.assign": "Assigned Ticket",
  "admin.platform_notifications.create": "Created Notification",
  "admin.platform_notifications.dispatch": "Dispatched Notification",
  "admin.profile.update": "Updated Profile",
  "admin.security.password.change": "Changed Password",
  "support.ticket.close": "Closed Ticket",
  "support.ticket.resolve": "Resolved Ticket",
  "support.ticket.reply": "Replied to Ticket",
  "support.ticket.assign": "Assigned Ticket",
};

const getActionLabel = (action: string) =>
  ACTION_LABELS[action] ?? action.split(".").slice(1).map((w) =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(" ");

const getActionColor = (action: string, status: string) => {
  if (status === "FAILED" || status === "ERROR")
    return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-500/20";
  if (action.includes("pause") || action.includes("suspend") || action.includes("flag") || action.includes("remove") || action.includes("ban") || action.includes("freeze"))
    return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20";
  if (action.includes("resume") || action.includes("unflag") || action.includes("unban") || action.includes("unfreeze") || action.includes("approve"))
    return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-500/20";
  if (action.includes("login"))
    return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20";
  if (action.includes("delete") || action.includes("reject"))
    return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-500/20";
  return "bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/40";
};

const getResourceLabel = (type: string | null, id: string | null) => {
  if (!type && !id) return "—";
  const label = type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";
  const shortId = id ? id.slice(0, 8).toUpperCase() : "";
  return label ? `${label}: ${shortId}` : shortId;
};

const formatDetails = (details: Record<string, any> | null) => {
  if (!details) return "—";
  return Object.entries(details)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join(", ");
};

const LIMIT = 25;

// ── Component ─────────────────────────────────────────────────────────────────

const AuditLog = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search, actionFilter, statusFilter],
    queryFn: () =>
      api.get("/admin/admin-logs", {
        params: { limit: LIMIT, page },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const logs: LogEntry[] = data?.items ?? [];
  const total: number = data?.total ?? logs.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Client-side filtering
  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      log.action.toLowerCase().includes(q) ||
      (log.resource_type ?? "").toLowerCase().includes(q) ||
      (log.resource_id ?? "").toLowerCase().includes(q) ||
      (log.ip_address ?? "").includes(q) ||
      getActionLabel(log.action).toLowerCase().includes(q);
    const matchAction = actionFilter === "all" ||
      (actionFilter === "login" && log.action.includes("login")) ||
      (actionFilter === "features" && log.action.includes("features")) ||
      (actionFilter === "management" && log.action.includes("management")) ||
      (actionFilter === "users" && log.action.includes("users")) ||
      (actionFilter === "support" && log.action.includes("support")) ||
      (actionFilter === "transactions" && log.action.includes("transactions"));
    const matchStatus = statusFilter === "all" || log.status === statusFilter;
    return matchSearch && matchAction && matchStatus;
  });

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["Timestamp", "Action", "Resource", "Status", "IP", "Details"];
    const rows = filtered.map((l) => [
      formatDate(l.created_at),
      getActionLabel(l.action),
      getResourceLabel(l.resource_type, l.resource_id),
      l.status,
      l.ip_address,
      formatDetails(l.details),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const FilterSelect = ({
    value, onChange, options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none transition-all"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              Full trail of admin actions across the platform
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search action, resource, IP..."
              className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <FilterSelect
              value={actionFilter}
              onChange={(v) => { setActionFilter(v); setPage(1); }}
              options={[
                { value: "all", label: "All Actions" },
                { value: "login", label: "Login / Auth" },
                { value: "features", label: "Features" },
                { value: "management", label: "Admin Mgmt" },
                { value: "users", label: "Users" },
                { value: "transactions", label: "Transactions" },
                { value: "support", label: "Support" },
              ]}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={[
                { value: "all", label: "All Status" },
                { value: "SUCCESS", label: "Success" },
                { value: "FAILED", label: "Failed" },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Timestamp", "Admin", "Action", "Resource", "Details", "Status", "Device"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const { browser, os, isMobile } = parseUA(log.user_agent ?? "");
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[12px] text-gray-700 dark:text-gray-300">
                          {formatDate(log.created_at)}
                        </p>
                      </td>

                      {/* Admin */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-semibold">
                              {log.admin_user_id ? log.admin_user_id.slice(0, 2).toUpperCase() : "SY"}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                            {log.admin_user_id ? log.admin_user_id.slice(0, 8).toUpperCase() : "System"}
                          </p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap",
                          getActionColor(log.action, log.status)
                        )}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>

                      {/* Resource */}
                      <td className="px-4 py-3">
                        <div>
                          {log.resource_type && (
                            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {log.resource_type.replace(/_/g, " ")}
                            </p>
                          )}
                          {log.resource_id && (
                            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                              {log.resource_id.length > 8
                                ? log.resource_id.slice(0, 8).toUpperCase() + "…"
                                : log.resource_id}
                            </p>
                          )}
                          {!log.resource_type && !log.resource_id && (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 max-w-[200px]">
                        {log.details ? (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {formatDetails(log.details)}
                          </p>
                        ) : log.message ? (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {log.message}
                          </p>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          log.status === "SUCCESS"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        )}>
                          {log.status}
                        </span>
                      </td>

                      {/* Device */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isMobile
                            ? <Smartphone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            : <Monitor className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          }
                          <div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{os}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">{browser}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span>{" "}
            entries
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <span className="text-[11px] text-gray-500 px-2">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.4); }
      `}</style>
    </div>
  );
};

export default AuditLog;