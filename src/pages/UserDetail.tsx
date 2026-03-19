import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, Mail, Phone, Calendar, Smartphone, Clock,
  ChevronDown, AlertTriangle, Ban, Key, Download,
  Check, X, Info, Pause, Send, Shield, MapPin,
  Snowflake, CheckCircle, Flag, FileText,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tier: number;
  is_active: boolean;
  admin_status: string;
  admin_status_reason: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  kyc: any;
  joined_at: string;
  last_active_at: string | null;
  last_login_at: string | null;
  last_login_device: string | null;
  last_login_ip: string | null;
  volume_ngn: number;
}

interface Transaction {
  id: string;
  type: string;
  amount_ngn: number;
  status: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (d: string | null) => {
  if (!d) return "Never";
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const formatVolume = (v: number) =>
  v === 0 ? "₦0" : `₦${v.toLocaleString("en-NG")}`;

// ── Badges ────────────────────────────────────────────────────────────────────

const KycBadge = ({ tier }: { tier: number }) => {
  const config: Record<number, { label: string; className: string }> = {
    0: { label: "Tier 0", className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    1: { label: "Tier 1", className: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    2: { label: "Tier 2", className: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
    3: { label: "Tier 3", className: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  };
  const cfg = config[tier] ?? config[0];
  return (
    <Badge className={`${cfg.className} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {cfg.label}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const config: Record<string, string> = {
    active: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    frozen: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    banned: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    suspended: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    flagged: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
  };
  return (
    <Badge className={`${config[s] ?? config.active} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5 capitalize`}>
      {status}
    </Badge>
  );
};

const TxStatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const config: Record<string, string> = {
    completed: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    success: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    pending: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
    failed: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    cancelled: "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400",
  };
  return (
    <Badge className={`${config[s] ?? config.pending} border-0 rounded-full text-[10px] font-semibold px-2 py-0.5 capitalize`}>
      {status}
    </Badge>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [newNote, setNewNote] = useState("");
  const [actionDialog, setActionDialog] = useState<"freeze" | "ban" | "flag" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "kyc" | "flags">("overview");

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => api.get(`/admin/users/${id}/profile`).then((r) => r.data as UserProfile),
    enabled: !!id,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["user-transactions", id],
    queryFn: () => api.get(`/admin/users/${id}/transactions`).then((r) => r.data),
    enabled: !!id && activeTab === "transactions",
  });

  const { data: flagsData, isLoading: flagsLoading } = useQuery({
    queryKey: ["user-flags", id],
    queryFn: () => api.get(`/admin/users/${id}/flags`).then((r) => r.data),
    enabled: !!id && activeTab === "flags",
  });

  const transactions: Transaction[] = txData?.items ?? [];
  const flags: any[] = flagsData?.items ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────────

  const freezeMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/admin/users/${id}/freeze`, { reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user-profile", id] }); toast.success("Account frozen"); setActionDialog(null); setActionReason(""); },
    onError: () => toast.error("Failed to freeze account"),
  });

  const banMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/admin/users/${id}/ban`, { reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user-profile", id] }); toast.success("User banned"); setActionDialog(null); setActionReason(""); },
    onError: () => toast.error("Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${id}/unban`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user-profile", id] }); toast.success("User unbanned"); },
    onError: () => toast.error("Failed to unban user"),
  });

  const flagMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/admin/users/${id}/flag`, { reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user-profile", id] }); toast.success("User flagged"); setActionDialog(null); setActionReason(""); },
    onError: () => toast.error("Failed to flag user"),
  });

  const unflagMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${id}/unflag`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user-profile", id] }); toast.success("User unflagged"); },
    onError: () => toast.error("Failed to unflag user"),
  });

  const isActionPending = freezeMutation.isPending || banMutation.isPending || flagMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 rounded-[20px]" />
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-48 rounded-[20px]" />
            <Skeleton className="h-48 rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-[14px] font-semibold text-gray-900 dark:text-white">User not found</p>
      <button onClick={() => navigate("/users")} className="text-[13px] text-orange-500 hover:underline">← Back to users</button>
    </div>
  );

  const displayStatus = profile.is_flagged ? "Flagged" : profile.admin_status ?? (profile.is_active ? "Active" : "Inactive");
  const initials = profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "kyc", label: "KYC" },
    { id: "flags", label: "Flag History" },
  ] as const;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/users")}
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{profile.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[13px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
              Actions <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2">
            <DropdownMenuItem
              onClick={() => profile.is_flagged ? unflagMutation.mutate() : setActionDialog("flag")}
              className="rounded-[10px] text-[13px] cursor-pointer"
            >
              <Flag className="w-4 h-4 mr-2" />
              {profile.is_flagged ? "Unflag User" : "Flag User"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setActionDialog("freeze")}
              disabled={profile.admin_status?.toLowerCase() === "frozen"}
              className="rounded-[10px] text-[13px] cursor-pointer text-orange-600 dark:text-orange-400"
            >
              <Snowflake className="w-4 h-4 mr-2" />
              Freeze Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
            {profile.admin_status?.toLowerCase() === "banned" ? (
              <DropdownMenuItem
                onClick={() => unbanMutation.mutate()}
                className="rounded-[10px] text-[13px] cursor-pointer text-green-600 dark:text-green-400"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Unban User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setActionDialog("ban")}
                className="rounded-[10px] text-[13px] cursor-pointer text-red-600 dark:text-red-400"
              >
                <Ban className="w-4 h-4 mr-2" /> Ban User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Hero */}
      <div className="bg-gradient-to-r from-orange-50 via-orange-50/40 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent backdrop-blur-xl rounded-[20px] border border-orange-200/50 dark:border-orange-500/20 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">{profile.full_name}</h2>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <KycBadge tier={profile.tier} />
              <StatusBadge status={displayStatus} />
              {profile.admin_status_reason && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                  Reason: {profile.admin_status_reason}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="px-4 py-2.5 bg-white/60 dark:bg-[#2D2B2B]/60 rounded-[12px]">
              <p className="text-[18px] font-bold text-gray-900 dark:text-white">{formatVolume(profile.volume_ngn)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Volume</p>
            </div>
            <div className="px-4 py-2.5 bg-white/60 dark:bg-[#2D2B2B]/60 rounded-[12px]">
              <p className="text-[18px] font-bold text-gray-900 dark:text-white">Tier {profile.tier}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">KYC Level</p>
            </div>
            <div className="px-4 py-2.5 bg-white/60 dark:bg-[#2D2B2B]/60 rounded-[12px]">
              <p className="text-[18px] font-bold text-gray-900 dark:text-white">{profile.is_flagged ? "Yes" : "No"}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/30 p-1.5 w-fit shadow-sm">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "rounded-full px-5 py-2 text-[12px] font-medium transition-all",
              activeTab === id
                ? "bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Sidebar — always visible */}
        <div className="space-y-3">
          {/* Info Card */}
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
  <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Account Details</h3>
  <div className="grid grid-cols-2 gap-2">
    {[
      { icon: Mail, label: "Email", value: profile.email },
      { icon: Phone, label: "Phone", value: profile.phone ?? "—" },
      { icon: Calendar, label: "Joined", value: formatDate(profile.joined_at) },
      { icon: Clock, label: "Last Active", value: formatTime(profile.last_active_at) },
      { icon: Clock, label: "Last Login", value: formatTime(profile.last_login_at) },
      { icon: Smartphone, label: "Device", value: profile.last_login_device ?? "—" },
      { icon: MapPin, label: "Last IP", value: profile.last_login_ip ?? "—" },
    ].map(({ icon: Icon, label, value }) => (
      <div key={label} className="flex items-start gap-2 px-2.5 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
        <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
          <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{value}</p>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* Flag Info */}
          {profile.is_flagged && profile.flag_reason && (
            <div className="bg-orange-50/80 dark:bg-orange-500/10 backdrop-blur-xl rounded-[16px] p-4 border border-orange-200/50 dark:border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-[12px] font-bold text-orange-700 dark:text-orange-400">Flagged</h3>
              </div>
              <p className="text-[12px] text-orange-600 dark:text-orange-400">{profile.flag_reason}</p>
            </div>
          )}

          {/* Ban Info */}
          {profile.admin_status?.toLowerCase() === "banned" && profile.admin_status_reason && (
            <div className="bg-red-50/80 dark:bg-red-500/10 backdrop-blur-xl rounded-[16px] p-4 border border-red-200/50 dark:border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-[12px] font-bold text-red-700 dark:text-red-400">Banned</h3>
              </div>
              <p className="text-[12px] text-red-600 dark:text-red-400">{profile.admin_status_reason}</p>
            </div>
          )}
        </div>

        {/* Right — tab-specific content */}
        <div className="lg:col-span-2 space-y-3">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Volume", value: formatVolume(profile.volume_ngn), color: "orange" },
                  { label: "Account Status", value: displayStatus, color: profile.is_active ? "green" : "red" },
                  { label: "KYC Tier", value: `Tier ${profile.tier}`, color: "blue" },
                  { label: "Flagged", value: profile.is_flagged ? "Yes" : "No", color: profile.is_flagged ? "orange" : "green" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-[16px] font-bold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* KYC Summary */}
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">KYC Information</h3>
                </div>
                {profile.kyc ? (
                  <pre className="text-[11px] text-gray-600 dark:text-gray-400 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] p-3 overflow-x-auto">
                    {JSON.stringify(profile.kyc, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Shield className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">No KYC submitted</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">This user hasn't submitted KYC documents yet</p>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Admin Notes</h3>
                <Textarea
                  placeholder="Add an internal note about this user..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[12px] min-h-[80px] resize-none mb-3"
                />
                <button
                  disabled={!newNote.trim()}
                  className="w-full py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20 flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Transaction History</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{txData?.total ?? 0} total transactions</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
                    <tr>
                      {["ID", "Type", "Amount", "Status", "Date"].map((h) => (
                        <th key={h} className="p-3 text-left text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                          {[...Array(5)].map((_, j) => (
                            <td key={j} className="p-3"><Skeleton className="h-3.5 w-20" /></td>
                          ))}
                        </tr>
                      ))
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[12px] text-gray-400">No transactions yet</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                          <td className="p-3 text-[11px] font-mono text-gray-500 dark:text-gray-400">{tx.id.slice(0, 8)}</td>
                          <td className="p-3 text-[12px] text-gray-700 dark:text-gray-300">{tx.type ?? "—"}</td>
                          <td className="p-3 text-[12px] font-semibold text-gray-900 dark:text-white">
                            ₦{(tx.amount_ngn ?? 0).toLocaleString("en-NG")}
                          </td>
                          <td className="p-3"><TxStatusBadge status={tx.status} /></td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === "kyc" && (
            <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-gray-500" />
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">KYC Details</h3>
                <KycBadge tier={profile.tier} />
              </div>
              {profile.kyc ? (
                <div className="space-y-2">
                  {Object.entries(profile.kyc).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-4 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-[12px] font-medium text-gray-900 dark:text-white text-right">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">No KYC data</p>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 text-center">
                    This user is on Tier {profile.tier} and hasn't submitted KYC documents.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Flag History Tab */}
          {activeTab === "flags" && (
            <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Flag History</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{flags.length} flag record{flags.length !== 1 ? "s" : ""}</p>
              </div>
              {flagsLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[10px]" />)}
                </div>
              ) : flags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">No flag history</p>
                  <p className="text-[11px] text-gray-400">This user has never been flagged</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
                  {flags.map((flag: any, i: number) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Flag className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{flag.reason ?? "No reason provided"}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              By {flag.flagged_by ?? "Admin"} • {flag.created_at ? formatTime(flag.created_at) : "—"}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-[10px] px-2 py-0.5 rounded-full border-0 flex-shrink-0 ${flag.resolved ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"}`}>
                          {flag.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionReason(""); }}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {actionDialog === "flag" && "Flag User"}
              {actionDialog === "freeze" && "Freeze Account"}
              {actionDialog === "ban" && "Ban User"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              {actionDialog === "flag" && <>Flagging <span className="font-semibold text-gray-900 dark:text-white">{profile.full_name}</span> for review.</>}
              {actionDialog === "freeze" && <>Temporarily freeze <span className="font-semibold text-gray-900 dark:text-white">{profile.full_name}</span>'s account.</>}
              {actionDialog === "ban" && <>Permanently ban <span className="font-semibold text-gray-900 dark:text-white">{profile.full_name}</span>. They will lose all access.</>}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={
                actionDialog === "flag" ? "e.g. Suspicious activity..." :
                actionDialog === "freeze" ? "e.g. Under investigation..." :
                "e.g. Repeated policy violations..."
              }
              rows={3}
              className="w-full px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 rounded-[10px] text-[12px] text-gray-900 dark:text-white placeholder:text-gray-400 outline-none resize-none transition-all"
            />
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setActionDialog(null); setActionReason(""); }}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!actionReason.trim()) return;
                if (actionDialog === "flag") flagMutation.mutate(actionReason.trim());
                else if (actionDialog === "freeze") freezeMutation.mutate(actionReason.trim());
                else if (actionDialog === "ban") banMutation.mutate(actionReason.trim());
              }}
              disabled={isActionPending || !actionReason.trim()}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] font-semibold transition-all shadow-md disabled:opacity-60",
                actionDialog === "ban"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20"
                  : "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-orange-500/20"
              )}
            >
              {isActionPending ? "Processing…"
                : actionDialog === "flag" ? "Flag User"
                : actionDialog === "freeze" ? "Freeze Account"
                : "Ban User"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;