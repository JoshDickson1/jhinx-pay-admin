import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle,
  Shield, ZoomIn, Send, Info, ChevronDown,
  Paperclip, Link2, Bold, Underline, Smile, Pause, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GCSubmission {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  user_email?: string;
  user_full_name?: string | null;
  brand?: string;
  card_brand?: string;
  card_value_usd?: number;
  amount_usd?: number;
  payout_ngn?: number;
  amount_ngn?: number;
  card_code?: string;
  applied_rate?: string;
  payment_method?: string;
  status: string;
  risk_level?: string;
  risk_score?: number;
  image_url?: string;
  card_image_url?: string;
  image_quality?: string;
  time_elapsed_seconds?: number;
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
    tier?: number;
    kyc_tier?: number;
    status?: string;
    total_cards_sold?: number;
    accepted?: number;
    rejected?: number;
    success_rate?: string;
    total_volume_usd?: number;
  };
  risk_breakdown?: { label: string; value: string; risk: string }[];
  admin_notes?: { author?: string; admin_name?: string; note: string; created_at?: string; time?: string }[];
  messages?: { id: string; sender_type: string; body: string; created_at: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getBrand     = (s: GCSubmission) => s.brand ?? s.card_brand ?? "—";
const getValueUsd  = (s: GCSubmission) => s.card_value_usd ?? s.amount_usd ?? 0;
const getPayoutNgn = (s: GCSubmission) => s.payout_ngn ?? s.amount_ngn ?? 0;
const getImageUrl  = (s: GCSubmission) => s.image_url ?? s.card_image_url ?? null;
const getUserObj   = (s: GCSubmission) => s.user;
const getRisk      = (s: GCSubmission) =>
  s.risk_level ?? (s.risk_score != null ? (s.risk_score < 40 ? "Low" : s.risk_score < 70 ? "Mid" : "High") : null);

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatElapsed = (s?: number) => {
  if (!s) return "—";
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
};

const RiskBadge = ({ risk }: { risk: string }) => {
  const cfg: Record<string, string> = {
    Low:  "bg-green-100  dark:bg-green-500/10  text-green-700  dark:text-green-400  border-green-200/60  dark:border-green-500/20",
    Mid:  "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20",
    High: "bg-red-100    dark:bg-red-500/10    text-red-700    dark:text-red-400    border-red-200/60    dark:border-red-500/20",
  };
  return (
    <Badge className={`text-[10px] font-semibold px-2 py-0 h-5 rounded-full border ${cfg[risk] ?? cfg.Low}`}>
      {risk}
    </Badge>
  );
};

const card = {
  base: "bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/30 shadow-sm",
  p:    "p-4",
  r:    "rounded-[16px]",
};

// ── Component ─────────────────────────────────────────────────────────────────

const GiftCardReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc       = useQueryClient();

  // Chat state
  const [chatReply, setChatReply] = useState("");
  const [localMsgs, setLocalMsgs] = useState<{ id: string; sender_type: string; body: string; created_at: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Admin note
  const [newNote, setNewNote] = useState("");

  // Dialogs
  const [approveOpen,     setApproveOpen]     = useState(false);
  const [rejectOpen,      setRejectOpen]       = useState(false);
  const [requestInfoOpen, setRequestInfoOpen]  = useState(false);
  const [holdOpen,        setHoldOpen]         = useState(false);
  const [imageOpen,       setImageOpen]        = useState(false);

  // Approve form
  const [approveMsg,   setApproveMsg]   = useState("");
  const [approvePush,  setApprovePush]  = useState(true);
  const [approveEmail, setApproveEmail] = useState(true);

  // Reject form
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg,    setRejectMsg]    = useState("");
  const [rejectPush,   setRejectPush]   = useState(true);
  const [rejectEmail,  setRejectEmail]  = useState(true);

  // Request Info form
  const [infoMsg,   setInfoMsg]   = useState("");
  const [infoPush,  setInfoPush]  = useState(true);
  const [infoEmail, setInfoEmail] = useState(false);

  // Hold form
  const [holdReason, setHoldReason] = useState("");
  const [holdNote,   setHoldNote]   = useState("");
  const [holdPush,   setHoldPush]   = useState(true);
  const [holdEmail,  setHoldEmail]  = useState(false);

  // ── Fetch submission ───────────────────────────────────────────────────────
  const { data: sub, isLoading, isError } = useQuery<GCSubmission>({
    queryKey: ["gc-submission", id],
    queryFn: () =>
      // Try /review first (returns richer data), fall back to /submissions/{id}
      api.get(`/admin/giftcards/submissions/${id}/review`)
        .then((r) => r.data)
        .catch(() => api.get(`/admin/giftcards/submissions/${id}`).then((r) => r.data)),
    enabled: !!id,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMsgs]);

  const isPending = sub?.status === "pending";

  // ── Approve mutation ───────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/giftcards/submissions/${id}/approve`, {
        message:      approveMsg || undefined,
        notify_push:  approvePush,
        notify_email: approveEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submission", id] });
      qc.invalidateQueries({ queryKey: ["gc-submissions"] });
      qc.invalidateQueries({ queryKey: ["gc-stats"] });
      toast.success("Gift card approved — payout initiated");
      setApproveOpen(false);
      setApproveMsg("");
    },
    onError: (err: any) => {
      if (err?.response?.status === 501) {
        toast.info("Approve endpoint is a backend placeholder — not yet active");
      } else {
        toast.error(err?.response?.data?.detail ?? "Failed to approve");
      }
      setApproveOpen(false);
    },
  });

  // ── Reject mutation ────────────────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/giftcards/submissions/${id}/reject`, {
        reason:       rejectReason,
        message:      rejectMsg || undefined,
        notify_push:  rejectPush,
        notify_email: rejectEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submission", id] });
      qc.invalidateQueries({ queryKey: ["gc-submissions"] });
      qc.invalidateQueries({ queryKey: ["gc-stats"] });
      toast.success("Gift card rejected");
      setRejectOpen(false);
      setRejectReason(""); setRejectMsg("");
    },
    onError: (err: any) => {
      if (err?.response?.status === 501) {
        toast.info("Reject endpoint is a backend placeholder — not yet active");
      } else {
        toast.error(err?.response?.data?.detail ?? "Failed to reject");
      }
      setRejectOpen(false);
    },
  });

  // ── Request Info mutation ──────────────────────────────────────────────────
  const requestInfoMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/giftcards/submissions/${id}/request-info`, {
        message:      infoMsg,
        notify_push:  infoPush,
        notify_email: infoEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submission", id] });
      toast.success("Information request sent to user");
      setRequestInfoOpen(false);
      setInfoMsg("");
    },
    onError: (err: any) => {
      if (err?.response?.status === 501) {
        toast.info("Request info endpoint is a backend placeholder — not yet active");
      } else {
        toast.error(err?.response?.data?.detail ?? "Failed to send request");
      }
      setRequestInfoOpen(false);
    },
  });

  // ── Hold mutation ──────────────────────────────────────────────────────────
  const holdMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/giftcards/submissions/${id}/hold`, {
        reason:       holdReason,
        note:         holdNote || undefined,
        notify_push:  holdPush,
        notify_email: holdEmail,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gc-submission", id] });
      qc.invalidateQueries({ queryKey: ["gc-submissions"] });
      toast.success("Submission placed on hold");
      setHoldOpen(false);
      setHoldReason(""); setHoldNote("");
    },
    onError: (err: any) => {
      if (err?.response?.status === 501) {
        toast.info("Hold endpoint is a backend placeholder — not yet active");
      } else {
        toast.error(err?.response?.data?.detail ?? "Failed to place on hold");
      }
      setHoldOpen(false);
    },
  });

  const sendChat = () => {
    if (!chatReply.trim()) return;
    setLocalMsgs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender_type: "Admin",
        body: chatReply.trim(),
        created_at: new Date().toISOString(),
      },
    ]);
    setChatReply("");
    // Note: No chat endpoint in the spec for giftcard submissions — local only
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Skeleton className="h-8 w-24 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="space-y-3"><Skeleton className="h-64 rounded-[16px]" /><Skeleton className="h-48 rounded-[16px]" /></div>
          <div className="space-y-3"><Skeleton className="h-64 rounded-[16px]" /><Skeleton className="h-48 rounded-[16px]" /></div>
          <Skeleton className="h-[640px] rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (isError || !sub) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertTriangle className="w-8 h-8 text-orange-400" />
        <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Submission not found</p>
        <button onClick={() => navigate("/transactions/gift-cards")} className="text-[13px] text-orange-500 hover:underline">
          ← Back to queue
        </button>
      </div>
    );
  }

  const imageUrl     = getImageUrl(sub);
  const userObj      = getUserObj(sub);
  const risk         = getRisk(sub);
  const riskScore    = sub.risk_score ?? null;
  const allMessages  = [...(sub.messages ?? []), ...localMsgs];
  const allNotes     = sub.admin_notes ?? [];

  const DialogUserSummary = () => (
    <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] p-3.5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {(userObj?.full_name ?? sub.user_full_name ?? sub.user_email ?? "U")[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
            {userObj?.full_name ?? sub.user_full_name ?? sub.user_email ?? "User"}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
            {userObj?.email ?? sub.user_email ?? "—"}
          </p>
        </div>
        {(userObj?.tier ?? userObj?.kyc_tier) && (
          <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 font-semibold">
            Tier {userObj?.tier ?? userObj?.kyc_tier}
          </Badge>
        )}
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Card:", value: getBrand(sub) },
          { label: "Card Code:", value: sub.card_code ?? "—" },
          { label: "Transaction ID:", value: sub.id.slice(0, 8).toUpperCase() },
          { label: "Payout:", value: `₦${getPayoutNgn(sub).toLocaleString("en-NG")}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">Gift Card Review</h1>
            <Badge className={cn(
              "text-[10px] px-2 py-0 h-5 rounded-full border font-semibold",
              sub.status === "pending"  && "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/60",
              sub.status === "approved" && "bg-green-100  dark:bg-green-500/10  text-green-700  dark:text-green-400  border-green-200/60",
              sub.status === "rejected" && "bg-red-100    dark:bg-red-500/10    text-red-700    dark:text-red-400    border-red-200/60",
              sub.status === "on_hold"  && "bg-blue-100   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400   border-blue-200/60",
            )}>
              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1).replace("_", " ")}
            </Badge>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">ID: {sub.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {formatElapsed(sub.time_elapsed_seconds)} ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-3">

          {/* User Info */}
          <div className={`${card.base} ${card.r} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">User</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[13px]">
                  {(userObj?.full_name ?? sub.user_full_name ?? sub.user_email ?? "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {userObj?.full_name ?? sub.user_full_name ?? sub.user_email ?? "User"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {userObj?.email ?? sub.user_email ?? "—"}
                </p>
              </div>
            </div>

            {/* User stats — if returned by API */}
            {userObj && (
              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                {[
                  { label: "Sold",     value: userObj.total_cards_sold ?? "—" },
                  { label: "Accepted", value: userObj.accepted ?? "—" },
                  { label: "Rejected", value: userObj.rejected ?? "—" },
                  { label: "Rate",     value: userObj.success_rate ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] py-2">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{String(value)}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate(`/users/${sub.user_id}`)}
              className="w-full h-8 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all"
            >
              View Full Profile
            </button>
          </div>

          {/* Card Details */}
          <div className={`${card.base} ${card.r} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Card Details</p>
            <div className="space-y-0 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] overflow-hidden">
              {[
                { label: "Brand",       value: getBrand(sub) },
                { label: "Card Value",  value: `$${getValueUsd(sub)}` },
                { label: "Card Code",   value: sub.card_code ?? "—",       mono: true },
                { label: "Applied Rate",value: sub.applied_rate ?? "—" },
                { label: "Payout",      value: `₦${getPayoutNgn(sub).toLocaleString("en-NG")}`, highlight: true },
                { label: "Submitted",   value: formatDate(sub.created_at) },
                { label: "Payment",     value: sub.payment_method ?? "—" },
              ].map(({ label, value, mono, highlight }, i) => (
                <div key={label} className={cn("flex items-center justify-between px-3 py-2.5", i % 2 === 0 ? "bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30" : "")}>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
                  <span className={cn("text-[12px] font-semibold text-gray-900 dark:text-white", mono && "font-mono text-[11px]", highlight && "text-orange-600 dark:text-orange-400")}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Photo */}
          {imageUrl && (
            <div className={`${card.base} ${card.r} ${card.p}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Card Photo</p>
                {sub.image_quality && (
                  <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 font-semibold">
                    {sub.image_quality}
                  </Badge>
                )}
              </div>
              <div
                className="relative bg-[#F5F5F5] dark:bg-[#2D2B2B] rounded-[12px] overflow-hidden cursor-pointer group"
                onClick={() => setImageOpen(true)}
              >
                <img src={imageUrl} alt="Card" className="w-full h-auto object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
              <button
                onClick={() => setImageOpen(true)}
                className="mt-2 w-full h-8 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5"
              >
                <ZoomIn className="w-3.5 h-3.5" /> Preview Full Image
              </button>
            </div>
          )}
        </div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="space-y-3">

          {/* Risk Assessment */}
          <div className={`${card.base} ${card.r} ${card.p}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Assessment</p>
              {risk && (
                <div className="flex items-center gap-1.5">
                  {riskScore != null && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{riskScore}/100 ·</span>
                  )}
                  <RiskBadge risk={risk} />
                </div>
              )}
            </div>

            {riskScore != null && (
              <div className="mb-4">
                <div className="flex h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div className="bg-green-500"  style={{ width: `${Math.min(riskScore, 33)}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${Math.min(Math.max(riskScore - 33, 0), 34)}%` }} />
                  <div className="bg-orange-500" style={{ width: `${Math.max(riskScore - 67, 0)}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-600">
                  <span>Low</span><span>Mid</span><span>High</span>
                </div>
              </div>
            )}

            {sub.risk_breakdown && sub.risk_breakdown.length > 0 ? (
              <div className="space-y-1.5">
                {sub.risk_breakdown.map(({ label, value, risk: r }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}: </span>
                      <span className="text-[11px] font-medium text-gray-900 dark:text-white">{value}</span>
                    </div>
                    <RiskBadge risk={r} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center py-4">
                {risk ? `Risk level: ${risk}` : "No risk data available"}
              </p>
            )}
          </div>

          {/* Admin Notes */}
          <div className={`${card.base} ${card.r} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Admin Notes</p>
            {allNotes.length > 0 && (
              <div className="space-y-2 mb-3">
                {allNotes.map((note, i) => (
                  <div key={i} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                        {note.admin_name ?? note.author ?? "Admin"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {note.created_at ? formatDate(note.created_at) : (note.time ?? "")}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-700 dark:text-gray-300">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              placeholder="Add a note (admins only)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none mb-2"
            />
            <button
              disabled={!newNote.trim()}
              onClick={() => {
                // No note endpoint in spec for giftcard submissions — local only
                toast.success("Note saved locally");
                setNewNote("");
              }}
              className="w-full h-8 rounded-full text-[11px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>

          {/* Actions */}
          <div className={`${card.base} ${card.r} ${card.p} space-y-2`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Actions</p>
            <button
              disabled={!isPending}
              onClick={() => setApproveOpen(true)}
              className="w-full h-10 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" /> Approve &amp; Payout
            </button>
            <button
              disabled={!isPending}
              onClick={() => setRejectOpen(true)}
              className="w-full h-10 rounded-full text-[12px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/60 dark:border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={!isPending}
                onClick={() => setRequestInfoOpen(true)}
                className="h-9 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Info className="w-3.5 h-3.5" /> Request Info
              </button>
              <button
                disabled={!isPending}
                onClick={() => setHoldOpen(true)}
                className="h-9 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Pause className="w-3.5 h-3.5" /> Hold for Review
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Chat ── */}
        <div className={`${card.base} ${card.r} flex flex-col h-[640px]`}>
          <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Conversation Thread
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
            {allMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[12px] text-gray-400 dark:text-gray-500">No messages yet</p>
              </div>
            ) : (
              allMessages.map((msg) => {
                const isAdmin = msg.sender_type === "Admin";
                return (
                  <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                    <div className="max-w-[80%]">
                      <div className={cn("flex items-center gap-1.5 mb-1", isAdmin ? "flex-row-reverse" : "")}>
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          {isAdmin ? "Admin" : (sub.user_full_name ?? sub.user_email ?? "User")}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <div className={cn(
                        "px-3 py-2.5 rounded-[14px] text-[12px] leading-relaxed whitespace-pre-wrap",
                        isAdmin
                          ? "bg-gradient-to-r from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-orange-500/20 dark:to-orange-500/10 text-gray-900 dark:text-white rounded-tr-none"
                          : "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 text-gray-800 dark:text-gray-200 rounded-tl-none"
                      )}>
                        {msg.body}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100/80 dark:border-gray-700/20">
            <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] border border-gray-200/60 dark:border-gray-700/30 overflow-hidden">
              <textarea
                value={chatReply}
                onChange={(e) => setChatReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="Type your reply..."
                rows={3}
                className="w-full px-3 pt-2.5 pb-1 bg-transparent text-[12px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <div className="flex items-center gap-2.5 text-gray-400 dark:text-gray-500">
                  {[Paperclip, Link2, Bold, Underline, Smile].map((Icon, i) => (
                    <button key={i} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={sendChat}
                  disabled={!chatReply.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[11px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Preview Dialog ── */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold">Card Image Preview</DialogTitle>
          </DialogHeader>
          {imageUrl && (
            <div className="bg-[#F5F5F5] dark:bg-[#2D2B2B] rounded-[14px] p-4">
              <img src={imageUrl} alt="Card Full Preview" className="w-full h-auto object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Approve Dialog ── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Approve &amp; Payout</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Credit <span className="font-semibold text-orange-600 dark:text-orange-400">₦{getPayoutNgn(sub).toLocaleString("en-NG")}</span> to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea value={approveMsg} onChange={(e) => setApproveMsg(e.target.value)}
                placeholder="Your gift card has been approved..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push</span><Switch checked={approvePush} onCheckedChange={setApprovePush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={approveEmail} onCheckedChange={setApproveEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setApproveOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate()}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5 disabled:opacity-60">
              {approveMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Approving…</> : <><CheckCircle className="w-3.5 h-3.5" /> Confirm Approval</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Reject Submission</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Select a reason and optionally notify the user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Rejection reason <span className="text-red-400">*</span></Label>
              <div className="relative">
                <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                  <option value="">Select a reason...</option>
                  <option>Invalid / Redeemed Code</option>
                  <option>Photo Doesn't Match Card</option>
                  <option>Unsupported Region</option>
                  <option>Suspected Fraud</option>
                  <option>Partially Used Card</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)}
                placeholder="We're unable to process your gift card because..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push</span><Switch checked={rejectPush} onCheckedChange={setRejectPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={rejectEmail} onCheckedChange={setRejectEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setRejectOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!rejectReason || rejectMutation.isPending} onClick={() => rejectMutation.mutate()}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {rejectMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rejecting…</> : <><XCircle className="w-3.5 h-3.5" /> Confirm Reject</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Request Info Dialog ── */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Request More Information</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Ask the user to provide additional details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-red-400">*</span></Label>
              <Textarea value={infoMsg} onChange={(e) => setInfoMsg(e.target.value)}
                placeholder="Please provide a clearer photo of the gift card showing the PIN code..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[90px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push</span><Switch checked={infoPush} onCheckedChange={setInfoPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={infoEmail} onCheckedChange={setInfoEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter>
            <button disabled={!infoMsg.trim() || requestInfoMutation.isPending} onClick={() => requestInfoMutation.mutate()}
              className="w-full py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {requestInfoMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending…</> : <><Send className="w-3.5 h-3.5" /> Send Message</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Hold Dialog ── */}
      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Hold for Review</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Pause this submission for further investigation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Reason for hold <span className="text-red-400">*</span></Label>
              <div className="relative">
                <select value={holdReason} onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                  <option value="">Select a reason...</option>
                  <option>Suspicious Activity</option>
                  <option>Verify Identity</option>
                  <option>Card Validation Required</option>
                  <option>High Risk Score</option>
                  <option>Manual Review Needed</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Internal note <span className="text-gray-400 font-normal">(admins only)</span></Label>
              <Textarea value={holdNote} onChange={(e) => setHoldNote(e.target.value)}
                placeholder="Add context for other admins reviewing this hold..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notify via</span>
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-500">Push</span><Switch checked={holdPush} onCheckedChange={setHoldPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-500">Email</span><Switch checked={holdEmail} onCheckedChange={setHoldEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setHoldOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!holdReason || holdMutation.isPending} onClick={() => holdMutation.mutate()}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {holdMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Placing on hold…</> : <><Pause className="w-3.5 h-3.5" /> Place on Hold</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.4); }
      `}</style>
    </div>
  );
};

export default GiftCardReview;