import { useState } from "react";
import { Search, Clock, ChevronDown, Eye, CheckCircle, XCircle, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GiftCardSubmission {
  id: string;
  txId: string;
  date: string;
  user: { name: string; email: string; avatar: string };
  brand: string;
  cardValue: string;
  payout: string;
  timeElapsed: string;
  riskLevel: "Low" | "Mid" | "High";
}

const submissions: GiftCardSubmission[] = [
  { id: "GC-001", txId: "JPX-TRX-829503", date: "Jan 13, 2:30 PM", user: { name: "John Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=12" }, brand: "Amazon", cardValue: "$25", payout: "₦38,000", timeElapsed: "50 min", riskLevel: "Low" },
  { id: "GC-002", txId: "JPX-TRX-829504", date: "Jan 13, 2:30 PM", user: { name: "Obed Vine", email: "beddv@gmail.com", avatar: "https://i.pravatar.cc/150?img=33" }, brand: "iTunes", cardValue: "$50", payout: "₦78,000", timeElapsed: "41 min", riskLevel: "Mid" },
  { id: "GC-003", txId: "JPX-TRX-829505", date: "Jan 13, 2:30 PM", user: { name: "Wizz John", email: "wizzy@gmail.com", avatar: "https://i.pravatar.cc/150?img=15" }, brand: "eBay", cardValue: "$100", payout: "₦152,000", timeElapsed: "32 min", riskLevel: "Low" },
  { id: "GC-004", txId: "JPX-TRX-829506", date: "Jan 13, 2:30 PM", user: { name: "Precious Chisom", email: "pcc@gmail.com", avatar: "https://i.pravatar.cc/150?img=45" }, brand: "PlayStation", cardValue: "$25", payout: "₦35,000", timeElapsed: "22 min", riskLevel: "Low" },
  { id: "GC-005", txId: "JPX-TRX-829507", date: "Jan 13, 2:30 PM", user: { name: "Benedita Josh", email: "bennyj@gmail.com", avatar: "https://i.pravatar.cc/150?img=47" }, brand: "Steam", cardValue: "$50", payout: "₦70,000", timeElapsed: "10 min", riskLevel: "High" },
  { id: "GC-006", txId: "JPX-TRX-829508", date: "Jan 13, 2:30 PM", user: { name: "Charity Frank", email: "johnnyfrk@gmail.com", avatar: "https://i.pravatar.cc/150?img=26" }, brand: "Amazon", cardValue: "$50", payout: "₦78,000", timeElapsed: "5 min", riskLevel: "High" },
];

const riskStyles = {
  Low:  "border border-green-500 text-green-600 dark:text-green-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  Mid:  "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
  High: "border border-red-500 text-red-600 dark:text-red-400 bg-transparent rounded-full text-[11px] font-semibold px-3 py-0.5",
};

// Shared user summary for quick action dialogs
const QuickUserSummary = ({ sub }: { sub: GiftCardSubmission }) => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2.5">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
        <img src={sub.user.avatar} alt={sub.user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{sub.user.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{sub.user.email}</p>
      </div>
      <Badge className={riskStyles[sub.riskLevel]}>{sub.riskLevel}</Badge>
    </div>
    <div className="space-y-1">
      {[
        { label: "Transaction ID", value: sub.txId },
        { label: "Brand", value: sub.brand },
        { label: "Card Value", value: sub.cardValue },
        { label: "Payout", value: sub.payout },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}:</span>
          <span className="text-[11px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

export const GiftCardQueue = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Oldest First");
  const [brandFilter, setBrandFilter] = useState("All Brands");
  const [riskFilter, setRiskFilter] = useState("All Risk Level");
  const [amountFilter, setAmountFilter] = useState("Amount Range");

  // Quick Approve dialog
  const [approveTarget, setApproveTarget] = useState<GiftCardSubmission | null>(null);
  const [approveMsg, setApproveMsg] = useState("");
  const [approvePush, setApprovePush] = useState(true);
  const [approveEmail, setApproveEmail] = useState(true);

  // Quick Reject dialog
  const [rejectTarget, setRejectTarget] = useState<GiftCardSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");
  const [rejectPush, setRejectPush] = useState(true);
  const [rejectEmail, setRejectEmail] = useState(true);

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.txId.toLowerCase().includes(q) || s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q);
    const matchBrand = brandFilter === "All Brands" || s.brand === brandFilter;
    const matchRisk = riskFilter === "All Risk Level" || s.riskLevel === riskFilter;
    return matchSearch && matchBrand && matchRisk;
  });

  const FilterSelect = ({ value, setter, options }: { value: string; setter: (v: string) => void; options: string[] }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 whitespace-nowrap"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

      {/* Search + Filters */}
      <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or user...."
            className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[12px] placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect value={sort} setter={setSort} options={["Oldest First", "Newest First", "Highest Risk", "Highest Amount"]} />
          <FilterSelect value={brandFilter} setter={setBrandFilter} options={["All Brands", "Amazon", "iTunes", "eBay", "PlayStation", "Steam", "Google Play"]} />
          <FilterSelect value={riskFilter} setter={setRiskFilter} options={["All Risk Level", "Low", "Mid", "High"]} />
          <FilterSelect value={amountFilter} setter={setAmountFilter} options={["Amount Range", "$0–$25", "$25–$100", "$100+"]} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
              {["Submission ID", "User", "Card Brand", "Card Value", "Payout", "Time Elapse", "Risk Level", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
            {filtered.map((sub) => (
              <tr
                key={sub.id}
                onClick={() => navigate(`/transactions/gift-cards/${sub.id}`)}
                className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 cursor-pointer transition-colors"
              >
                {/* Submission ID */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-[12px] font-bold text-gray-900 dark:text-white">{sub.txId}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500">{sub.date}</p>
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-700/50 flex-shrink-0">
                      <img
                        src={sub.user.avatar}
                        alt={sub.user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const p = e.currentTarget.parentElement;
                          if (p) p.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white text-xs font-bold">${sub.user.name.charAt(0)}</span></div>`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">{sub.user.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{sub.user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Brand */}
                <td className="px-4 py-3">
                  <span className="text-[12px] text-gray-800 dark:text-gray-200">{sub.brand}</span>
                </td>

                {/* Card Value */}
                <td className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-gray-900 dark:text-white">{sub.cardValue}</span>
                </td>

                {/* Payout */}
                <td className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-gray-900 dark:text-white">{sub.payout}</span>
                </td>

                {/* Time */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[12px]">{sub.timeElapsed}</span>
                  </div>
                </td>

                {/* Risk */}
                <td className="px-4 py-3">
                  <Badge className={riskStyles[sub.riskLevel]}>{sub.riskLevel}</Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                        <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1">Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigate(`/transactions/gift-cards/${sub.id}`)}
                        className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" /> Review
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setApproveTarget(sub); setApproveMsg(""); }}
                        className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Quick Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setRejectTarget(sub); setRejectReason(""); setRejectMsg(""); }}
                        className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" /> Quick Reject
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
          Showing <span className="font-semibold text-gray-900 dark:text-white">1–{filtered.length}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">5,648</span> submission
        </p>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all opacity-50 cursor-not-allowed" disabled>
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all">
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
              Approve and payout <span className="font-semibold text-orange-600 dark:text-orange-400">{approveTarget?.payout}</span> to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-3 py-1">
              <QuickUserSummary sub={approveTarget} />
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={approveMsg} onChange={(e) => setApproveMsg(e.target.value)} placeholder="Your gift card has been approved and payment has been processed..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span><Switch checked={approvePush} onCheckedChange={setApprovePush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span><Switch checked={approveEmail} onCheckedChange={setApproveEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setApproveTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setApproveTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Confirm Approval
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
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Rejection reason</Label>
                <div className="relative">
                  <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
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
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)} placeholder="We were unable to process your gift card because..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span><Switch checked={rejectPush} onCheckedChange={setRejectPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span><Switch checked={rejectEmail} onCheckedChange={setRejectEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!rejectReason} onClick={() => setRejectTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <XCircle className="w-3.5 h-3.5" /> Confirm Reject
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