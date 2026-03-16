import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, User, CreditCard,
  Shield, Camera, MessageSquare, Pause, ZoomIn, Send, Info, ChevronDown,
  Paperclip, Link2, Bold, Underline, Smile,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const submission = {
  id: "GC-001",
  brand: "Amazon",
  cardValue: "$100",
  cardCode: "AMA-BXTY-JJDV-2KNN",
  appliedRate: "₦1,500/$1",
  payoutAmount: "₦150,000",
  submissionTime: "Jan 13, 2026 • 3:42 PM",
  timeElapsed: "14 minutes",
  paymentMethod: "Naira Wallet",
  status: "Pending",
  imageQuality: "Good Quality",
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
  transactionId: "JPX-TRX-829503",
  user: {
    id: "USR-001",
    name: "Obed Vine",
    username: "@obed_vine",
    email: "beddv@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    kycTier: 3,
    status: "Active",
    totalCardsSold: 5,
    accepted: 5,
    rejected: 0,
    successRate: "100%",
    totalVolume: "$450",
  },
  riskScore: 72,
  riskBreakdown: [
    { label: "Account age", value: "6 months", risk: "Low" },
    { label: "Past successful trades", value: "5 trades", risk: "Low" },
    { label: "Card amount", value: "$100", risk: "Mid" },
    { label: "Photo provided", value: "Yes", risk: "Low" },
    { label: "New device", value: "Yes", risk: "Mid" },
    { label: "IP location", value: "Lagos, Nigeria", risk: "Low" },
  ],
  adminNotes: [
    { author: "Admin Mike", note: "User has clean history, trusted seller.", time: "2 days ago" },
  ],
};

interface ChatMsg { id: string; sender: "user" | "admin"; name: string; text: string; time: string; }
const initialChat: ChatMsg[] = [
  { id: "1", sender: "user", name: "Obed Vine", text: "Hi, I submitted an Amazon $100 card 14 mins ago — it's still pending.", time: "3:42 PM" },
  { id: "2", sender: "admin", name: "Admin Vine", text: "Hi Obed, I'm reviewing your submission now. Can you confirm the card code?", time: "3:44 PM" },
  { id: "3", sender: "user", name: "Obed Vine", text: "Yes — AMA-BXTY-JJDV-2KNN. It's definitely correct.", time: "3:45 PM" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const RiskBadge = ({ risk }: { risk: string }) => {
  const cfg: Record<string, string> = {
    Low: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/60 dark:border-green-500/20",
    Mid: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20",
    High: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/20",
  };
  return <Badge className={`text-[10px] font-semibold px-2 py-0 h-5 rounded-full border ${cfg[risk] ?? cfg.Low}`}>{risk}</Badge>;
};

// User summary shown inside dialogs
const DialogUserSummary = () => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] p-3.5 space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
        <img src={submission.user.avatar} alt={submission.user.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{submission.user.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{submission.user.email}</p>
      </div>
      <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 font-semibold">Tier {submission.user.kycTier}</Badge>
      <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-500/20 font-semibold">{submission.user.status}</Badge>
    </div>
    <div className="space-y-1.5">
      {[
        { label: "Card:", value: submission.brand },
        { label: "Card Code:", value: submission.cardCode },
        { label: "Transaction ID:", value: submission.transactionId },
        { label: "Payout Amount:", value: submission.payoutAmount },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
          <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const GiftCardReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Chat
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(initialChat);
  const [chatReply, setChatReply] = useState("");

  // Admin note
  const [newNote, setNewNote] = useState("");

  // Dialog states
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  // Approve
  const [approveMsg, setApproveMsg] = useState("");
  const [approvePush, setApprovePush] = useState(true);
  const [approveEmail, setApproveEmail] = useState(true);

  // Reject
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");
  const [rejectPush, setRejectPush] = useState(true);
  const [rejectEmail, setRejectEmail] = useState(true);

  // Request Info
  const [infoMsg, setInfoMsg] = useState("");
  const [infoPush, setInfoPush] = useState(true);
  const [infoEmail, setInfoEmail] = useState(false);

  // Hold
  const [holdReason, setHoldReason] = useState("");
  const [holdNote, setHoldNote] = useState("");
  const [holdPush, setHoldPush] = useState(true);
  const [holdEmail, setHoldEmail] = useState(false);

  const sendChat = () => {
    if (!chatReply.trim()) return;
    setChatMsgs(prev => [...prev, {
      id: String(Date.now()), sender: "admin", name: "Admin Vine",
      text: chatReply.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }]);
    setChatReply("");
  };

  const card = { p: "p-4", rounded: "rounded-[16px]", base: "bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/30 shadow-sm" };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">Gift Card Review</h1>
            <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 font-semibold">Pending</Badge>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">ID: {submission.transactionId}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {submission.timeElapsed} ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-3">

          {/* User Info */}
          <div className={`${card.base} ${card.rounded} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">User</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
                <img src={submission.user.avatar} alt={submission.user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">{submission.user.name}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{submission.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-3">
              <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 font-semibold">Tier {submission.user.kycTier}</Badge>
              <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 font-semibold">{submission.user.status}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Sold", value: submission.user.totalCardsSold },
                { label: "Accepted", value: submission.user.accepted },
                { label: "Rejected", value: submission.user.rejected },
                { label: "Rate", value: submission.user.successRate },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] py-2">
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(`/users/${submission.user.id}`)} className="mt-3 w-full h-8 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all">
              View Full Profile
            </button>
          </div>

          {/* Card Details */}
          <div className={`${card.base} ${card.rounded} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Card Details</p>
            <div className="space-y-2">
              {[
                { label: "Brand", value: submission.brand },
                { label: "Card Value", value: submission.cardValue },
                { label: "Card Code", value: submission.cardCode },
                { label: "Applied Rate", value: submission.appliedRate },
                { label: "Payout", value: submission.payoutAmount },
                { label: "Submitted", value: submission.submissionTime },
                { label: "Payment", value: submission.paymentMethod },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100/80 dark:border-gray-700/20 last:border-0">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
                  <span className={`text-[12px] font-semibold text-gray-900 dark:text-white ${label === "Card Code" ? "font-mono text-[11px]" : ""} ${label === "Payout" ? "text-orange-600 dark:text-orange-400" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Photo */}
          <div className={`${card.base} ${card.rounded} ${card.p}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Card Photo</p>
              <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 font-semibold">{submission.imageQuality}</Badge>
            </div>
            <div className="relative bg-orange-500 rounded-[12px] p-5 cursor-pointer group" onClick={() => setImageOpen(true)}>
              <img src={submission.imageUrl} alt="Card" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[12px] flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
            <button onClick={() => setImageOpen(true)} className="mt-2 w-full h-8 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5" /> Preview Full Image
            </button>
          </div>
        </div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="space-y-3">

          {/* Risk Assessment */}
          <div className={`${card.base} ${card.rounded} ${card.p}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Assessment</p>
              <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 font-semibold">{submission.riskScore}/100 · Mid</Badge>
            </div>
            {/* Gradient bar */}
            <div className="mb-4">
              <div className="flex h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div className="bg-green-500" style={{ width: `${Math.min(submission.riskScore, 33)}%` }} />
                <div className="bg-yellow-500" style={{ width: `${Math.min(Math.max(submission.riskScore - 33, 0), 34)}%` }} />
                <div className="bg-orange-500" style={{ width: `${Math.max(submission.riskScore - 67, 0)}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-600">
                <span>Low</span><span>Mid</span><span>High</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {submission.riskBreakdown.map(({ label, value, risk }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}: </span>
                    <span className="text-[11px] font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                  <RiskBadge risk={risk} />
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className={`${card.base} ${card.rounded} ${card.p}`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Admin Notes</p>
            <div className="space-y-2 mb-3">
              {submission.adminNotes.map((note, i) => (
                <div key={i} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">{note.author}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{note.time}</span>
                  </div>
                  <p className="text-[12px] text-gray-700 dark:text-gray-300">{note.note}</p>
                </div>
              ))}
            </div>
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none mb-2"
            />
            <button className="w-full h-8 rounded-full text-[11px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
              Save Note
            </button>
          </div>

          {/* Actions */}
          <div className={`${card.base} ${card.rounded} ${card.p} space-y-2`}>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Actions</p>

            <button onClick={() => setApproveOpen(true)} className="w-full h-10 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve & Payout
            </button>
            <button onClick={() => setRejectOpen(true)} className="w-full h-10 rounded-full text-[12px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/60 dark:border-red-500/20 transition-all flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setRequestInfoOpen(true)} className="h-9 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Request Info
              </button>
              <button onClick={() => setHoldOpen(true)} className="h-9 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all flex items-center justify-center gap-1.5">
                <Pause className="w-3.5 h-3.5" /> Hold for Review
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Chat ── */}
        <div className={`${card.base} ${card.rounded} flex flex-col h-[640px]`}>
          <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Conversation Thread</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
            {chatMsgs.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "admin" ? "justify-end" : "justify-start")}>
                <div className="max-w-[80%]">
                  <div className={cn("flex items-center gap-1.5 mb-1", msg.sender === "admin" ? "flex-row-reverse" : "")}>
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{msg.name}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{msg.time}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-2.5 rounded-[14px] text-[12px] leading-relaxed whitespace-pre-wrap",
                    msg.sender === "user"
                      ? "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 text-gray-800 dark:text-gray-200 rounded-tl-none"
                      : "bg-gradient-to-r from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-orange-500/20 dark:to-orange-500/10 text-gray-900 dark:text-white rounded-tr-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100/80 dark:border-gray-700/20">
            <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] border border-gray-200/60 dark:border-gray-700/30 overflow-hidden">
              <textarea
                value={chatReply}
                onChange={(e) => setChatReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="Type your reply.."
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
                <button onClick={sendChat} disabled={!chatReply.trim()} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[11px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIALOGS ── */}

      {/* Image Preview */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-bold">Card Image Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-orange-500 rounded-[14px] p-8">
            <img src={submission.imageUrl} alt="Card Full Preview" className="w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Approve & Payout</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will approve the card and credit <span className="font-semibold text-orange-600 dark:text-orange-400">{submission.payoutAmount}</span> to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea value={approveMsg} onChange={(e) => setApproveMsg(e.target.value)} placeholder="Your Amazon $100 gift card has been approved. ₦150,000 has been credited..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push</span><Switch checked={approvePush} onCheckedChange={setApprovePush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={approveEmail} onCheckedChange={setApproveEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setApproveOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setApproveOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Confirm Approval
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Reject Submission</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Select a reason and optionally notify the user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Rejection reason</Label>
              <div className="relative">
                <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer">
                  <option value="">Select a reason...</option>
                  <option value="invalid">Invalid / Redeemed Code</option>
                  <option value="photo">Photo Doesn't Match Card</option>
                  <option value="region">Unsupported Region</option>
                  <option value="fraud">Suspected Fraud</option>
                  <option value="partial">Partially Used Card</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)} placeholder="We're unable to process your Amazon $100 gift card because..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[80px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push</span><Switch checked={rejectPush} onCheckedChange={setRejectPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={rejectEmail} onCheckedChange={setRejectEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setRejectOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!rejectReason} onClick={() => setRejectOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <XCircle className="w-3.5 h-3.5" /> Confirm Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Request More Information</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Ask the user to provide additional details for this submission.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user</Label>
              <Textarea value={infoMsg} onChange={(e) => setInfoMsg(e.target.value)} placeholder="Please provide a clearer photo of the gift card showing the PIN code..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[90px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Push notification</span><Switch checked={infoPush} onCheckedChange={setInfoPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Email</span><Switch checked={infoEmail} onCheckedChange={setInfoEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter>
            <button disabled={!infoMsg.trim()} onClick={() => setRequestInfoOpen(false)} className="w-full py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold for Review */}
      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Hold for Review</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Pause this submission for further investigation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <DialogUserSummary />
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Reason for hold</Label>
              <div className="relative">
                <select value={holdReason} onChange={(e) => setHoldReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer">
                  <option value="">Select a reason...</option>
                  <option value="suspicious">Suspicious Activity</option>
                  <option value="verify">Verify Identity</option>
                  <option value="validate">Card Validation Required</option>
                  <option value="risk">High Risk Score</option>
                  <option value="manual">Manual Review Needed</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Internal note <span className="text-gray-400 font-normal">(visible to admins only)</span></Label>
              <Textarea value={holdNote} onChange={(e) => setHoldNote(e.target.value)} placeholder="Add context for other admins reviewing this hold..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notify user via</span>
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-500">Push</span><Switch checked={holdPush} onCheckedChange={setHoldPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-500">Email</span><Switch checked={holdEmail} onCheckedChange={setHoldEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setHoldOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!holdReason} onClick={() => setHoldOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <Pause className="w-3.5 h-3.5" /> Place on Hold
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