import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Paperclip, Link2, Bold, Underline, Smile, Send, CheckCircle, X, ChevronDown, User, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "admin";
  name: string;
  text: string;
  time: string;
}

const ticketData = {
  id: "23122",
  user: {
    name: "Obed Vine",
    email: "beddv@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    kycTier: 3,
    status: "Active",
  },
  transactionId: "TX-829503",
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "user",
    name: "Obed Vine",
    text: "I submitted an Amazon $100 card 2 hours ago and it's still pending. Why?",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "2",
    sender: "admin",
    name: "Admin Vine",
    text: "Hi John, I'm checking your submission now. Can you confirm the card code you entered was correct?",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "3",
    sender: "user",
    name: "Obed Vine",
    text: "Yes, the code is AMA-BXTY-JJDV-2KNN.\nIt's definitely correct.",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "4",
    sender: "admin",
    name: "Admin Vine",
    text: "We are checking this for you.",
    time: "Jan 13, 2:30 PM",
  },
];

const admins = ["Vine (Support Admin)", "Obed (Support Admin)", "Pcc (Support Admin)"];

const KycBadge = ({ tier }: { tier: number }) => {
  const config: Record<number, { label: string; className: string }> = {
    3: { label: "Tier 3", className: "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent" },
    2: { label: "Tier 2", className: "border border-green-400 text-green-600 dark:text-green-400 bg-transparent" },
    1: { label: "Tier 1", className: "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent" },
  };
  const c = config[tier] ?? config[1];
  return (
    <Badge className={`${c.className} rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {c.label}
    </Badge>
  );
};

const SupportTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reply, setReply] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedAdmin, setAssignedAdmin] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "admin",
        name: "Admin Vine",
        text: trimmed,
        time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setReply("");
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate("/support-tickets")}
        className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">

          {/* Left panel */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-100/80 dark:border-gray-700/20 space-y-5">

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
                <img
                  src={ticketData.user.avatar}
                  alt={ticketData.user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-900 dark:text-white">{ticketData.user.name}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{ticketData.user.email}</p>
              </div>
              <Link
                to={`/users/${ticketData.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 transition-all whitespace-nowrap"
              >
                View user profile
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Tier + status badges */}
            <div className="flex items-center gap-2">
              <KycBadge tier={ticketData.user.kycTier} />
              <Badge className="border border-green-400 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5">
                {ticketData.user.status}
              </Badge>
            </div>

            <div className="border-t border-gray-100/80 dark:border-gray-700/20" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-[11px] font-semibold hover:bg-green-200/60 dark:hover:bg-green-500/25 transition-all border border-green-200/60 dark:border-green-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                Mark as Resolved
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-100/60 dark:hover:bg-red-500/20 transition-all border border-red-200/60 dark:border-red-500/20">
                <X className="w-3.5 h-3.5" />
                Close Ticket
              </button>
            </div>

            {/* Assign admin */}
            <div className="relative">
              <button
                onClick={() => setAssignOpen(!assignOpen)}
                className="w-full flex items-center justify-between px-3 h-9 rounded-[10px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/60 dark:border-gray-700/40 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] transition-all"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {assignedAdmin ?? "Assign Admin"}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", assignOpen && "rotate-180")} />
              </button>

              {assignOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] shadow-lg z-20 overflow-hidden">
                  {admins.map((admin) => (
                    <button
                      key={admin}
                      onClick={() => { setAssignedAdmin(admin); setAssignOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {admin}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View transaction */}
            <Link
              to={`/transactions/gift-cards/${ticketData.transactionId}`}
              className="flex items-center justify-center gap-2 w-full h-9 rounded-full bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/60 dark:border-gray-700/40 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View this transaction
            </Link>
          </div>

          {/* Right panel — conversation */}
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100/80 dark:border-gray-700/20">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Conversation Thread
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.sender === "admin" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("max-w-[75%]", msg.sender === "admin" ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.sender === "user" && (
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{msg.name}</span>
                      )}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{msg.time}</span>
                      {msg.sender === "admin" && (
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{msg.name}</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-3.5 py-2.5 rounded-[14px] text-[12px] leading-relaxed whitespace-pre-wrap",
                        msg.sender === "user"
                          ? "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 text-gray-800 dark:text-gray-200 rounded-tl-none"
                          : "bg-gradient-to-r from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-orange-500/20 dark:to-orange-500/10 text-gray-900 dark:text-white rounded-tr-none"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] border border-gray-200/60 dark:border-gray-700/30 overflow-hidden">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type your reply.."
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
                    disabled={!reply.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
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