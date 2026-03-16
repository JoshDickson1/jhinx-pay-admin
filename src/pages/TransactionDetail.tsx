import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowLeftRight, Flag, FileText, ExternalLink, ChevronDown, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mock data — in production pull by ID from API
const txData = {
  id: "JPX-TRX-829503",
  type: "Gift Card Sell",
  brand: "Amazon",
  cardValue: "$100",
  cardCode: "AMA-BXTY-JJDV-2KNN",
  appliedRate: "₦1,500/$1",
  payoutAmount: "₦150,000",
  submissionTime: "Jan 13, 2:30 PM",
  paymentMethod: "Naira Wallet",
  status: "Pending",
  approvalTime: "----------",
  approvalBy: "----------",
  imageQuality: "Good Quality",
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
  user: {
    id: "USR-001",
    name: "Obed Vine",
    email: "beddv@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    kycTier: 3,
    status: "Active",
  },
  adminNotes: [] as { by: string; note: string; time: string }[],
};

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(txData.adminNotes);
  const [imageOpen, setImageOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // Refund
  const [refundReason, setRefundReason] = useState("");
  const [refundMsg, setRefundMsg] = useState("");
  const [refundPush, setRefundPush] = useState(true);
  const [refundEmail, setRefundEmail] = useState(true);

  // Flag
  const [flagReason, setFlagReason] = useState("");
  const [flagNote, setFlagNote] = useState("");

  const statusColor = txData.status === "Completed"
    ? "border-green-500 text-green-600 dark:text-green-400"
    : txData.status === "Pending"
    ? "border-orange-400 text-orange-600 dark:text-orange-400"
    : "border-red-500 text-red-600 dark:text-red-400";

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Main card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">

          {/* Left — user + actions + notes */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-gray-100/80 dark:border-gray-700/20 space-y-5">

            {/* User */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-orange-200/50 dark:ring-orange-500/30">
                <img src={txData.user.avatar} alt={txData.user.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-white">{txData.user.name}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{txData.user.email}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 font-semibold">Tier {txData.user.kycTier}</Badge>
                <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-500/20 font-semibold">{txData.user.status}</Badge>
              </div>
              <Link to={`/users/${txData.user.id}`} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 hover:bg-orange-100/60 dark:hover:bg-orange-500/20 transition-all">
                View user profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="border-t border-gray-100/80 dark:border-gray-700/20" />

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Refund", icon: ArrowLeftRight, action: () => setRefundOpen(true) },
                { label: "Add note", icon: FileText, action: () => setNoteOpen(true) },
                { label: "Flag", icon: Flag, action: () => setFlagOpen(true) },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 py-2.5 rounded-[12px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
                </button>
              ))}
            </div>

            {/* Admin Notes */}
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Admin Notes:</p>
              <div className="min-h-[120px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3">
                {notes.length === 0 ? (
                  <p className="text-[12px] text-gray-400 dark:text-gray-600 text-center mt-8">No Notes</p>
                ) : (
                  <div className="space-y-2">
                    {notes.map((n, i) => (
                      <div key={i} className="bg-white/60 dark:bg-[#1C1C1C]/60 rounded-[10px] p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">{n.by}</span>
                          <span className="text-[10px] text-gray-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300">{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Transaction Details */}
          <div className="p-5">
            <p className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Transaction Details</p>

            <div className="space-y-0 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] overflow-hidden mb-4">
              {[
                { label: "Type:", value: txData.type },
                { label: "Transaction ID:", value: txData.id },
                { label: "Brand:", value: txData.brand },
                { label: "Card Value:", value: txData.cardValue },
                { label: "Card Code:", value: txData.cardCode, mono: true },
                { label: "Applied Rate:", value: txData.appliedRate },
                { label: "Payout Amount:", value: txData.payoutAmount, highlight: true },
                { label: "Submission Time:", value: txData.submissionTime },
                { label: "Payment Method:", value: txData.paymentMethod },
                { label: "Status:", value: txData.status, badge: true },
                { label: "Approval Time:", value: txData.approvalTime },
                { label: "Approval By:", value: txData.approvalBy },
              ].map(({ label, value, mono, highlight, badge }, i) => (
                <div key={label} className={cn("flex items-center justify-between px-4 py-2.5", i % 2 === 0 ? "bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30" : "")}>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">{label}</span>
                  {badge ? (
                    <Badge className={cn("border rounded-full text-[11px] font-semibold px-3 py-0 h-5 bg-transparent", statusColor)}>{value}</Badge>
                  ) : (
                    <span className={cn("text-[12px] font-semibold text-gray-900 dark:text-white", mono && "font-mono text-[11px]", highlight && "text-orange-600 dark:text-orange-400")}>{value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Uploaded Image */}
            <div className="border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100/80 dark:border-gray-700/20">
                <span className="text-[12px] font-semibold text-gray-900 dark:text-white">Uploaded Image</span>
                <Badge className="text-[10px] px-2 py-0 h-5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 font-semibold">{txData.imageQuality}</Badge>
              </div>
              <div className="p-4">
                <div className="relative bg-orange-500 rounded-[10px] p-6 cursor-pointer group mb-3" onClick={() => setImageOpen(true)}>
                  <img src={txData.imageUrl} alt="Card" className="w-full h-auto" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
                <button onClick={() => navigate(`/transactions/gift-cards/${id}`)} className="w-full h-9 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
                  Review <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Preview Dialog ── */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl">
          <DialogHeader><DialogTitle className="text-[14px] font-bold">Image Preview</DialogTitle></DialogHeader>
          <div className="bg-orange-500 rounded-[12px] p-10"><img src={txData.imageUrl} className="w-full h-auto" /></div>
        </DialogContent>
      </Dialog>

      {/* ── Add Note Dialog ── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Add Admin Note</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">This note is only visible to admins.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Write your note here..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[100px] resize-none" />
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setNoteOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!newNote.trim()} onClick={() => { setNotes((p) => [...p, { by: "Admin Vine", note: newNote.trim(), time: "Just now" }]); setNewNote(""); setNoteOpen(false); }} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
              Save Note
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog ── */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Process Refund</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Refund <span className="font-semibold text-orange-600 dark:text-orange-400">{txData.payoutAmount}</span> to user's wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Reason</Label>
              <div className="relative">
                <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer">
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
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Message to user <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea value={refundMsg} onChange={(e) => setRefundMsg(e.target.value)} placeholder="Your refund has been processed..." className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] min-h-[70px] resize-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Push</span><Switch checked={refundPush} onCheckedChange={setRefundPush} className="data-[state=checked]:bg-green-500 scale-90" /></div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2"><span className="text-[11px] text-gray-600 dark:text-gray-400">Email</span><Switch checked={refundEmail} onCheckedChange={setRefundEmail} className="data-[state=checked]:bg-green-500 scale-90" /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setRefundOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!refundReason} onClick={() => setRefundOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Confirm Refund
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
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Flag reason</Label>
              <div className="relative">
                <select value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer">
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
          <DialogFooter className="gap-2">
            <button onClick={() => setFlagOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!flagReason} onClick={() => setFlagOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <Flag className="w-3.5 h-3.5" /> Flag Transaction
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionDetail;