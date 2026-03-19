import { useState } from "react";
import {
  Eye, MoreHorizontal, Flag, Search, Download,
  ChevronLeft, ChevronRight, Snowflake, Ban, CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tier: number;
  status: string;
  kyc: string;
  joined_at: string;
  last_active_at: string | null;
  volume_ngn: number;
  is_flagged: boolean;
}

const KycBadge = ({ tier }: { tier: number }) => {
  const config: Record<number, { label: string; className: string }> = {
    0: { label: "Tier 0", className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
    1: { label: "Tier 1", className: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    2: { label: "Tier 2", className: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
    3: { label: "Tier 3", className: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  };
  const cfg = config[tier] ?? config[0];
  return (
    <Badge className={`${cfg.className} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {cfg.label}
    </Badge>
  );
};

const StatusBadge = ({ status, isFlagged }: { status: string; isFlagged: boolean }) => {
  if (isFlagged) return (
    <Badge className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5">
      Flagged
    </Badge>
  );
  const s = status.toLowerCase();
  const config: Record<string, string> = {
    active: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
    frozen: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    suspended: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    banned: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    inactive: "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400",
  };
  return (
    <Badge className={`${config[s] ?? config.inactive} border-0 rounded-full text-[11px] font-semibold px-2.5 py-0.5`}>
      {status}
    </Badge>
  );
};

const formatVolume = (v: number) =>
  v === 0 ? "₦0" : `₦${v.toLocaleString("en-NG")}`;

const formatDate = (d: string | null) => {
  if (!d) return "—";
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

const formatJoinDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export const UserTable = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    type: "flag" | "freeze" | "ban";
    userId: string;
    name: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, kycFilter, activeTab],
    queryFn: () => {
      const endpoint = activeTab === "kyc" ? "/admin/users/pending-kyc" : "/admin/users";
      return api.get(endpoint, {
        params: {
          page,
          limit,
          search: search || undefined,
          tier: activeTab !== "kyc" && kycFilter !== "all" ? kycFilter : undefined,
          is_flagged: activeTab === "flagged" ? true : undefined,
        },
      }).then((r) => r.data);
    },
  });

  const users: User[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  // ── Mutations ────────────────────────────────────────────────────────────────

  const flagMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/users/${id}/flag`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User flagged");
      setActionDialog(null);
      setActionReason("");
    },
    onError: () => toast.error("Failed to flag user"),
  });

  const unflagMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/unflag`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unflagged");
    },
    onError: () => toast.error("Failed to unflag user"),
  });

  const freezeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/users/${id}/freeze`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User account frozen");
      setActionDialog(null);
      setActionReason("");
    },
    onError: () => toast.error("Failed to freeze user"),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/users/${id}/ban`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User banned");
      setActionDialog(null);
      setActionReason("");
    },
    onError: () => toast.error("Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/unban`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unbanned");
    },
    onError: () => toast.error("Failed to unban user"),
  });

  const isActionPending =
    flagMutation.isPending || freezeMutation.isPending || banMutation.isPending;

  // ── Export ───────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (users.length === 0) return;
    const headers = ["Name", "Email", "Phone", "KYC Tier", "Status", "Flagged", "Joined", "Last Active", "Volume (NGN)"];
    const rows = users.map((u) => [
      u.full_name,
      u.email,
      u.phone ?? "",
      `Tier ${u.tier}`,
      u.status,
      u.is_flagged ? "Yes" : "No",
      formatJoinDate(u.joined_at),
      formatDate(u.last_active_at),
      u.volume_ngn,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="w-full flex justify-start">
        <div className="bg-white dark:bg-[#1C1C1C] border border-gray-100 dark:border-white/5 h-14 p-1.5 rounded-full shadow-sm flex items-center gap-2">
          {[
            { value: "all", label: "All Users" },
            { value: "kyc", label: "Pending KYC" },
            { value: "flagged", label: "Flagged Users" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setPage(1); }}
              className={cn(
                "rounded-full px-6 py-2.5 text-[13px] font-medium transition-all",
                activeTab === tab.value
                  ? "bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
          <Input
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-11 pr-4 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600/50 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all duration-300 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={kycFilter} onValueChange={(v) => { setKycFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 text-[13px] shadow-sm">
              <SelectValue placeholder="KYC Tier" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px]">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="0">Tier 0</SelectItem>
              <SelectItem value="1">Tier 1</SelectItem>
              <SelectItem value="2">Tier 2</SelectItem>
              <SelectItem value="3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={users.length === 0}
            className="h-11 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] gap-2 shadow-sm text-[13px] font-medium disabled:opacity-40"
          >
            <Download className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
              <tr>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">KYC</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                <th className="text-right p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Volume</th>
                <th className="text-right p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="p-4 hidden md:table-cell">
                        <Skeleton className="h-3.5 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[13px] text-gray-400 dark:text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 cursor-pointer transition-all duration-200 border-t border-gray-200/30 dark:border-gray-700/30"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-[14px] font-semibold">
                            {(user.full_name?.[0] ?? "?").toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-[13px]">{user.full_name}</p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-[13px] text-gray-600 dark:text-gray-400">{user.phone ?? "—"}</span>
                    </td>
                    <td className="p-4"><KycBadge tier={user.tier} /></td>
                    <td className="p-4"><StatusBadge status={user.status} isFlagged={user.is_flagged} /></td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-[13px] text-gray-600 dark:text-gray-400">{formatJoinDate(user.joined_at)}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-[13px] text-gray-600 dark:text-gray-400">{formatDate(user.last_active_at)}</span>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{formatVolume(user.volume_ngn)}</span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus-visible:ring-0 focus-visible:ring-offset-0">
                            <MoreHorizontal className="w-[18px] h-[18px]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2">
                          <DropdownMenuLabel className="text-[12px] font-semibold">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />

                          {/* View */}
                          <DropdownMenuItem
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="rounded-[10px] text-[13px] cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>

                          {/* Flag / Unflag */}
                          <DropdownMenuItem
                            onClick={() =>
                              user.is_flagged
                                ? unflagMutation.mutate(user.id)
                                : setActionDialog({ type: "flag", userId: user.id, name: user.full_name })
                            }
                            className="rounded-[10px] text-[13px] cursor-pointer"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            {user.is_flagged ? "Unflag User" : "Flag User"}
                          </DropdownMenuItem>

                          {/* Freeze */}
                          <DropdownMenuItem
                            onClick={() =>
                              setActionDialog({ type: "freeze", userId: user.id, name: user.full_name })
                            }
                            disabled={user.status.toLowerCase() === "frozen"}
                            className="rounded-[10px] text-[13px] cursor-pointer"
                          >
                            <Snowflake className="w-4 h-4 mr-2" />
                            {user.status.toLowerCase() === "frozen" ? "Already Frozen" : "Freeze Account"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />

                          {/* Ban / Unban */}
                          {user.status.toLowerCase() === "banned" ? (
                            <DropdownMenuItem
                              onClick={() => unbanMutation.mutate(user.id)}
                              className="text-green-600 dark:text-green-400 rounded-[10px] text-[13px] cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setActionDialog({ type: "ban", userId: user.id, name: user.full_name })
                              }
                              className="text-red-600 dark:text-red-400 rounded-[10px] text-[13px] cursor-pointer"
                            >
                              <Ban className="w-4 h-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-[#F5F5F5]/30 dark:bg-[#2D2B2B]/30 flex items-center justify-between border-t border-gray-200/30 dark:border-gray-700/30">
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span> users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 text-[13px] font-medium disabled:opacity-40">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={users.length < limit} onClick={() => setPage((p) => p + 1)} className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium disabled:opacity-40">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Action Dialog — Flag / Freeze / Ban */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionReason(""); }}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {actionDialog?.type === "flag" && "Flag User"}
              {actionDialog?.type === "freeze" && "Freeze Account"}
              {actionDialog?.type === "ban" && "Ban User"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              {actionDialog?.type === "flag" && (
                <>Flagging <span className="font-semibold text-gray-900 dark:text-white">{actionDialog.name}</span> for review.</>
              )}
              {actionDialog?.type === "freeze" && (
                <>This will temporarily freeze <span className="font-semibold text-gray-900 dark:text-white">{actionDialog?.name}</span>'s account.</>
              )}
              {actionDialog?.type === "ban" && (
                <>This will permanently ban <span className="font-semibold text-gray-900 dark:text-white">{actionDialog?.name}</span>. They will lose all access.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={
                actionDialog?.type === "flag" ? "e.g. Suspicious activity, multiple failed transactions..." :
                actionDialog?.type === "freeze" ? "e.g. Under investigation, pending review..." :
                "e.g. Repeated policy violations, fraudulent activity..."
              }
              rows={3}
              className="w-full px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 rounded-[10px] text-[12px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none transition-all"
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
                if (!actionDialog || !actionReason.trim()) return;
                const { type, userId } = actionDialog;
                const payload = { id: userId, reason: actionReason.trim() };
                if (type === "flag") flagMutation.mutate(payload);
                else if (type === "freeze") freezeMutation.mutate(payload);
                else if (type === "ban") banMutation.mutate(payload);
              }}
              disabled={isActionPending || !actionReason.trim()}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] font-semibold transition-all shadow-md disabled:opacity-60",
                actionDialog?.type === "ban"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/20"
                  : "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 shadow-orange-500/20"
              )}
            >
              {isActionPending
                ? "Processing…"
                : actionDialog?.type === "flag" ? "Flag User"
                : actionDialog?.type === "freeze" ? "Freeze Account"
                : "Ban User"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s ease; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156, 163, 175, 0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; transition: background 0.3s ease; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
        .dark .custom-scrollbar:hover { scrollbar-color: rgba(75, 85, 99, 0.4) transparent; }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.4); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 0.6); }
      `}</style>
    </div>
  );
};