import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Smartphone,
  Shield,
  Clock,
  Wallet,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Ban,
  Unlock,
  Key,
  Download,
  Plus,
  Eye,
  Check,
  X,
  Info,
  Pause,
  Send,
  ZoomIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock user data
const userData = {
  id: "USR-001234",
  name: "Obed Vine",
  email: "beddv@gmail.com",
  phone: "+234 801 234 5678",
  profilePhoto: "https://i.pravatar.cc/150?img=12",
  status: "active" as const,
  joinDate: "Jul 15, 2025",
  lastLogin: "2 hours ago",
  kycTier: 3,
  kycStatus: "approved" as const,
  kycSubmittedDate: "Aug 1, 2025",
  kycReviewedBy: "Admin Sarah",
  device: "iPhone 14 Pro",
  os: "iOS 17.2",
  location: "Lagos, Nigeria",
  balances: {
    naira: 125450,
    usdt: 250.0,
    btc: 0.0023,
    eth: 0.15,
  },
  riskAssessment: {
    overallRating: 72,
    accountAge: { value: "6 Months", risk: "Low" },
    pastTrades: { value: 5, risk: "Low" },
    totalVolume: { value: "$450", risk: "Low" },
    lastTradeDate: { value: "Feb, 10 2:30pm", risk: "Low" },
    cardAmount: { value: "$100", risk: "Mid" },
    newDevice: { value: "Yes", risk: "Low" },
    ipLocation: { value: "Lagos, Nigeria", risk: "Low" },
  },
  cardDetails: {
    brand: "Amazon",
    cardValue: "$100",
    cardCode: "AMA-BXTY-JJDV-2KNN",
    appliedRate: "₦1,500/$1",
    payoutAmount: "₦150,000",
    submissionTime: "Jan 13, 2:30 PM",
    timeElapse: "Jan 13, 2:30 PM",
    paymentMethod: "Naira Wallet",
    status: "Pending",
    imageQuality: "Good Quality",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
  },
  adminNotes: [
    {
      by: "Admin Vine",
      note: "Looks valid, User has clean history, and can be trusted",
      date: "Jan 13, 2:30 PM",
    },
  ],
  transactions: [
    { id: "TX-001", type: "Crypto Buy", amount: "₦45,000", status: "completed", date: "Jan 13, 2026" },
    { id: "TX-002", type: "Gift Card Sell", amount: "₦76,000", status: "completed", date: "Jan 12, 2026" },
    { id: "TX-003", type: "Game Recharge", amount: "₦5,000", status: "completed", date: "Jan 10, 2026" },
    { id: "TX-004", type: "Crypto Sell", amount: "₦120,000", status: "pending", date: "Jan 8, 2026" },
    { id: "TX-005", type: "Gift Card Sell", amount: "₦38,000", status: "failed", date: "Jan 5, 2026" },
  ],
  auditLog: [
    { action: "KYC Approved", by: "Admin Sarah", date: "Aug 1, 2025 • 2:30 PM" },
    { action: "Account Created", by: "System", date: "Jul 15, 2025 • 10:15 AM" },
  ],
};

const KycBadge = ({ tier }: { tier: number }) => {
  const config = {
    0: { label: "Tier 0", className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    1: { label: "Tier 1", className: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    2: { label: "Tier 2", className: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
    3: { label: "Tier 3", className: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  };
  
  return (
    <Badge className={`${config[tier as keyof typeof config]?.className || config[0].className} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {config[tier as keyof typeof config]?.label || "Tier 0"}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    active: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    frozen: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    banned: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
  };

  return (
    <Badge className={`${config[status] || config.active} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5 capitalize`}>
      {status}
    </Badge>
  );
};

const RiskBadge = ({ risk }: { risk: string }) => {
  const config: Record<string, string> = {
    Low: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    Mid: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
    High: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
  };

  return (
    <Badge className={`${config[risk] || config.Low} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {risk}
    </Badge>
  );
};

// Reusable user summary card shown inside dialogs
const DialogUserSummary = () => (
  <div className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] p-3.5 space-y-3">
    {/* User row */}
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30 flex-shrink-0">
        <img
          src={userData.profilePhoto}
          alt={userData.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{userData.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <KycBadge tier={userData.kycTier} />
        <StatusBadge status={userData.status} />
      </div>
    </div>
    {/* Transaction summary */}
    <div className="space-y-1.5">
      {[
        { label: "Card:", value: userData.cardDetails.brand },
        { label: "Card Code:", value: userData.cardDetails.cardCode },
        { label: "Transaction ID:", value: "JPX-TRX-829503" },
        { label: "Payout Amount:", value: userData.cardDetails.payoutAmount },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500 dark:text-gray-400">{label}</span>
          <span className="text-[12px] font-semibold text-gray-900 dark:text-white font-mono">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const UserDetail = () => {
  const { id } = useParams();
  const [newNote, setNewNote] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  // Request Info state
  const [infoMessage, setInfoMessage] = useState("");
  const [infoPush, setInfoPush] = useState(true);
  const [infoEmail, setInfoEmail] = useState(false);

  // Hold for Review state
  const [holdReason, setHoldReason] = useState("");
  const [holdNote, setHoldNote] = useState("");
  const [holdPush, setHoldPush] = useState(true);
  const [holdEmail, setHoldEmail] = useState(false);

  const handleApprove = () => {
    console.log("Approved with message:", emailMessage);
    setApproveDialogOpen(false);
  };

  const handleReject = () => {
    console.log("Rejected with message:", emailMessage);
    setRejectDialogOpen(false);
  };

  const handleRequestInfo = () => {
    console.log("Request info sent:", infoMessage);
    setRequestInfoDialogOpen(false);
    setInfoMessage("");
  };

  const handleHold = () => {
    console.log("Held for review:", holdReason, holdNote);
    setHoldDialogOpen(false);
    setHoldReason("");
    setHoldNote("");
  };

  const getRiskColor = (rating: number) => {
    if (rating >= 70) return "text-orange-600 dark:text-orange-400";
    if (rating >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getRiskGradient = (rating: number) => {
    const percentage = rating;
    const greenWidth = Math.min(percentage, 33);
    const yellowWidth = Math.min(Math.max(percentage - 33, 0), 34);
    const orangeWidth = Math.max(percentage - 67, 0);
    
    return (
      <div className="flex h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="bg-green-500" style={{ width: `${greenWidth}%` }} />
        <div className="bg-yellow-500" style={{ width: `${yellowWidth}%` }} />
        <div className="bg-orange-500" style={{ width: `${orangeWidth}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/users">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-[13px]">{userData.id}</p>
        </div>
        <Link to="/users">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            View user profile
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline"
              className="h-10 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium"
            >
              Actions
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2"
          >
            <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[10px] text-[13px] cursor-pointer">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
            <DropdownMenuItem className="text-orange-600 dark:text-orange-400 rounded-[10px] text-[13px] cursor-pointer">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Freeze Account
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400 rounded-[10px] text-[13px] cursor-pointer">
              <Ban className="w-4 h-4 mr-2" />
              Ban Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Risk Assessment */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange-200/50 dark:ring-orange-500/30 mb-4">
                <img 
                  src={userData.profilePhoto} 
                  alt={userData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <span class="text-white text-2xl font-semibold">${userData.name.charAt(0)}</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{userData.name}</h2>
              <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-3">{userData.email}</p>
              <div className="flex items-center gap-2">
                <KycBadge tier={userData.kycTier} />
                <StatusBadge status={userData.status} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-[13px]">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white truncate">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">Joined</span>
                <span className="text-gray-900 dark:text-white ml-auto">{userData.joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">Last login</span>
                <span className="text-gray-900 dark:text-white ml-auto">{userData.lastLogin}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Smartphone className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white truncate">{userData.device} • {userData.os}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white">{userData.location}</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">Risk Assessment</h3>
              <span className="text-[11px] text-gray-500 dark:text-gray-500">Last updated: 2 mins ago</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-gray-600 dark:text-gray-400">Overall Risk Rating</span>
                <Badge className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
                  {userData.riskAssessment.overallRating}/100 Mid
                </Badge>
              </div>
              {getRiskGradient(userData.riskAssessment.overallRating)}
            </div>

            <div className="space-y-3">
              {Object.entries(userData.riskAssessment).filter(([key]) => key !== 'overallRating').map(([key, data]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px]">
                  <div className="flex-1">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-[13px] font-medium text-gray-900 dark:text-white ml-2">
                      {typeof data === 'object' ? data.value : data}
                    </span>
                  </div>
                  {typeof data === 'object' && data.risk && <RiskBadge risk={data.risk} />}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4">Admin Notes:</h3>
            
            <div className="space-y-3 mb-4">
              {userData.adminNotes.map((note, idx) => (
                <div key={idx} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[14px] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-orange-600 dark:text-orange-400">
                      By: {note.by}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-500">{note.date}</span>
                  </div>
                  <p className="text-[13px] text-gray-700 dark:text-gray-300">{note.note}</p>
                </div>
              ))}
            </div>

            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[14px] mb-3 text-[13px] min-h-[80px]"
            />
            <Button 
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/30 text-[13px]"
            >
              Save note
            </Button>
          </div>
        </div>

        {/* Right Column - Card Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
            <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-6">Card Details</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Brand:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Card Value:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.cardValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Card Code:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white font-mono">{userData.cardDetails.cardCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Applied Rate:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.appliedRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Payout Amount:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.payoutAmount}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Submission Time:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.submissionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Time Elapse:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.timeElapse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{userData.cardDetails.status}</span>
                </div>
              </div>
            </div>

            {/* Uploaded Image */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white">Uploaded Image</h4>
                <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
                  {userData.cardDetails.imageQuality}
                </Badge>
              </div>
              
              <div className="relative bg-orange-500 rounded-[16px] p-8 mb-3">
                <img 
                  src={userData.cardDetails.imageUrl} 
                  alt="Card Preview" 
                  className="w-full h-auto"
                />
              </div>

              <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="w-full h-10 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] border-0 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] text-[13px] font-medium"
                  >
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Preview Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[20px]">
                  <DialogHeader>
                    <DialogTitle className="text-[18px] font-bold">Card Image Preview</DialogTitle>
                  </DialogHeader>
                  <div className="bg-orange-500 rounded-[16px] p-12">
                    <img 
                      src={userData.cardDetails.imageUrl} 
                      alt="Card Full Preview" 
                      className="w-full h-auto"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Approve Dialog */}
              <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/30 text-[13px]">
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[20px]">
                  <DialogHeader>
                    <DialogTitle className="text-[18px] font-bold">Approve Transaction</DialogTitle>
                    <DialogDescription className="text-[13px]">
                      Send an approval email to the user confirming their transaction.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[13px] font-medium">Email Subject</Label>
                      <Input
                        id="subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Transaction Approved - Amazon Gift Card"
                        className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[13px] font-medium">Email Message</Label>
                      <Textarea
                        id="message"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Dear customer, your transaction has been approved and the payment of ₦150,000 has been credited to your wallet..."
                        className="min-h-[120px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setApproveDialogOpen(false)}
                      className="h-10 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] border-0 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] text-[13px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 border-0 shadow-lg text-[13px]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send & Approve
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Reject Dialog */}
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-11 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-[13px] font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[20px]">
                  <DialogHeader>
                    <DialogTitle className="text-[18px] font-bold">Reject Transaction</DialogTitle>
                    <DialogDescription className="text-[13px]">
                      Send a rejection email to the user explaining why their transaction was declined.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reject-subject" className="text-[13px] font-medium">Email Subject</Label>
                      <Input
                        id="reject-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Transaction Declined - Action Required"
                        className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reject-message" className="text-[13px] font-medium">Email Message</Label>
                      <Textarea
                        id="reject-message"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Dear customer, we regret to inform you that your transaction has been declined due to..."
                        className="min-h-[120px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setRejectDialogOpen(false)}
                      className="h-10 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] border-0 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] text-[13px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReject}
                      className="h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 border-0 shadow-lg text-[13px]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send & Reject
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              {/* Request Info Dialog */}
              <Dialog open={requestInfoDialogOpen} onOpenChange={setRequestInfoDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-10 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Request Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
                      Request more information
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
                      You are about to request more info from the user
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* User + transaction summary */}
                    <DialogUserSummary />

                    {/* Message field */}
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Message to user</Label>
                      <Textarea
                        value={infoMessage}
                        onChange={(e) => setInfoMessage(e.target.value)}
                        placeholder="Describe the information you need from the user..."
                        className="min-h-[100px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[12px] resize-none focus-visible:ring-0 focus:border-orange-300 dark:focus:border-orange-500/30"
                      />
                    </div>

                    {/* Notification toggles */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Push notification</span>
                        <Switch
                          checked={infoPush}
                          onCheckedChange={setInfoPush}
                          className="data-[state=checked]:bg-green-500 scale-90"
                        />
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Email</span>
                        <Switch
                          checked={infoEmail}
                          onCheckedChange={setInfoEmail}
                          className="data-[state=checked]:bg-green-500 scale-90"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleRequestInfo}
                      className="w-full h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/20 text-[13px]"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Hold for Review Dialog */}
              <Dialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="h-10 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Hold for Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
                      Hold for Review
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
                      This transaction will be paused pending further review
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* User + transaction summary */}
                    <DialogUserSummary />

                    {/* Hold reason selector */}
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Reason for hold</Label>
                      <div className="relative">
                        <select
                          value={holdReason}
                          onChange={(e) => setHoldReason(e.target.value)}
                          className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer"
                        >
                          <option value="">Select a reason...</option>
                          <option value="suspicious_activity">Suspicious Activity</option>
                          <option value="verify_identity">Verify Identity</option>
                          <option value="card_validation">Card Validation Required</option>
                          <option value="high_risk">High Risk Score</option>
                          <option value="manual_review">Manual Review Needed</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Internal note */}
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-medium text-gray-700 dark:text-gray-300">
                        Internal note <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        value={holdNote}
                        onChange={(e) => setHoldNote(e.target.value)}
                        placeholder="Add context for other admins reviewing this hold..."
                        className="min-h-[90px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[12px] resize-none focus-visible:ring-0 focus:border-orange-300 dark:focus:border-orange-500/30"
                      />
                    </div>

                    {/* Notify user toggles */}
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">Notify user via</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-600 dark:text-gray-400">Push</span>
                        <Switch
                          checked={holdPush}
                          onCheckedChange={setHoldPush}
                          className="data-[state=checked]:bg-green-500 scale-90"
                        />
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-600 dark:text-gray-400">Email</span>
                        <Switch
                          checked={holdEmail}
                          onCheckedChange={setHoldEmail}
                          className="data-[state=checked]:bg-green-500 scale-90"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setHoldDialogOpen(false)}
                      className="flex-1 h-10 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] border-0 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] text-[13px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleHold}
                      disabled={!holdReason}
                      className="flex-1 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold hover:from-orange-500 hover:to-orange-600 border-0 shadow-lg shadow-orange-500/20 text-[13px] disabled:opacity-50"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Place on Hold
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;