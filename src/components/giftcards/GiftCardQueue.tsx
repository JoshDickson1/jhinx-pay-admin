import { useState } from "react";
import {
  Search, Clock, ChevronDown, Eye, CheckCircle, XCircle,
  MoreHorizontal, ChevronLeft, ChevronRight, FileDown, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api/axiosInstance";

// ── Types — matched to real API ───────────────────────────────────────────────

interface GiftCardSubmission {
  id: string;                    // UUID — used in API paths
  transaction_id?: string;       // may also exist
  created_at: string;
  user_id: string;
  user_email?: string;
  user_full_name?: string | null;
  brand?: string;
  card_brand?: string;
  card_value_usd?: number;
  amount_usd?: number;
  payout_ngn?: number;
  amount_ngn?: number;
  status: string;                // "pending" | "approved" | "rejected" | "on_hold"
  risk_level?: string;           // "Low" | "Mid" | "High"
  risk_score?: number;
  time_elapsed_seconds?: number;
  review_time_seconds?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getBrand    = (s: GiftCardSubmission) => s.brand ?? s.card_brand ?? "—";
const getValueUsd = (s: GiftCardSubmission) => s.card_value_usd ?? s.amount_usd ?? 0;
const getPayoutNgn= (s: GiftCardSubmission) => s.payout_ngn ?? s.amount_ngn ?? 0;
const getRisk     = (s: GiftCardSubmission): string => s.risk_level ?? (s.risk_score != null ? (s.risk_score < 40 ? "Low" : s.risk_score < 70 ? "Mid" : "High") : "—");

const formatElapsed = (s?: number) => {
  if (!s) return "—";
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const riskStyles: Record<string, string> = {
  Low:  "border border-green-500 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Mid:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  High: "border border-red-500 text-red-600 dark:text-red-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

const LIMIT = 20;

// ── User summary shown in quick action dialogs ────────────────────────────────

const QuickUserSummary = ({ sub }: { sub: GiftCardSubmission }) => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2.5">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">
          {(sub.user_full_name ?? sub.user_email ?? "U")[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
          {sub.user_full_name ?? sub.user_email ?? "User"}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{sub.user_email ?? "—"}</p>
      </div>
      {getRisk(sub) !== "—" && (
        <Badge className={riskStyles[getRisk(sub)] ?? riskStyles.Low}>{getRisk(sub)}</Badge>
      )}
    </div>
    <div className="space-y-1">
      {[
        { label: "Transaction ID", value: sub.id.slice(0, 8).toUpperCase() },
        { label: "Brand",          value: getBrand(sub) },
        { label: "Card Value",     value: `$${getValueUsd(sub)}` },
        { label: "Payout",         value: `₦${getPayoutNgn(sub).toLocaleString("en-NG")}` },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}:</span>
          <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const FilterSelect = ({
  value, setter, options,
}: { value: string; setter: (v: string) => void; options: string[] }) => (
  <div className="relative">
    <select value={value} onChange={(e) => setter(e.target.value)}
      className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all focus:outline-none whitespace-nowrap"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const GiftCardQueue = () => {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [search,       setSearch]       = useState("");
  const [sort,         setSort]         = useState("Oldest First");
  const [brandFilter,  setBrandFilter]  = useState("All Brands");
  const [riskFilter,   setRiskFilter]   = useState("All Risk Level");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [page,         setPage]         = useState(1);

  // Quick Approve dialog
  const [approveTarget, setApproveTarget] = useState<GiftCardSubmission | null>(null);
  const [approveMsg,    setApproveMsg]    = useState("");
  const [approvePush,   setApprovePush]   = useState(true);
  const [approveEmail,  setApproveEmail]  = useState(true);

  // Quick Reject dialog
  const [rejectTarget, setRejectTarget] = useState<GiftCardSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg,    setRejectMsg]    = useState("");
  const [rejectPush,   setRejectPush]   = useState(true);
  const [rejectEmail,  setRejectEmail]  = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["gc-submissions", page, search, sort, brandFilter, riskFilter, statusFilter],
    queryFn: () =>
      api.get("/admin/giftcards/submissions", {
        params: {
          limit: LIMIT,
          offset: (page - 1) * LIMIT,
          search:     search || undefined,
          status:     statusFilter !== "All Status" ? statusFilter.toLowerCase() : undefined,
          brand:      brandFilter  !== "All Brands" ? brandFilter              : undefined,
          risk_level: riskFilter   !== "All Risk Level" ? riskFilter           : undefined,
          sort:       sort === "Newest First" ? "desc" : "asc",
        },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000,
  });

  const submissions: GiftCardSubmission[] = data?.items ?? [];
  const total: number = data?.pagination?.total ?? 0;
  const totalPages    = Math.max(1, Math.ceil(total / LIMIT));

  const applyFilter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  // ── Quick Approve mutation ─────────────────────────────────────────────────
  const quickApproveMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/admin/giftcards/submissions/${id}/quick-approve`, {
        message: approveMsg || undefined,
        notify_push:  approvePush,
        notify_email: approveEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submissions"] });
      qc.invalidateQueries({ queryKey: ["gc-stats"] });
      toast.success("Gift card approved");
      setApproveTarget(null);
      setApproveMsg("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to approve";
      if (err?.response?.status === 501) {
        toast.info("Quick approve is a backend placeholder — not yet active");
      } else {
        toast.error(typeof msg === "string" ? msg : "Approval failed");
      }
      setApproveTarget(null);
    },
  });

  // ── Quick Reject mutation ──────────────────────────────────────────────────
  const quickRejectMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/admin/giftcards/submissions/${id}/quick-reject`, {
        reason:       rejectReason,
        message:      rejectMsg || undefined,
        notify_push:  rejectPush,
        notify_email: rejectEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submissions"] });
      qc.invalidateQueries({ queryKey: ["gc-stats"] });
      toast.success("Gift card rejected");
      setRejectTarget(null);
      setRejectReason("");
      setRejectMsg("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to reject";
      if (err?.response?.status === 501) {
        toast.info("Quick reject is a backend placeholder — not yet active");
      } else {
        toast.error(typeof msg === "string" ? msg : "Rejection failed");
      }
      setRejectTarget(null);
    },
  });

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

      {/* Search + Filters */}
      <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID or user..."
            className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect value={sort}         setter={applyFilter(setSort)}         options={["Oldest First", "Newest First"]} />
          <FilterSelect value={statusFilter} setter={applyFilter(setStatusFilter)} options={["Pending", "All Status", "approved", "rejected", "on_hold"]} />
          <FilterSelect value={brandFilter}  setter={applyFilter(setBrandFilter)}  options={["All Brands", "Amazon", "iTunes", "eBay", "PlayStation", "Steam", "Google Play"]} />
          <FilterSelect value={riskFilter}   setter={applyFilter(setRiskFilter)}   options={["All Risk Level", "Low", "Mid", "High"]} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
              {["Submission ID", "User", "Card Brand", "Card Value", "Payout", "Time Elapsed", "Risk Level", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{[...Array(9)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>)}</tr>
              ))
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Queue is clear</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">No gift card submissions match your filters</p>
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => navigate(`/transactions/gift-cards/${sub.id}`)}
                  className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white font-mono">
                      {sub.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-gray-500">{formatDate(sub.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {(sub.user_full_name ?? sub.user_email ?? "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                          {sub.user_full_name ?? sub.user_email ?? "—"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{sub.user_email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-gray-800 dark:text-gray-200">{getBrand(sub)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-semibold text-gray-900 dark:text-white">
                      ${getValueUsd(sub)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-semibold text-gray-900 dark:text-white">
                      ₦{getPayoutNgn(sub).toLocaleString("en-NG")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[12px]">
                        {formatElapsed(sub.time_elapsed_seconds ?? sub.review_time_seconds)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRisk(sub) !== "—" ? (
                      <Badge className={riskStyles[getRisk(sub)] ?? riskStyles.Low}>{getRisk(sub)}</Badge>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn(
                      "border rounded-full text-[11px] font-semibold px-3 py-0.5 bg-transparent",
                      sub.status === "pending"  && "border-orange-400 text-orange-600 dark:text-orange-400",
                      sub.status === "approved" && "border-green-500 text-green-600 dark:text-green-400",
                      sub.status === "rejected" && "border-red-500 text-red-600 dark:text-red-400",
                      sub.status === "on_hold"  && "border-blue-400 text-blue-600 dark:text-blue-400",
                    )}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1).replace("_", " ")}
                    </Badge>
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
                          onClick={() => navigate(`/transactions/gift-cards/${sub.id}`)}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" /> Full Review
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                        <DropdownMenuItem
                          disabled={sub.status !== "pending"}
                          onClick={() => { setApproveTarget(sub); setApproveMsg(""); }}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Quick Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={sub.status !== "pending"}
                          onClick={() => { setRejectTarget(sub); setRejectReason(""); setRejectMsg(""); }}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" /> Quick Reject
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
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{total}</span> submissions
        </p>
        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>
          <span className="text-[11px] text-gray-500 px-2">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Quick Approve Dialog ── */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Quick Approve</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Approve and payout{" "}
              {approveTarget && (
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  ₦{getPayoutNgn(approveTarget).toLocaleString("en-NG")}
                </span>
              )}{" "}
              to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-3 py-1">
              <QuickUserSummary sub={approveTarget} />
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Message to user <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={approveMsg}
                  onChange={(e) => setApproveMsg(e.target.value)}
                  placeholder="Your gift card has been approved and payment has been processed..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span>
                  <Switch checked={approvePush} onCheckedChange={setApprovePush} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span>
                  <Switch checked={approveEmail} onCheckedChange={setApproveEmail} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setApproveTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={quickApproveMutation.isPending}
              onClick={() => approveTarget && quickApproveMutation.mutate(approveTarget.id)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {quickApproveMutation.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Approving…</>
                : <><CheckCircle className="w-3.5 h-3.5" /> Confirm Approval</>
              }
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Quick Reject Dialog ── */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Quick Reject</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Select a reason and optionally notify the user.</DialogDescription>
          </DialogHeader>
          {rejectTarget && (
            <div className="space-y-3 py-1">
              <QuickUserSummary sub={rejectTarget} />
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Rejection reason <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer"
                  >
                    <option value="">Select a reason...</option>
                    <option>Invalid / Redeemed Code</option>
                    <option>Photo Doesn't Match</option>
                    <option>Unsupported Region</option>
                    <option>Suspected Fraud</option>
                    <option>Partially Used Card</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Message to user <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={rejectMsg}
                  onChange={(e) => setRejectMsg(e.target.value)}
                  placeholder="We were unable to process your gift card because..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span>
                  <Switch checked={rejectPush} onCheckedChange={setRejectPush} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span>
                  <Switch checked={rejectEmail} onCheckedChange={setRejectEmail} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={!rejectReason || quickRejectMutation.isPending}
              onClick={() => rejectTarget && quickRejectMutation.mutate(rejectTarget.id)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {quickRejectMutation.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rejecting…</>
                : <><XCircle className="w-3.5 h-3.5" /> Confirm Reject</>
              }
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