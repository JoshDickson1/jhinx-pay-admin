import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Paperclip, Link2, Bold, Underline, Smile,
  Send, CheckCircle, X, User, ExternalLink, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";

// ── Types — exact API shape ───────────────────────────────────────────────────

interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  file_url: string;       // relative path — prepend base URL to display
  created_at: string;
}

interface SupportMessage {
  id: string;
  sender_type: string;  // "User" | "Admin"
  body: string;         // message content field is "body"
  created_at: string;
  attachments: Attachment[];
}

interface TicketDetail {
  id: string;
  ticket_id: string;    // "#18346"
  subject: string;
  category: string;
  priority: string;
  status: string;
  last_reply_at: string;
  created_at: string;
}

interface ThreadResponse {
  ticket: TicketDetail;
  messages: SupportMessage[];
  pagination: {
    total: number;
    has_next: boolean;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// "#18346" → "%2318346"
const encodeTicketId = (tid: string) => encodeURIComponent(tid);

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ?? "";

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-NG", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });

const statusClass: Record<string, string> = {
  Open:     "border border-blue-400   text-blue-600   dark:text-blue-400   bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
  Pending:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
  Resolved: "border border-green-500  text-green-600  dark:text-green-400  bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
  Closed:   "border border-gray-400   text-gray-500   dark:text-gray-400   bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
};

const priorityClass: Record<string, string> = {
  High: "border border-red-500    text-red-600    dark:text-red-400    bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
  Mid:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
  Low:  "border border-green-500  text-green-600  dark:text-green-400  bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5",
};

// ── Component ─────────────────────────────────────────────────────────────────

const SupportTicketDetail = () => {
  const { id } = useParams<{ id: string }>();   // UUID from the list
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const { admin }  = useAuthStore();

  const [reply,       setReply]       = useState("");
  const [assignOpen,  setAssignOpen]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch thread — first we need the ticket_id from the list cache or fetch ─
  // The detail endpoint uses ticket_id (encoded #18346), not the UUID.
  // Strategy: get ticket from list cache first, fall back to fetching list.
  const cachedTickets: any[] = qc.getQueryData<any>(["support-tickets", 1, "", "Status", "Priority", "Category"])?.items ?? [];
  const cachedTicket = cachedTickets.find((t: any) => t.id === id);

  // We also need user info — the thread doesn't return it, but the list does
  const ticketMeta = cachedTicket;

  const { data: threadData, isLoading, isError, refetch } = useQuery<ThreadResponse>({
    queryKey: ["ticket-thread", id],
    queryFn: async () => {
      // Find the ticket_id — either from cache or by searching
      let ticket_id = cachedTicket?.ticket_id;

      if (!ticket_id) {
        // Fetch the list to find the ticket
        const listRes = await api.get("/admin/support/tickets", {
          params: { limit: 100, offset: 0 }
        }).then((r) => r.data);
        const found = (listRes.items ?? []).find((t: any) => t.id === id);
        if (!found) throw new Error("Ticket not found");
        ticket_id = found.ticket_id;
      }

      return api.get(`/admin/support/tickets/${encodeTicketId(ticket_id)}`).then((r) => r.data);
    },
    enabled: !!id,
    refetchInterval: 30_000,
  });

  const ticket   = threadData?.ticket;
  const messages = threadData?.messages ?? [];

  const isClosed = ["Resolved", "Closed"].includes(ticket?.status ?? "");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Reply mutation ─────────────────────────────────────────────────────────
  const replyMutation = useMutation({
    mutationFn: (message: string) =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket!.ticket_id)}/reply`, { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-thread", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      setReply("");
      toast.success("Reply sent");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to send reply");
    },
  });

  // ── Assign mutation ────────────────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket!.ticket_id)}/assign`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-thread", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket assigned to you");
      setAssignOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to assign ticket");
    },
  });

  // ── Resolve mutation ───────────────────────────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket!.ticket_id)}/resolve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-thread", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket-stats"] });
      toast.success("Ticket resolved");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to resolve ticket");
    },
  });

  // ── Close mutation ─────────────────────────────────────────────────────────
  const closeMutation = useMutation({
    mutationFn: () =>
      api.post(`/admin/support/tickets/${encodeTicketId(ticket!.ticket_id)}/close`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-thread", id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket-stats"] });
      toast.success("Ticket closed");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to close ticket");
    },
  });

  const handleSend = () => {
    const trimmed = reply.trim();
    if (!trimmed || !ticket) return;
    replyMutation.mutate(trimmed);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Skeleton className="h-8 w-24 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-[600px] rounded-l-[16px]" />
          <Skeleton className="h-[600px] rounded-r-[16px]" />
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Ticket not found</p>
        <button onClick={() => navigate("/support-tickets")} className="text-[13px] text-orange-500 hover:underline">
          ← Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate("/support-tickets")}
        className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">

          {/* ── Left panel ── */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-100/80 dark:border-gray-700/20 space-y-5">

            {/* Ticket info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400 font-mono">{ticket.ticket_id}</span>
                <Badge className={statusClass[ticket.status] ?? statusClass.Open}>{ticket.status}</Badge>
                <Badge className={priorityClass[ticket.priority] ?? priorityClass.Low}>{ticket.priority}</Badge>
              </div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">{ticket.subject}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{ticket.category} · {formatDate(ticket.created_at)}</p>
            </div>

            {/* User info — from list cache */}
            {ticketMeta && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[13px] font-bold">
                    {(ticketMeta.user_full_name ?? ticketMeta.user_email ?? "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                    {ticketMeta.user_full_name ?? ticketMeta.user_email}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{ticketMeta.user_email}</p>
                </div>
              </div>
            )}

            {ticketMeta?.user_id && (
              <Link
                to={`/users/${ticketMeta.user_id}`}
                className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 transition-all"
              >
                View user profile <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            <div className="border-t border-gray-100/80 dark:border-gray-700/20" />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isClosed || resolveMutation.isPending}
                onClick={() => resolveMutation.mutate()}
                className="flex items-center justify-center gap-1.5 h-9 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-[11px] font-semibold hover:bg-green-200/60 dark:hover:bg-green-500/25 transition-all border border-green-200/60 dark:border-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resolveMutation.isPending
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5" />
                }
                {resolveMutation.isPending ? "Resolving…" : "Mark Resolved"}
              </button>
              <button
                disabled={ticket.status === "Closed" || closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
                className="flex items-center justify-center gap-1.5 h-9 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-100/60 dark:hover:bg-red-500/20 transition-all border border-red-200/60 dark:border-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {closeMutation.isPending
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <X className="w-3.5 h-3.5" />
                }
                {closeMutation.isPending ? "Closing…" : "Close Ticket"}
              </button>
            </div>

            {/* Assign to me */}
            <button
              disabled={assignMutation.isPending || isClosed}
              onClick={() => assignMutation.mutate()}
              className="w-full flex items-center justify-center gap-2 px-3 h-9 rounded-[10px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/60 dark:border-gray-700/40 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {assignMutation.isPending
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <User className="w-3.5 h-3.5 text-gray-400" />
              }
              {assignMutation.isPending ? "Assigning…" : "Assign to me"}
            </button>

            {/* Ticket stats */}
            <div className="space-y-2">
              {[
                { label: "Category",    value: ticket.category },
                { label: "Last reply",  value: formatDate(ticket.last_reply_at) },
                { label: "Messages",    value: String(messages.length) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}:</span>
                  <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel — conversation ── */}
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Conversation Thread
              </p>
              <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[12px] text-gray-400 dark:text-gray-500">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_type === "Admin";
                  return (
                    <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%]", isAdmin ? "items-end" : "items-start")}>
                        <div className={cn("flex items-center gap-2 mb-1", isAdmin ? "justify-end" : "justify-start")}>
                          {!isAdmin && <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{ticketMeta?.user_full_name ?? ticketMeta?.user_email ?? "User"}</span>}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(msg.created_at)}</span>
                          {isAdmin && <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Admin</span>}
                        </div>
                        <div className={cn(
                          "px-3.5 py-2.5 rounded-[14px] text-[12px] leading-relaxed whitespace-pre-wrap",
                          isAdmin
                            ? "bg-gradient-to-r from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-orange-500/20 dark:to-orange-500/10 text-gray-900 dark:text-white rounded-tr-none"
                            : "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 text-gray-800 dark:text-gray-200 rounded-tl-none"
                        )}>
                          {msg.body}
                        </div>
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.attachments.map((att) => {
                              const isImage = att.content_type?.startsWith("image/");
                              const url = att.file_url.startsWith("http") ? att.file_url : `${BASE_URL}${att.file_url}`;
                              return isImage ? (
                                <a key={att.id} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={att.filename} className="max-h-32 rounded-[10px] border border-gray-200/50 dark:border-gray-700/30 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                </a>
                              ) : (
                                <a key={att.id} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[11px] text-orange-600 dark:text-orange-400 hover:underline">
                                  <ExternalLink className="w-3 h-3" /> {att.filename}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {!isClosed ? (
              <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20">
                <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] border border-gray-200/60 dark:border-gray-700/30 overflow-hidden">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                    rows={3}
                    className="w-full px-4 pt-3 pb-2 bg-transparent text-[12px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none"
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                      {[Paperclip, Link2, Bold, Underline, Smile].map((Icon, i) => (
                        <button key={i} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!reply.trim() || replyMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {replyMutation.isPending
                        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                        : <><Send className="w-3.5 h-3.5" /> Send</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 border-t border-gray-100/80 dark:border-gray-700/20 text-center text-[12px] text-gray-400 dark:text-gray-500">
                This ticket is {ticket.status.toLowerCase()} — replies disabled
              </div>
            )}
          </div>
        </div>
      </div>

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

export default SupportTicketDetail;