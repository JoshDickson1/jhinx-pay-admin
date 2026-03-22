import { useState } from "react";
import {
  Search, MoreHorizontal, MessageCircle, ChevronDown,
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  X, Check, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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

interface TicketItem {
  id: string;           // UUID
  ticket_id: string;    // e.g. "#18346" — used URL-encoded in API calls
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  last_reply_at: string;
  created_at: string;
  assigned_admin_id: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// "#18346" → "%2318346" — required by the backend
const encodeTicketId = (tid: string) => encodeURIComponent(tid);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatDuration = (s: number) => {
  if (s < 3600)  return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
  return `${Math.round(s / 86400)}d`;
};

const priorityClass: Record<string, string> = {
  High: "border border-red-500    text-red-600    dark:text-red-400    bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Mid:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Low:  "border border-green-500  text-green-600  dark:text-green-400  bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

const statusClass: Record<string, string> = {
  Open:     "border border-blue-400   text-blue-600   dark:text-blue-400   bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Pending:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Resolved: "border border-green-500  text-green-600  dark:text-green-400  bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Closed:   "border border-gray-400   text-gray-500   dark:text-gray-400   bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

const Sel = ({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) => (
  <div className="relative">
    <select value={value} onChange={(e) => set(e.target.value)}
      className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none transition-all"
    >
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
  </div>
);

const TicketSummary = ({ t }: { t: TicketItem }) => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{(t.user_full_name ?? t.user_email ?? "?")[0].toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{t.user_full_name ?? t.user_email}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{t.user_email}</p>
      </div>
      <Badge className={priorityClass[t.priority] ?? priorityClass.Low}>{t.priority}</Badge>
    </div>
    {[{ l: "Ticket ID", v: t.ticket_id }, { l: "Subject", v: t.subject }, { l: "Category", v: t.category }].map(({ l, v }) => (
      <div key={l} className="flex justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{l}:</span>
        <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{v}</span>
      </div>
    ))}
  </div>
);

const LIMIT = 20;

// ── Component ─────────────────────────────────────────────────────────────────

const Support = () => {
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const [search,  setSearch]  = useState("");
  const [statFil, setStatFil] = useState("Status");
  const [priofil, setPriofil] = useState("Priority");
  const [catFil,  setCatFil]  = useState("Category");
  const [page,    setPage]    = useState(1);

  const [resolveTarget, setResolveTarget] = useState<TicketItem | null>(null);
  const [resolveMsg,    setResolveMsg]    = useState("");
  const [rPush,         setRPush]         = useState(true);
  const [rEmail,        setREmail]        = useState(true);
  const [closeTarget,   setCloseTarget]   = useState<TicketItem | null>(null);
  const [closeReason,   setCloseReason]   = useState("");
  const [closeNote,     setCloseNote]     = useState("");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["ticket-stats"],
    queryFn: () => api.get("/admin/support/tickets/stats").then((r) => r.data),
  });


  // ── Ticket list ────────────────────────────────────────────────────────────
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets", page, search, statFil, priofil, catFil],
    queryFn: () =>
      api.get("/admin/support/tickets", {
        params: {
          limit: LIMIT,
          offset: (page - 1) * LIMIT,
          search:   search  || undefined,
          status:   statFil !== "Status"   ? statFil  : undefined,
          priority: priofil !== "Priority" ? priofil  : undefined,
          category: catFil  !== "Category" ? catFil   : undefined,
        },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

const tickets: TicketItem[] = ticketsData?.items ?? [];
const total: number         = ticketsData?.pagination?.total ?? 0;
const totalPages            = Math.max(1, Math.ceil(total / LIMIT));

const applyFilter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

// Derive counts from ticket list
const openCount     = tickets.filter(t => t.status === "Open").length;
const pendingCount  = tickets.filter(t => t.status === "Pending").length;
const closedCount   = tickets.filter(t => t.status === "Closed").length;
const resolvedCount = tickets.filter(t => t.status === "Resolved").length;

const metricCards = [
  { label: "Total Tickets",      value: ticketsLoading ? "—" : total,                        delta: null,                                      Icon: MessageCircle },
  { label: "Open / Pending",     value: ticketsLoading ? "—" : openCount + pendingCount,     delta: statsData?.open_tickets?.delta_pct ?? null, Icon: AlertTriangle },
  { label: "Closed / Resolved",  value: ticketsLoading ? "—" : closedCount + resolvedCount,  delta: statsData?.resolved_today?.delta_pct ?? null, Icon: CheckCircle },
  { label: "Avg Resolution",     value: statsData?.avg_resolution_time_seconds ? formatDuration(statsData.avg_resolution_time_seconds) : "—", delta: null, Icon: Clock },
];
  // ── Mutations ──────────────────────────────────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: (ticket_id: string) =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket_id)}/resolve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket-stats"] });
      toast.success("Ticket marked as resolved");
      setResolveTarget(null); setResolveMsg("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to resolve ticket");
    },
  });

  const closeMutation = useMutation({
    mutationFn: (ticket_id: string) =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket_id)}/close`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket-stats"] });
      toast.success("Ticket closed");
      setCloseTarget(null); setCloseReason(""); setCloseNote("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to close ticket");
    },
  });

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Manage and respond to customer support requests.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map(({ label, value, delta, Icon }) => (
          <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div>
              {statsLoading || ticketsLoading
  ? <Skeleton className="h-7 w-12" />
  : <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
}
              {delta !== null && delta !== undefined && (
                <p className={cn("text-[11px] mt-1 flex items-center gap-1", delta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                  {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {delta >= 0 ? "+" : ""}{delta}% vs last week
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID or user..."
              className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Sel value={statFil} set={applyFilter(setStatFil)} opts={["Status", "Open", "Pending", "Resolved", "Closed"]} />
            <Sel value={priofil} set={applyFilter(setPriofil)} opts={["Priority", "High", "Mid", "Low"]} />
            <Sel value={catFil}  set={applyFilter(setCatFil)}  opts={["Category", "Giftcards", "Crypto", "Gaming", "Account", "Payment", "General"]} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Ticket ID", "User", "Subject", "Priority", "Status", "Last Reply", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {ticketsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>)}</tr>
                ))
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">No tickets found</td></tr>
              ) : (
                tickets.map((ticket) => {
                  const isClosed = ticket.status === "Resolved" || ticket.status === "Closed";
                  return (
                    <tr key={ticket.id}
                      onClick={() => navigate(`/support-tickets/${ticket.id}`)}
                      className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-bold text-gray-900 dark:text-white">{ticket.ticket_id}</p>
                        <p className="text-[10px] text-gray-500">{formatDate(ticket.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{(ticket.user_full_name ?? ticket.user_email ?? "?")[0].toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{ticket.user_full_name ?? ticket.user_email}</p>
                            <p className="text-[10px] text-gray-500 truncate">{ticket.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-[12px] text-gray-800 dark:text-gray-200">{ticket.subject}</span></td>
                      <td className="px-4 py-3">
                        <Badge className={priorityClass[ticket.priority] ?? priorityClass.Low}>{ticket.priority}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusClass[ticket.status] ?? statusClass.Open}>{ticket.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(ticket.last_reply_at ?? ticket.created_at)}
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
                            <DropdownMenuItem onClick={() => navigate(`/support-tickets/${ticket.id}`)}
                              className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                              <MessageCircle className="w-3.5 h-3.5 text-gray-500" /> View &amp; Reply
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                            <DropdownMenuItem disabled={isClosed}
                              onClick={() => { setResolveTarget(ticket); setResolveMsg(""); }}
                              className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 text-green-600 dark:text-green-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed">
                              <Check className="w-3.5 h-3.5" /> Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={ticket.status === "Closed"}
                              onClick={() => { setCloseTarget(ticket); setCloseReason(""); setCloseNote(""); }}
                              className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 text-red-600 dark:text-red-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed">
                              <X className="w-3.5 h-3.5" /> Close Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            Showing <span className="font-semibold text-gray-900 dark:text-white">{total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{total}</span> tickets
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled={page <= 1 || ticketsLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-[11px] text-gray-500 px-2">{page} / {totalPages}</span>
            <button disabled={page >= totalPages || ticketsLoading} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Resolve Dialog ── */}
      <Dialog open={!!resolveTarget} onOpenChange={() => setResolveTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Mark as Resolved</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Close this ticket as resolved and optionally notify the user.</DialogDescription>
          </DialogHeader>
          {resolveTarget && (
            <div className="space-y-3 py-1">
              <TicketSummary t={resolveTarget} />
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Resolution message <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={resolveMsg} onChange={(e) => setResolveMsg(e.target.value)}
                  placeholder="Your issue has been resolved..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span>
                  <Switch checked={rPush} onCheckedChange={setRPush} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span>
                  <Switch checked={rEmail} onCheckedChange={setREmail} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setResolveTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={resolveMutation.isPending} onClick={() => resolveTarget && resolveMutation.mutate(resolveTarget.ticket_id)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60">
              {resolveMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resolving…</> : <><CheckCircle className="w-3.5 h-3.5" /> Mark Resolved</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Close Dialog ── */}
      <Dialog open={!!closeTarget} onOpenChange={() => setCloseTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Close Ticket</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">This ticket will be permanently closed.</DialogDescription>
          </DialogHeader>
          {closeTarget && (
            <div className="space-y-3 py-1">
              <TicketSummary t={closeTarget} />
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Reason for closing</Label>
                <div className="relative">
                  <select value={closeReason} onChange={(e) => setCloseReason(e.target.value)}
                    className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                    <option value="">Select reason...</option>
                    <option>Issue resolved</option>
                    <option>Duplicate ticket</option>
                    <option>No response from user</option>
                    <option>Spam / invalid</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Internal note <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder="Add context for the team..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setCloseTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!closeReason || closeMutation.isPending} onClick={() => closeTarget && closeMutation.mutate(closeTarget.ticket_id)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {closeMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Closing…</> : <><X className="w-3.5 h-3.5" /> Close Ticket</>}
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

export default Support;