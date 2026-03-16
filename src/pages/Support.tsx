import { useState } from "react";
import {
  Search, MoreHorizontal, MessageCircle, ChevronDown,
  TrendingUp, TrendingDown, Ticket, Clock, CheckCircle, AlertTriangle,
  X, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface TicketItem {
  id: string;
  user: { name: string; email: string; avatar: string };
  subject: string;
  priority: "High" | "Mid" | "Low";
  status: "Open" | "Pending" | "Resolved" | "Closed";
  lastReply: string;
  date: string;
  category: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const seedTickets: TicketItem[] = [
  { id: "#23122", user: { name: "John Frank",      email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=12" }, subject: "Withdrawal delay",        priority: "High", status: "Open",     lastReply: "50 min", date: "Jan 13, 2:30 PM", category: "Payment"   },
  { id: "#23123", user: { name: "Obed Vine",       email: "beddv@gmail.com",     avatar: "https://i.pravatar.cc/150?img=33" }, subject: "Gift card issue",         priority: "Mid",  status: "Pending",  lastReply: "41 min", date: "Jan 12, 1:30 PM", category: "Gift Card" },
  { id: "#23124", user: { name: "Wizz John",       email: "wizzy@gmail.com",     avatar: "https://i.pravatar.cc/150?img=15" }, subject: "Login problem",           priority: "Low",  status: "Open",     lastReply: "32 min", date: "Jan 12, 12:30 PM",category: "Account"   },
  { id: "#23125", user: { name: "Precious Chisom", email: "pcc@gmail.com",       avatar: "https://i.pravatar.cc/150?img=45" }, subject: "Wrong player ID charged", priority: "Low",  status: "Resolved", lastReply: "22 min", date: "Jan 12, 10:30 AM",category: "Crypto"    },
  { id: "#23126", user: { name: "Benedita Josh",   email: "bennyj@gmail.com",    avatar: "https://i.pravatar.cc/150?img=47" }, subject: "Unable to login",         priority: "High", status: "Pending",  lastReply: "10 min", date: "Jan 12, 6:30 AM", category: "Account"   },
  { id: "#23128", user: { name: "Charity Frank",   email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=26" }, subject: "Card not approved",       priority: "High", status: "Resolved", lastReply: "5 min",  date: "Jan 12, 2:30 AM", category: "Gift Card" },
];

const metrics = [
  { label: "Open Tickets",        value: "8",      change: "23% vs yesterday", up: false, Icon: Ticket        },
  { label: "Pending Response",    value: "5",      change: "23% vs yesterday", up: true,  Icon: AlertTriangle },
  { label: "Resolved Today",      value: "24",     change: "23% vs yesterday", up: true,  Icon: CheckCircle   },
  { label: "Avg Resolution Time", value: "2h 14m", change: "9% this week",     up: false, Icon: Clock         },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────

const priorityClass: Record<TicketItem["priority"], string> = {
  High: "border border-red-500   text-red-600   dark:text-red-400   bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Mid:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Low:  "border border-green-500 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

const statusClass: Record<TicketItem["status"], string> = {
  Open:     "border border-blue-400   text-blue-600   dark:text-blue-400   bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Pending:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Resolved: "border border-green-500 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Closed:   "border border-gray-400  text-gray-500  dark:text-gray-400  bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

// ── Filter select helper ──────────────────────────────────────────────────────

const Sel = ({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => set(e.target.value)}
      className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 transition-all"
    >
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
  </div>
);

// ── Ticket summary shown inside dialogs ───────────────────────────────────────

const TicketSummary = ({ t }: { t: TicketItem }) => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
        <img src={t.user.avatar} alt={t.user.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{t.user.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{t.user.email}</p>
      </div>
      <Badge className={priorityClass[t.priority]}>{t.priority}</Badge>
    </div>
    {[{ l: "Ticket ID", v: t.id }, { l: "Subject", v: t.subject }, { l: "Category", v: t.category }].map(({ l, v }) => (
      <div key={l} className="flex justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{l}:</span>
        <span className="text-[11px] font-semibold text-gray-900 dark:text-white">{v}</span>
      </div>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const Support = () => {
  const navigate = useNavigate();

  // Live ticket list (status changes persist within session)
  const [tickets, setTickets] = useState<TicketItem[]>(seedTickets);

  // Filters
  const [search,   setSearch]   = useState("");
  const [statFil,  setStatFil]  = useState("Status");
  const [priofil,  setPriofil]  = useState("Priority");
  const [catFil,   setCatFil]   = useState("Category");

  // Resolve dialog
  const [resolveTarget, setResolveTarget] = useState<TicketItem | null>(null);
  const [resolveMsg,    setResolveMsg]    = useState("");
  const [rPush,         setRPush]         = useState(true);
  const [rEmail,        setREmail]        = useState(true);

  // Close dialog
  const [closeTarget,  setCloseTarget]  = useState<TicketItem | null>(null);
  const [closeReason,  setCloseReason]  = useState("");
  const [closeNote,    setCloseNote]    = useState("");

  // ── Filtered rows ──
  const rows = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = t.subject.toLowerCase().includes(q) || t.user.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchS = statFil  === "Status"   || t.status   === statFil;
    const matchP = priofil  === "Priority" || t.priority === priofil;
    const matchC = catFil   === "Category" || t.category === catFil;
    return matchQ && matchS && matchP && matchC;
  });

  // ── Handlers ──
  const doResolve = () => {
    if (!resolveTarget) return;
    setTickets((prev) => prev.map((t) => t.id === resolveTarget.id ? { ...t, status: "Resolved" } : t));
    setResolveTarget(null);
    setResolveMsg("");
  };

  const doClose = () => {
    if (!closeTarget) return;
    setTickets((prev) => prev.map((t) => t.id === closeTarget.id ? { ...t, status: "Closed" } : t));
    setCloseTarget(null);
    setCloseReason("");
    setCloseNote("");
  };

  // ── Render ──
  return (
    <div className="space-y-3 animate-fade-in">

      {/* Page header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
          Manage and respond to customer support requests.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(({ label, value, change, up, Icon }) => (
          <div
            key={label}
            className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3"
          >
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
                {change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or user...."
              className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Sel value={statFil} set={setStatFil} opts={["Status", "Open", "Pending", "Resolved", "Closed"]} />
            <Sel value={priofil} set={setPriofil} opts={["Priority", "High", "Mid", "Low"]} />
            <Sel value={catFil}  set={setCatFil}  opts={["Category", "Payment", "Account", "Gift Card", "Crypto"]} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Ticket ID", "User", "Subject", "Priority", "Status", "Last Reply", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">
                    No tickets found
                  </td>
                </tr>
              )}
              {rows.map((ticket, idx) => (
                <tr
                  key={`${ticket.id}-${idx}`}
                  onClick={() => navigate(`/support-tickets/${ticket.id.replace("#", "")}`)}
                  className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 cursor-pointer transition-colors"
                >
                  {/* Ticket ID */}
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white">{ticket.id}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500">{ticket.date}</p>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0">
                        <img
                          src={ticket.user.avatar}
                          alt={ticket.user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const p = e.currentTarget.parentElement;
                            if (p) p.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white text-xs font-bold">${ticket.user.name.charAt(0)}</span></div>`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{ticket.user.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{ticket.user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-gray-800 dark:text-gray-200">{ticket.subject}</span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <Badge className={priorityClass[ticket.priority]}>{ticket.priority}</Badge>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge className={statusClass[ticket.status]}>{ticket.status}</Badge>
                  </td>

                  {/* Last Reply */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400">{ticket.lastReply}</span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl"
                      >
                        <DropdownMenuLabel className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1">
                          Actions
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => navigate(`/support-tickets/${ticket.id.replace("#", "")}`)}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                          View &amp; Reply
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

                        <DropdownMenuItem
                          disabled={ticket.status === "Resolved" || ticket.status === "Closed"}
                          onClick={() => { setResolveTarget(ticket); setResolveMsg(""); }}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 text-green-600 dark:text-green-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark as Resolved
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={ticket.status === "Closed"}
                          onClick={() => { setCloseTarget(ticket); setCloseReason(""); setCloseNote(""); }}
                          className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 text-red-600 dark:text-red-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                          Close Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">1–{rows.length}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">5,648</span>{" "}
            submission
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-400 opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Mark as Resolved dialog ── */}
      <Dialog open={!!resolveTarget} onOpenChange={() => setResolveTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              Mark as Resolved
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Close this ticket as resolved and optionally notify the user.
            </DialogDescription>
          </DialogHeader>

          {resolveTarget && (
            <div className="space-y-3 py-1">
              <TicketSummary t={resolveTarget} />

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Resolution message{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={resolveMsg}
                  onChange={(e) => setResolveMsg(e.target.value)}
                  placeholder="Your issue has been resolved. Please reach out if you need further assistance..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none"
                />
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
            <button
              onClick={() => setResolveTarget(null)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={doResolve}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Resolved
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Close Ticket dialog ── */}
      <Dialog open={!!closeTarget} onOpenChange={() => setCloseTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              Close Ticket
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This ticket will be permanently closed.
            </DialogDescription>
          </DialogHeader>

          {closeTarget && (
            <div className="space-y-3 py-1">
              <TicketSummary t={closeTarget} />

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Reason for closing
                </Label>
                <div className="relative">
                  <select
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer"
                  >
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
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Internal note{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  placeholder="Add context for the team..."
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              onClick={() => setCloseTarget(null)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!closeReason}
              onClick={doClose}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Close Ticket
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