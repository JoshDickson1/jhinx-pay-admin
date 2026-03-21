import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, ArrowLeftRight, Flag, FlagOff, FileText,
  ExternalLink, ChevronDown, AlertTriangle, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/api/axiosInstance";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatVolume = (v: number) =>
  v === 0 ? "₦0" : `₦${v.toLocaleString("en-NG")}`;

// ── Component ─────────────────────────────────────────────────────────────────

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // dialog state
  const [newNote, setNewNote]         = useState("");
  const [refundOpen, setRefundOpen]   = useState(false);
  const [flagOpen, setFlagOpen]       = useState(false);
  const [unflagOpen, setUnflagOpen]   = useState(false);
  const [noteOpen, setNoteOpen]       = useState(false);
  const [flagReason, setFlagReason]   = useState("");
  const [flagNote, setFlagNote]       = useState("");
  const [refundMsg, setRefundMsg]     = useState("");
  const [refundPush, setRefundPush]   = useState(true);
  const [refundEmail, setRefundEmail] = useState(true);
  const [refundReason, setRefundReason] = useState("");

  // ── Fetch transaction detail ───────────────────────────────────────────────
  const { data: tx, isLoading } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => api.get(`/admin/transactions/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  // ── Fetch notes (separate endpoint) ───────────────────────────────────────
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ["transaction-notes", id],
    queryFn: () => api.get(`/admin/transactions/${id}/notes`).then((r) => r.data),
    enabled: !!id,
  });

  // Normalise notes from API (may be { items: [] } or [])
  const apiNotes: any[] = notesData?.items ?? notesData?.notes ?? (Array.isArray(notesData) ? notesData : []);

  // ── Fetch flag details (shown when tx is flagged) ─────────────────────────
  const isFlagged = tx?.is_flagged_for_review === true || tx?.is_flagged === true;

  const { data: flagDetails } = useQuery({
    queryKey: ["transaction-flag", id],
    queryFn: () => api.get(`/admin/transactions/${id}/flag`).then((r) => r.data),
    enabled: !!id && isFlagged,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const flagMutation = useMutation({
    mutationFn: ({ reason, note }: { reason: string; note?: string }) =>
      api.post(`/admin/transactions/${id}/flag`, { reason, note: note || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transaction", id] });
      qc.invalidateQueries({ queryKey: ["transaction-flag", id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction flagged for review");
      setFlagOpen(false);
      setFlagReason("");
      setFlagNote("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to flag transaction";
      toast.error(typeof msg === "string" ? msg : "Failed to flag transaction");
    },
  });

  const unflagMutation = useMutation({
    mutationFn: () => api.post(`/admin/transactions/${id}/unflag`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transaction", id] });
      qc.invalidateQueries({ queryKey: ["transaction-flag", id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction unflagged");
      setUnflagOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to unflag transaction";
      toast.error(typeof msg === "string" ? msg : "Failed to unflag transaction");
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ reason, message }: { reason: string; message?: string }) =>
      api.post(`/admin/transactions/${id}/refund`, {
        reason,
        message: message || undefined,
        notify_push: refundPush,
        notify_email: refundEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transaction", id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Refund processed successfully");
      setRefundOpen(false);
      setRefundReason("");
      setRefundMsg("");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.detail;
      if (status === 501 || status === 422) {
        toast.error("Refund endpoint not yet active — contact the backend team");
      } else {
        toast.error(typeof msg === "string" ? msg : "Failed to process refund");
      }
    },
  });

  const noteMutation = useMutation({
    mutationFn: (note: string) =>
      api.post(`/admin/transactions/${id}/notes`, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transaction-notes", id] });
      setNewNote("");
      setNoteOpen(false);
      toast.success("Note saved");
    },
    onError: () => {
      toast.error("Failed to save note");
      setNoteOpen(false);
    },
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Skeleton className="h-8 w-24 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
          <Skeleton className="h-96 rounded-l-[16px]" />
          <Skeleton className="h-96 rounded-r-[16px]" />
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertTriangle className="w-8 h-8 text-orange-400" />
        <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Transaction not found</p>
        <button
          onClick={() => navigate("/transactions")}
          className="text-[13px] text-orange-500 hover:underline"
        >
          ← Back to transactions
        </button>
      </div>
    );
  }

  const statusColor =
    (tx.status ?? "").toLowerCase() === "completed" || (tx.status ?? "").toLowerCase() === "success"
      ? "border-green-500 text-green-600 dark:text-green-400"
      : (tx.status ?? "").toLowerCase() === "pending"
      ? "border-orange-400 text-orange-600 dark:text-orange-400"
      : "border-red-500 text-red-600 dark:text-red-400";

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Flag alert banner */}
      {isFlagged && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-[14px] px-4 py-3 flex items-start gap-3">
          <Flag className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-orange-700 dark:text-orange-400">
              Flagged for review
            </p>
            {flagDetails && (
              <p className="text-[11px] text-orange-600/80 dark:text-orange-400/70 mt-0.5">
                Reason: {flagDetails.reason ?? "—"}
                {flagDetails.flagged_by_admin_name && ` · by ${flagDetails.flagged_by_admin_name}`}
                {flagDetails.created_at && ` · ${formatDate(flagDetails.created_at)}`}
              </p>
            )}
          </div>
          <button
            onClick={() => setUnflagOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white dark:bg-[#1C1C1C] border border-orange-200/60 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all flex-shrink-0"
          >
            <FlagOff className="w-3 h-3" /> Unflag
          </button>
        </div>
      )}

      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">

          {/* ── Left panel ─────────────────────────────────────────────────── */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-100/80 dark:border-gray-700/20 space-y-5">

            {/* User avatar + info */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {(tx.user_full_name?.[0] ?? "?").toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                  {tx.user_full_name ?? "—"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{tx.user_email ?? "—"}</p>
              </div>
              {tx.user_id && (
                <Link
                  to={`/users/${tx.user_id}`}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 transition-all"
                >
                  View user profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100/80 dark:border-gray-700/20" />

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Refund",   icon: ArrowLeftRight, action: () => setRefundOpen(true),  color: "text-blue-500" },
                { label: "Add note", icon: FileText,       action: () => setNoteOpen(true),    color: "text-gray-600 dark:text-gray-300" },
                {
                  label: isFlagged ? "Unflag" : "Flag",
                  icon: isFlagged ? FlagOff : Flag,
                  action: () => isFlagged ? setUnflagOpen(true) : setFlagOpen(true),
                  color: isFlagged ? "text-green-500" : "text-orange-500",
                },
              ].map(({ label, icon: Icon, action, color }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-[12px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all"
                >
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
                </button>
              ))}
            </div>

            {/* Admin Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admin Notes
                </p>
                {notesLoading && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
              </div>
              <div className="min-h-[100px] max-h-[220px] overflow-y-auto bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3">
                {apiNotes.length === 0 && !notesLoading ? (
                  <p className="text-[12px] text-gray-400 dark:text-gray-600 text-center mt-6">
                    No notes yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {apiNotes.map((n: any, i: number) => (
                      <div key={n.id ?? i} className="bg-white/60 dark:bg-[#1C1C1C]/60 rounded-[10px] p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                            {n.admin_name ?? n.by ?? "Admin"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {n.created_at ? formatDate(n.created_at) : (n.time ?? "")}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300">
                          {n.note ?? n.content ?? n.text ?? ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right panel — Transaction Details ──────────────────────────── */}
          <div className="p-5">
            <p className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">
              Transaction Details
            </p>

            <div className="space-y-0 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] overflow-hidden mb-4">
              {[
                { label: "Transaction ID:", value: tx.reference ?? tx.id,                mono: true },
                { label: "Title:",          value: tx.type_label ?? tx.type ?? tx.title ?? "—" },
                { label: "Amount:",         value: formatVolume(tx.amount_ngn ?? 0),     highlight: true },
                { label: "Status:",         value: tx.status_label ?? tx.status ?? "—", badge: true },
                { label: "Payment Method:", value: tx.payment_method ?? "—" },
                { label: "Created:",        value: tx.created_at ? formatDate(tx.created_at) : "—" },
                { label: "Updated:",        value: tx.updated_at ? formatDate(tx.updated_at) : "—" },
                { label: "User:",           value: tx.user_full_name ?? "—" },
                { label: "User Email:",     value: tx.user_email ?? "—" },
                {
                  label: "Flagged:",
                  value: isFlagged
                    ? `Yes${flagDetails?.reason ? ` — ${flagDetails.reason}` : ""}`
                    : "No",
                },
                { label: "Approved by:",   value: tx.approval_by_admin_id ?? "—" },
                { label: "Approval time:", value: tx.approval_time ? formatDate(tx.approval_time) : "—" },
              ].map(({ label, value, mono, highlight, badge }, i) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5",
                    i % 2 === 0 ? "bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30" : ""
                  )}
                >
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">{label}</span>
                  {badge ? (
                    <Badge
                      className={cn(
                        "border rounded-full text-[11px] font-semibold px-3 py-0 h-5 bg-transparent",
                        statusColor
                      )}
                    >
                      {String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()}
                    </Badge>
                  ) : (
                    <span
                      className={cn(
                        "text-[12px] font-semibold text-gray-900 dark:text-white",
                        mono && "font-mono text-[11px]",
                        highlight && "text-orange-600 dark:text-orange-400"
                      )}
                    >
                      {String(value ?? "—")}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Extra fields */}
            {tx.details && (
              <div className="border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] p-4">
                <p className="text-[12px] font-semibold text-gray-900 dark:text-white mb-2">
                  Additional Details
                </p>
                <pre className="text-[11px] text-gray-600 dark:text-gray-400 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] p-3 overflow-x-auto">
                  {JSON.stringify(tx.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Note Dialog ── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Add Admin Note</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Visible to admins only.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setNoteOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={!newNote.trim() || noteMutation.isPending}
              onClick={() => noteMutation.mutate(newNote.trim())}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {noteMutation.isPending ? "Saving…" : "Save Note"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Flag Dialog ── */}
      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Flag for Review</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Escalate this transaction for manual review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Flag reason <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
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
                Internal note <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="Add context for the review team..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setFlagOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={!flagReason || flagMutation.isPending}
              onClick={() => flagMutation.mutate({ reason: flagReason, note: flagNote })}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {flagMutation.isPending ? "Flagging…" : <><Flag className="w-3.5 h-3.5" /> Flag Transaction</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unflag Confirm Dialog ── */}
      <Dialog open={unflagOpen} onOpenChange={setUnflagOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Remove Flag?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will remove the review flag and clear the flag reason.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setUnflagOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button
              disabled={unflagMutation.isPending}
              onClick={() => unflagMutation.mutate()}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {unflagMutation.isPending ? "Removing…" : <><FlagOff className="w-3.5 h-3.5" /> Confirm Unflag</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog ── */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Process Refund</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Refund{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {formatVolume(tx.amount_ngn ?? 0)}
              </span>{" "}
              to user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {/* Summary */}
            <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-1.5">
              {[
                { label: "Transaction ID", value: (tx.reference ?? tx.id ?? "").toString().slice(0, 8).toUpperCase() },
                { label: "User",           value: tx.user_full_name ?? "—" },
                { label: "Amount",         value: formatVolume(tx.amount_ngn ?? 0) },
                { label: "Status",         value: tx.status ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[11px] text-gray-500">{label}:</span>
                  <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Reason <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer"
                >
                  <option value="">Select reason...</option>
                  <option>User complaint</option>
                  <option>Failed transaction</option>
                  <option>Duplicate charge</option>
                  <option>Fraud prevention</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Message to user <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                value={refundMsg}
                onChange={(e) => setRefundMsg(e.target.value)}
                placeholder="Your refund has been processed and will reflect shortly..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[60px] resize-none"
              />
            </div>

            {/* Notify toggles */}
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
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setRefundOpen(false); setRefundReason(""); setRefundMsg(""); }}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!refundReason || refundMutation.isPending}
              onClick={() => refundMutation.mutate({ reason: refundReason, message: refundMsg || undefined })}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {refundMutation.isPending
                ? "Processing…"
                : <><ArrowLeftRight className="w-3.5 h-3.5" /> Confirm Refund</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionDetail;