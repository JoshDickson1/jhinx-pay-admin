import { useState } from "react";
import {
  ArrowLeftRight, Eye, Download, Search, MoreHorizontal,
  Calendar, FileDown, ChevronDown, TrendingUp, TrendingDown,
  CheckCircle, Clock, XCircle, Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActivityItem {
  transaction_id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  title: string;
  amount_ngn: number;
  created_at: string;
  status: string;
  crypto_amount: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatVolume = (v: number) =>
  v === 0 ? "₦0" : `₦${v.toLocaleString("en-NG")}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatDelta = (delta: number | null, label: string) => {
  if (delta === null) return { text: label, up: true };
  return {
    text: `${delta > 0 ? "+" : ""}${delta}% ${label}`,
    up: delta >= 0,
  };
};

const tabs = [
  { id: "all", label: "All" },
  { id: "giftcard", label: "Giftcard" },
  { id: "crypto", label: "Crypto" },
  { id: "gamepoints", label: "Gamepoints" },
];

const FilterSelect = ({
  value, setter, options,
}: {
  value: string;
  setter: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => setter(e.target.value)}
      className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 transition-all"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const Transactions = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exportOpen, setExportOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [flagTarget, setFlagTarget] = useState<ActivityItem | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagNote, setFlagNote] = useState("");
  const [refundTarget, setRefundTarget] = useState<ActivityItem | null>(null);
  const [refundMsg, setRefundMsg] = useState("");
  const [refundPush, setRefundPush] = useState(true);
  const [refundEmail, setRefundEmail] = useState(true);
  // ── Stats ──────────────────────────────────────────────────────────────────

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["tx-stats"],
    queryFn: () => api.get("/admin/transactions/stats").then((r) => r.data),
  });

  const metrics = statsData
    ? [
        {
          label: "Total Transactions",
          value: statsData.total_transactions?.value?.toLocaleString() ?? "0",
          ...formatDelta(statsData.total_transactions?.delta_percent, statsData.total_transactions?.delta_label),
          icon: ArrowLeftRight,
        },
        {
          label: "Pending Actions",
          value: statsData.pending_actions?.value?.toLocaleString() ?? "0",
          ...formatDelta(statsData.pending_actions?.delta_percent, statsData.pending_actions?.delta_label),
          icon: Clock,
        },
        {
          label: "Transaction Volume",
          value: formatVolume(statsData.transaction_volume_ngn?.value ?? 0),
          ...formatDelta(statsData.transaction_volume_ngn?.delta_percent, statsData.transaction_volume_ngn?.delta_label),
          icon: TrendingUp,
        },
        {
          label: "Success Rate",
          value: `${statsData.success_rate?.value ?? 0}%`,
          ...formatDelta(statsData.success_rate?.delta_percent, statsData.success_rate?.delta_label),
          icon: CheckCircle,
        },
        {
          label: "Failed Transactions",
          value: statsData.failed_transactions?.value?.toLocaleString() ?? "0",
          ...formatDelta(statsData.failed_transactions?.delta_percent, statsData.failed_transactions?.delta_label),
          icon: XCircle,
        },
      ]
    : [];

  // ── Transaction List (activity feed) ─────────────────────────────────────

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: () => api.get("/admin/activity-feed").then((r) => r.data),
    refetchInterval: 30000,
  });

  const allItems: ActivityItem[] = feedData?.items ?? [];

  const filtered = allItems.filter((tx) => {
    const q = search.toLowerCase();
    const matchSearch =
      tx.transaction_id.toLowerCase().includes(q) ||
      tx.user_full_name.toLowerCase().includes(q) ||
      tx.user_email.toLowerCase().includes(q) ||
      tx.title.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || tx.status.toLowerCase() === statusFilter;
    const matchTab =
      activeTab === "all" ||
      (activeTab === "giftcard" && tx.title.toLowerCase().includes("gift")) ||
      (activeTab === "crypto" && (tx.title.toLowerCase().includes("crypto") || tx.crypto_amount !== null)) ||
      (activeTab === "gamepoints" && tx.title.toLowerCase().includes("game"));
    return matchSearch && matchStatus && matchTab;
  });

  // ── Flag Mutation ─────────────────────────────────────────────────────────

  const flagMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/transactions/${id}/flag`, { reason }),
    onSuccess: () => {
      toast.success("Transaction flagged for review");
      setFlagTarget(null);
      setFlagReason("");
      setFlagNote("");
    },
    onError: () => toast.error("Failed to flag transaction"),
  });

  // ── CSV Export ────────────────────────────────────────────────────────────

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/admin/transactions/export.csv", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
      setExportOpen(false);
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[12px]">View and monitor all platform transactions</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[16px]" />
            ))
          : metrics.map(({ label, value, text, up, icon: Icon }) => (
              <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
                  <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                  <p className={cn("text-[11px] mt-1 flex items-center gap-1", up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {text}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Date + Export row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          {statsData?.range
            ? `${statsData.range.start_date} – ${statsData.range.end_date}`
            : "Sort by date"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </button>
          {/* <button
            onClick={() => setInvoiceOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download Invoices
          </button> */}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Tabs + Search */}
        <div className="px-4 pt-3 pb-0 border-b border-gray-100/80 dark:border-gray-700/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            <div className="flex items-end gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 pb-2.5 text-[13px] font-semibold border-b-2 transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-2.5 ml-auto flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID or user..."
                  className="pl-8 h-9 w-56 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400"
                />
              </div>
              <FilterSelect
                value={statusFilter}
                setter={setStatusFilter}
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Transaction ID", "User", "Title", "Amount", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {feedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                    <td className="px-4 py-3"><Skeleton className="h-3.5 w-28" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2.5 w-32" />
                        </div>
                      </div>
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-3.5 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">
                    {allItems.length === 0 ? "No transactions yet" : "No transactions match your filters"}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                    className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-bold text-gray-900 dark:text-white font-mono">
                        {tx.transaction_id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500">{formatDate(tx.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {(tx.user_full_name?.[0] ?? "?").toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{tx.user_full_name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{tx.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200">{tx.title}</span>
                      {tx.crypto_amount && (
                        <p className="text-[10px] text-gray-400">{tx.crypto_amount}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                        {formatVolume(tx.amount_ngn)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        "border rounded-full text-[11px] font-semibold px-3 py-0.5 bg-transparent",
                        tx.status.toLowerCase() === "completed" || tx.status.toLowerCase() === "success"
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : tx.status.toLowerCase() === "pending"
                          ? "border-orange-400 text-orange-600 dark:text-orange-400"
                          : "border-red-500 text-red-600 dark:text-red-400"
                      )}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                            <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl">
                          <DropdownMenuLabel className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                            className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setRefundTarget(tx); setRefundMsg(""); }}
                            className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" /> Refund
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                          <DropdownMenuItem
                            onClick={() => { setFlagTarget(tx); setFlagReason(""); setFlagNote(""); }}
                            className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-orange-600 dark:text-orange-400"
                          >
                            <Flag className="w-3.5 h-3.5" /> Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{allItems.length}</span> transactions
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-400 cursor-not-allowed opacity-50">Previous</button>
            <button disabled className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-400 cursor-not-allowed opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* ── Export CSV Dialog ── */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Export CSV</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Download all transactions as a CSV file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-[12px] text-gray-600 dark:text-gray-400 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] px-3 py-2.5">
              The export will include: reference, type, amount, status, date, and user ID for all transactions.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setExportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              onClick={handleExportCSV}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" /> Export
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Download Invoices Dialog ── */}
      {/* <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Download Invoices</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Select format and period.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Format", opts: ["PDF", "Excel (.xlsx)", "CSV"] },
              { label: "Period", opts: ["This month", "Last month", "Last 3 months"] },
            ].map(({ label, opts }) => (
              <div key={label} className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                <div className="relative">
                  <select className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setInvoiceOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setInvoiceOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* ── Flag Dialog ── */}
      <Dialog open={!!flagTarget} onOpenChange={() => setFlagTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Flag for Review</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Escalate this transaction for manual review.
            </DialogDescription>
          </DialogHeader>
          {flagTarget && (
            <div className="space-y-3 py-1">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-1.5">
                {[
                  { label: "Transaction ID", value: flagTarget.transaction_id.slice(0, 8).toUpperCase() },
                  { label: "User", value: flagTarget.user_full_name },
                  { label: "Amount", value: formatVolume(flagTarget.amount_ngn) },
                  { label: "Title", value: flagTarget.title },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[11px] text-gray-500">{label}:</span>
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Flag reason</Label>
                <div className="relative">
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer"
                  >
                    <option value="">Select reason...</option>
                    <option>Suspected fraud</option>
                    <option>Unusual activity</option>
                    <option>Large transaction</option>
                    <option>User complaint</option>
                    <option>Compliance review</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Internal note <span className="text-gray-400 font-normal">(admins only)</span>
                </Label>
                <Textarea
                  value={flagNote}
                  onChange={(e) => setFlagNote(e.target.value)}
                  placeholder="Add context for the review team..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setFlagTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={!flagReason || flagMutation.isPending}
              onClick={() => {
                if (flagTarget && flagReason) {
                  flagMutation.mutate({ id: flagTarget.transaction_id, reason: flagReason });
                }
              }}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {flagMutation.isPending ? "Flagging…" : <><Flag className="w-3.5 h-3.5" /> Flag Transaction</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog (placeholder — no endpoint yet) ── */}
      <Dialog open={!!refundTarget} onOpenChange={() => setRefundTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Process Refund</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Refund <span className="font-semibold text-orange-600 dark:text-orange-400">{refundTarget && formatVolume(refundTarget.amount_ngn)}</span> to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          {refundTarget && (
            <div className="space-y-3 py-1">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-1.5">
                {[
                  { label: "Transaction ID", value: refundTarget.transaction_id.slice(0, 8).toUpperCase() },
                  { label: "User", value: refundTarget.user_full_name },
                  { label: "Amount", value: formatVolume(refundTarget.amount_ngn) },
                  { label: "Title", value: refundTarget.title },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[11px] text-gray-500">{label}:</span>
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Message to user <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={refundMsg}
                  onChange={(e) => setRefundMsg(e.target.value)}
                  placeholder="Your refund has been processed and will reflect shortly..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span>
                  <Switch checked={refundPush} onCheckedChange={setRefundPush} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span>
                  <Switch checked={refundEmail} onCheckedChange={setRefundEmail} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>
              <p className="text-[11px] text-orange-500/80 dark:text-orange-400/70 flex items-center gap-1">
                ⚠ Refund endpoint pending — backend implementation required.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setRefundTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              onClick={() => {
                if (refundTarget) {
                  // Wire when backend confirms the endpoint works on list-level too
                  toast.info("Open the transaction detail to process a refund");
                  setRefundTarget(null);
                }
              }}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Confirm Refund
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default Transactions;