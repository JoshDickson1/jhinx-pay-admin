import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Link2,
  Bold,
  Underline,
  Smile,
  CheckCircle,
  X,
  FileText,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  content: string;
  time: string;
}

const ticketData = {
  id: "#23123",
  user: {
    name: "Obed Vine",
    email: "beddv@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=33",
    tier: 3,
    status: "Active",
  },
  subject: "Gift card issue",
  priority: "Mid",
  status: "Pending",
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "user",
    senderName: "Obed Vine",
    content: "I submitted an Amazon $100 card 2 hours ago and it's still pending. Why?",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "2",
    sender: "admin",
    senderName: "Admin Vine",
    content: "Hi John, I'm checking your submission now. Can you confirm the card code you entered was correct?",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "3",
    sender: "user",
    senderName: "Obed Vine",
    content: "Yes, the code is AMA-BXTY-JJDV-2KNN. It's definitely correct.",
    time: "Jan 13, 2:30 PM",
  },
  {
    id: "4",
    sender: "admin",
    senderName: "Admin Vine",
    content: "We are checking this for you.",
    time: "Jan 13, 2:30 PM",
  },
];

const admins = [
  { id: "1", name: "Vine (Support Admin)" },
  { id: "2", name: "Obed (Support Admin)" },
  { id: "3", name: "Pcc (Support Admin)" },
];

const KycBadge = ({ tier }: { tier: number }) => (
  <Badge className="border border-orange-400 text-orange-500 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5">
    Tier {tier}
  </Badge>
);

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className="border border-green-400 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-2.5 py-0.5">
    {status}
  </Badge>
);

const ViewTicket = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [replyText, setReplyText] = useState("");
  const [assignedAdmin, setAssignedAdmin] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState(ticketData.status);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!replyText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "admin",
      senderName: "Admin Vine",
      content: replyText.trim(),
      time: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        to="/support"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Main Layout */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* ── LEFT PANEL ── */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200/50 dark:border-gray-700/30 space-y-6">

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-orange-200/40 dark:ring-orange-500/20 flex-shrink-0">
                <img
                  src={ticketData.user.avatar}
                  alt={ticketData.user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const p = e.currentTarget.parentElement;
                    if (p) p.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white text-xl font-semibold">${ticketData.user.name.charAt(0)}</span></div>`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[17px] text-gray-900 dark:text-white">{ticketData.user.name}</h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-500">{ticketData.user.email}</p>
              </div>
              <Link to={`/users/${ticketData.user.email}`}>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-full bg-gradient-to-r from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-[#FFE6B0]/10 dark:to-[#FFD98A]/5 border-orange-200/50 dark:border-orange-500/20 text-gray-800 dark:text-gray-200 hover:from-[#FFE6B0] hover:to-[#FFD98A] text-[13px] font-medium gap-2"
                >
                  View user profile
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            </div>

            {/* Tier + Status Badges */}
            <div className="flex items-center gap-2">
              <KycBadge tier={ticketData.user.tier} />
              <StatusBadge status={ticketData.user.status} />
            </div>

            <div className="h-px bg-gray-200/60 dark:bg-gray-700/30" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setTicketStatus("Resolved")}
                className="h-11 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 border-0 font-semibold text-[13px] gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </Button>
              <Button
                onClick={() => setTicketStatus("Closed")}
                className="h-11 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border-0 font-semibold text-[13px] gap-2"
              >
                <X className="w-4 h-4" />
                Close Ticket
              </Button>
            </div>

            {/* Assign Admin */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-[14px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] justify-between text-[13px] font-medium"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {assignedAdmin || "Assign Admin"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2">
                  {admins.map((admin) => (
                    <DropdownMenuItem
                      key={admin.id}
                      className="rounded-[10px] text-[13px] cursor-pointer gap-2"
                      onClick={() => setAssignedAdmin(admin.name)}
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      {admin.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin list shown */}
              <div className="mt-3 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] divide-y divide-gray-200/40 dark:divide-gray-700/30 overflow-hidden">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#DFDFDF]/60 dark:hover:bg-[#3A3737]/60 transition-colors ${assignedAdmin === admin.name ? "bg-gradient-to-r from-[#FFE6B0]/40 to-transparent dark:from-[#FFE6B0]/10" : ""}`}
                    onClick={() => setAssignedAdmin(admin.name)}
                  >
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className={`text-[13px] font-medium ${assignedAdmin === admin.name ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {admin.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* View Transaction */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-full bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] text-[13px] font-medium gap-2"
            >
              <FileText className="w-4 h-4" />
              View this transaction
            </Button>
          </div>

          {/* ── RIGHT PANEL – CHAT ── */}
          <div className="flex flex-col h-[680px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/30 bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Conversation Thread
                </h3>
                <div className="flex items-center gap-2">
                  {ticketStatus !== ticketData.status && (
                    <Badge className={`border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                      ticketStatus === "Resolved"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {ticketStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${msg.sender === "admin" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                      {msg.sender === "user" && (
                        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">
                          {msg.senderName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500 dark:text-gray-500">{msg.time}</span>
                      {msg.sender === "admin" && (
                        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">
                          {msg.senderName}
                        </span>
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-[16px] text-[13px] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#F5F5F5]/90 dark:bg-[#2D2B2B]/90 text-gray-900 dark:text-white rounded-tl-[4px]"
                          : "bg-[#F5F5F5]/90 dark:bg-[#2D2B2B]/90 text-gray-900 dark:text-white rounded-tr-[4px]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[18px] overflow-hidden border border-gray-200/50 dark:border-gray-700/30">
                <Textarea
                  placeholder="Type your reply.."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="bg-transparent border-0 resize-none text-[13px] placeholder:text-gray-500 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 pt-4 pb-2"
                />
                <div className="flex items-center justify-between px-4 pb-3 pt-1">
                  {/* Formatting icons */}
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <Underline className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Send button */}
                  <Button
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="h-9 px-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/30 text-[13px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.4); }
      `}</style>
    </div>
  );
};

export default ViewTicket;