import { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  timestamp: string;
  device: string;
  browser: string;
  ip: string;
  activity: string;
  section: string;
  target: { name: string; email?: string; avatar?: string } | null;
}

const sectionColors: Record<string, string> = {
  System: "bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-700/40",
  Transactions: "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Users: "bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  "Rates & Controls": "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  Settings: "bg-orange-50 text-orange-600 border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

const useAdminLogs = (page: number, search: string, sort: string) =>
  useQuery({
    queryKey: ["admin", "logs", page, search, sort],
    queryFn: () =>
      api.get("/admin/admin-logs", {
        params: {
          page,
          limit: 25,
          search: search || undefined,
          order: sort === "Newest First" ? "desc" : "asc",
        },
      }).then((r) => r.data),
  });

export const ActivityLogsTab = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest First");
  const [page, setPage] = useState(1);
  const [viewEntry, setViewEntry] = useState<LogEntry | null>(null);

  const { data, isLoading } = useAdminLogs(page, search, sort);

  const logs: LogEntry[] = data?.logs ?? data?.items ?? data?.data ?? [];
  const total: number = data?.total ?? logs.length;

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Activity Logs</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search activities...."
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

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
              {["Timestamp", "Device", "Activity", "Section", "Target", ""].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 py-2">{h}</TableHead>
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
              logs.map((log) => (
                <TableRow key={log.id} className="border-gray-100/80 dark:border-gray-700/20 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                  <TableCell className="text-[11px] text-gray-600 dark:text-gray-400 py-2.5 whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="py-2.5">
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{log.device}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500">{log.browser}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600">IP:{log.ip}</p>
                  </TableCell>
                  <TableCell className="text-[12px] font-medium text-gray-800 dark:text-gray-200 py-2.5">{log.activity}</TableCell>
                  <TableCell className="py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sectionColors[log.section] ?? sectionColors.System}`}>
                      {log.section}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    {log.target ? (
                      <div className="flex items-center gap-2">
                        {log.target.avatar !== undefined && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden flex-shrink-0">
                            {log.target.avatar
                              ? <img src={log.target.avatar} className="w-full h-full object-cover" />
                              : <span className="text-white text-[9px] font-bold flex items-center justify-center h-full">{log.target.name[0]}</span>
                            }
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{log.target.name}</p>
                          {log.target.email && <p className="text-[10px] text-gray-500 dark:text-gray-500">{log.target.email}</p>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <button
                      onClick={() => setViewEntry(log)}
                      className="px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 border border-gray-200/60 dark:border-gray-700/40 transition-all"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{logs.length}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span> activities
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40"
          >
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={logs.length < 25}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold text-gray-900 dark:text-white">Activity Detail</DialogTitle>
            <DialogDescription className="text-[11px] text-gray-500 dark:text-gray-400">Full details for this log entry.</DialogDescription>
          </DialogHeader>
          {viewEntry && (
            <div className="space-y-3 py-1">
              {[
                { label: "Timestamp", value: viewEntry.timestamp },
                { label: "Activity", value: viewEntry.activity },
                { label: "Section", value: viewEntry.section },
                { label: "Device", value: `${viewEntry.device} · ${viewEntry.browser}` },
                { label: "IP Address", value: viewEntry.ip },
                { label: "Target", value: viewEntry.target?.name ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
                  <span className="text-[11px] font-medium text-gray-900 dark:text-white text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};