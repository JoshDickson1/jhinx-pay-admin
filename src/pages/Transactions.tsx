import { useState } from "react";
import { ArrowLeftRight, Eye, Download, Search, MoreHorizontal, Calendar, FileDown, ChevronDown, TrendingUp, TrendingDown, CheckCircle, Clock, XCircle } from "lucide-react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  txId: string;
  user: { name: string; email: string; avatar: string };
  type: "crypto_buy" | "crypto_sell" | "gift_card_buy" | "gift_card_sell" | "game_recharge";
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
  details: string;
}

const transactions: Transaction[] = [
  { id: "1", txId: "JPX-TRX-829503", user: { name: "John Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=12" }, type: "gift_card_buy", amount: "₦38,000", status: "completed", date: "Jan 13, 2:30 PM", details: "Amazon $25" },
  { id: "2", txId: "JPX-TRX-829504", user: { name: "Obed Vine", email: "beddv@gmail.com", avatar: "https://i.pravatar.cc/150?img=33" }, type: "gift_card_sell", amount: "₦38,000", status: "pending", date: "Jan 13, 2:30 PM", details: "Amazon $25" },
  { id: "3", txId: "JPX-TRX-829505", user: { name: "Wizz John", email: "wizzy@gmail.com", avatar: "https://i.pravatar.cc/150?img=15" }, type: "crypto_buy", amount: "₦79,000", status: "completed", date: "Jan 13, 2:30 PM", details: "50 USDT" },
  { id: "4", txId: "JPX-TRX-829506", user: { name: "Precious Chisom", email: "pcc@gmail.com", avatar: "https://i.pravatar.cc/150?img=45" }, type: "game_recharge", amount: "₦5,000", status: "pending", date: "Jan 13, 2:30 PM", details: "COD Mobile 800 CP" },
  { id: "5", txId: "JPX-TRX-829507", user: { name: "Benedita Josh", email: "bennyj@gmail.com", avatar: "https://i.pravatar.cc/150?img=47" }, type: "game_recharge", amount: "₦10,000", status: "failed", date: "Jan 13, 2:30 PM", details: "COD Mobile 1200 CP" },
  { id: "6", txId: "JPX-TRX-829508", user: { name: "Charity Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=26" }, type: "crypto_sell", amount: "₦10,000", status: "failed", date: "Jan 13, 2:30 PM", details: "0.05 BTC" },
];

const typeLabels: Record<Transaction["type"], string> = {
  crypto_buy: "Crypto Buy",
  crypto_sell: "Crypto Sell",
  gift_card_buy: "Gift Card Buy",
  gift_card_sell: "Gift Card Sell",
  game_recharge: "Gamepoints Recharge",
};

const metrics = [
  { label: "Total Transactions", value: "12,834", change: "23% from last week", up: true, icon: ArrowLeftRight },
  { label: "Pending Actions", value: "23,648", change: "23% from last week", up: true, icon: Clock },
  { label: "Transaction Volume", value: "₦45.2M", change: "23% from this month", up: true, icon: TrendingUp },
  { label: "Success Rate", value: "96.4%", change: "23% from this month", up: true, icon: CheckCircle },
  { label: "Failed Transaction", value: "52", change: "20% from this month", up: false, icon: XCircle },
];

const tabs = [
  { id: "all", label: "All" },
  { id: "giftcard", label: "Giftcard" },
  { id: "crypto", label: "Crypto" },
  { id: "gamepoints", label: "Gamepoints" },
];

const Transactions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  // Dialog states
  const [exportOpen, setExportOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [flagTarget, setFlagTarget] = useState<Transaction | null>(null);
  const [refundMsg, setRefundMsg] = useState("");
  const [refundPush, setRefundPush] = useState(true);
  const [refundEmail, setRefundEmail] = useState(true);
  const [flagReason, setFlagReason] = useState("");
  const [flagNote, setFlagNote] = useState("");

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchSearch = tx.txId.toLowerCase().includes(q) || tx.user.name.toLowerCase().includes(q) || tx.user.email.toLowerCase().includes(q);
    const matchTab = activeTab === "all"
      || (activeTab === "giftcard" && tx.type.includes("gift_card"))
      || (activeTab === "crypto" && tx.type.includes("crypto"))
      || (activeTab === "gamepoints" && tx.type === "game_recharge");
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchSearch && matchTab && matchStatus;
  });

  const FilterSelect = ({ value, setter, options }: { value: string; setter: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="relative">
      <select value={value} onChange={(e) => setter(e.target.value)} className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 transition-all">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[12px]">View and monitor all platform transactions</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map(({ label, value, change, up, icon: Icon }) => (
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
                {change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Date + Export row */}
      <div className="flex items-center justify-between gap-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          Sort by: MM/DD/YY – MM/DD/YY
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setExportOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => setInvoiceOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" /> Download Invoices
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Tabs + Search */}
        <div className="px-4 pt-3 pb-0 border-b border-gray-100/80 dark:border-gray-700/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            {/* Tabs */}
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

            {/* Search + Filters */}
            <div className="flex items-center gap-2 pb-2.5 ml-auto flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or user...." className="pl-8 h-9 w-64 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400" />
              </div>
              <FilterSelect value={statusFilter} setter={setStatusFilter} options={[{ value: "all", label: "Status: All" }, { value: "completed", label: "Completed" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }]} />
              <FilterSelect value={amountFilter} setter={setAmountFilter} options={[{ value: "all", label: "Amount Range" }, { value: "low", label: "₦0 – ₦10,000" }, { value: "mid", label: "₦10k – ₦50k" }, { value: "high", label: "₦50,000+" }]} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Transaction ID", "User", "Type", "Details", "Amount", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {filtered.map((tx) => (
                <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white font-mono">{tx.txId}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500">{tx.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0">
                        <img src={tx.user.avatar} alt={tx.user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; const p = e.currentTarget.parentElement; if (p) p.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white text-xs font-bold">${tx.user.name.charAt(0)}</span></div>`; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{tx.user.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{tx.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[12px] font-medium text-gray-800 dark:text-gray-200">{typeLabels[tx.type]}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-gray-600 dark:text-gray-400">{tx.details}</span></td>
                  <td className="px-4 py-3"><span className="text-[13px] font-bold text-gray-900 dark:text-white">{tx.amount}</span></td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border rounded-full text-[11px] font-semibold px-3 py-0.5 bg-transparent",
                      tx.status === "completed" ? "border-green-500 text-green-600 dark:text-green-400"
                      : tx.status === "pending" ? "border-orange-400 text-orange-600 dark:text-orange-400"
                      : "border-red-500 text-red-600 dark:text-red-400"
                    )}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
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
                        <DropdownMenuItem onClick={() => navigate(`/transactions/${tx.id}`)} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                          <Eye className="w-3.5 h-3.5 text-gray-500" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setRefundTarget(tx); setRefundMsg(""); }} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" /> Refund
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                        <DropdownMenuItem onClick={() => { setFlagTarget(tx); setFlagReason(""); setFlagNote(""); }} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-orange-600 dark:text-orange-400">
                          Flag for Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">1–{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">5,648</span> transactions
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-400 cursor-not-allowed opacity-50">Previous</button>
            <button className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* ── Export CSV Dialog ── */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Export CSV</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Choose what to include in your export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Date Range", opts: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"] },
              { label: "Transaction Type", opts: ["All", "Gift Card", "Crypto", "Gamepoints"] },
              { label: "Status", opts: ["All", "Completed", "Pending", "Failed"] },
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
            <button onClick={() => setExportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setExportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" /> Export
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Download Invoices Dialog ── */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Download Invoices</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Select the format and range for your invoices.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Format", opts: ["PDF", "Excel (.xlsx)", "CSV"] },
              { label: "Period", opts: ["This month", "Last month", "Last 3 months", "Custom range"] },
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
      </Dialog>

      {/* ── Refund Dialog ── */}
      <Dialog open={!!refundTarget} onOpenChange={() => setRefundTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Process Refund</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Refund <span className="font-semibold text-orange-600 dark:text-orange-400">{refundTarget?.amount}</span> to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          {refundTarget && (
            <div className="space-y-3 py-1">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
                    <img src={refundTarget.user.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{refundTarget.user.name}</p>
                    <p className="text-[10px] text-gray-500">{refundTarget.user.email}</p>
                  </div>
                </div>
                {[{ label: "Transaction ID", value: refundTarget.txId }, { label: "Type", value: typeLabels[refundTarget.type] }, { label: "Amount", value: refundTarget.amount }].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[11px] text-gray-500">{label}:</span>
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Reason for refund</Label>
                <div className="relative">
                  <select className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                    <option>Select reason...</option>
                    <option>User complaint</option>
                    <option>Failed transaction</option>
                    <option>Duplicate charge</option>
                    <option>Fraud prevention</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={refundMsg} onChange={(e) => setRefundMsg(e.target.value)} placeholder="Your refund has been processed and will reflect shortly..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span><Switch checked={refundPush} onCheckedChange={setRefundPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span><Switch checked={refundEmail} onCheckedChange={setRefundEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setRefundTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setRefundTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Confirm Refund
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Flag for Review Dialog ── */}
      <Dialog open={!!flagTarget} onOpenChange={() => setFlagTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Flag for Review</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">This transaction will be escalated for manual review.</DialogDescription>
          </DialogHeader>
          {flagTarget && (
            <div className="space-y-3 py-1">
              <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-1.5">
                {[{ label: "Transaction ID", value: flagTarget.txId }, { label: "User", value: flagTarget.user.name }, { label: "Amount", value: flagTarget.amount }, { label: "Type", value: typeLabels[flagTarget.type] }].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[11px] text-gray-500">{label}:</span>
                    <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Flag reason</Label>
                <div className="relative">
                  <select value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
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
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Internal note <span className="text-gray-400 font-normal">(admins only)</span></Label>
                <Textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} placeholder="Add context for the review team..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setFlagTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!flagReason} onClick={() => setFlagTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              Flag Transaction
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