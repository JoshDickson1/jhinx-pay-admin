import { useState } from "react";
import {
  Shield, UserCog, Lock, MoreHorizontal, Search, Plus,
  Clock, Calendar, ChevronLeft, ChevronRight, Eye, ArrowLeft,
  Mail, Phone, MapPin, Monitor, Activity, AlertTriangle, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";
import { getAvatarUrl } from "@/lib/utils";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;        // ← doesn't exist on app users, will be undefined
  is_active: boolean;  // ← doesn't exist, status is "Active"/"Banned" string
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  // App user fields
  status?: string;
  joined_at?: string;
  last_active_at?: string | null;
  tier?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const roleLabel = (role?: string) => {
  if (!role) return "Admin";
  const map: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
  };
  return map[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
};

const roleColor = (role?: string) => {
  const map: Record<string, string> = {
    superadmin: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20",
    admin: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
    staff: "bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/40",
  };
  return map[role ?? ""] ?? map.staff;
};

const statusColor = (isActive: boolean) =>
  isActive
    ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200/60 dark:border-green-500/20"
    : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-500/20";

const Avatar = ({ admin, size = "md" }: { admin: AdminUser; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const text = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xl" : "text-[13px]";
  const initials = admin.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const url = getAvatarUrl(admin.avatar_url);
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm`}>
      {url
        ? <img src={url} alt={admin.full_name} className="w-full h-full object-cover" />
        : <span className={`text-white font-semibold ${text}`}>{initials}</span>
      }
    </div>
  );
};

// ── Admin Detail View ─────────────────────────────────────────────────────────

const AdminDetail = ({ admin, onBack }: { admin: AdminUser; onBack: () => void }) => {
  const AdminActivityLog = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => api.get("/admin/admin-logs").then((r) => r.data),
  });

  const logs = data?.items ?? [];

  const actionColor = (action: string) => {
    if (action.includes("flag")) return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400";
    if (action.includes("create")) return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400";
    if (action.includes("login")) return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (action.includes("status")) return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (action.includes("unflag")) return "bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400";
    return "bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400";
  };

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      "admin.users.create": "Created Admin",
      "admin.login.token": "Login",
      "admin.platform_users.flag": "Flagged User",
      "admin.platform_users.unflag": "Unflagged User",
      "admin.platform_users.update_status": "Updated Status",
      "admin.users.update": "Updated Admin",
      "admin.users.disable": "Disabled Admin",
    };
    return map[action] ?? action.split(".").pop()?.replace(/_/g, " ") ?? action;
  };

  const formatLogTime = (d: string) =>
    new Date(d).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Admin Logs</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Recent admin activity across the platform</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
            <tr>
              {["Timestamp", "Action", "Resource", "Details"].map((h) => (
                <th key={h} className="p-3 text-left text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="p-3"><Skeleton className="h-3.5 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[12px] text-gray-400">No activity logs yet</td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                  <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatLogTime(log.created_at)}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-gray-600 dark:text-gray-400">
                    {log.resource_type ?? "—"}
                  </td>
                  <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details).replace(/[{}"]/g, "").replace(/:/g, ": ") : log.message ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "activity">("general");
  const [selectedRole, setSelectedRole] = useState(admin.role);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false });
  const [passwords, setPasswords] = useState({ current: "", newPass: "" });

  const updateRoleMutation = useMutation({
    mutationFn: (role: string) => api.patch(`/admin/users/${admin.id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated"); },
    onError: () => toast.error("Failed to update role"),
  });

  const updateStatusMutation = useMutation({
  mutationFn: (is_active: boolean) =>
    api.patch(`/admin/users/${admin.id}/status`, { is_active }),
  onSuccess: (_, is_active) => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    toast.success(`Admin ${is_active ? "activated" : "suspended"} successfully`);
    setShowSuspendDialog(false);
    setShowRemoveDialog(false);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.detail ?? "Failed to update status";
    toast.error(typeof msg === "string" ? msg : "Action failed — this may be an app user, not an admin account");
    setShowSuspendDialog(false);
    setShowRemoveDialog(false);
  },
});

  const tabs = [
    { id: "general", label: "General", icon: UserCog },
    { id: "security", label: "Security", icon: Shield },
    { id: "activity", label: "Activity Log", icon: Activity },
  ] as const;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex md:flex-row flex-col gap-10 md:gap-4 md:items-start">
        {/* Sidebar tabs — sticky on desktop */}
        <div className="hidden lg:block w-48 flex-shrink-0 sticky top-20">
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200",
                  activeTab === id
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden w-full">
          <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-1.5 flex gap-1">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex-1 py-2 rounded-full text-[12px] font-medium transition-all",
                  activeTab === id
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Profile Hero */}
          <div className="bg-gradient-to-r from-orange-50 via-orange-50/50 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent backdrop-blur-xl rounded-[16px] border border-orange-200/50 dark:border-orange-500/20 p-5">
            <div className="flex items-center gap-4">
              <Avatar admin={admin} size="lg" />
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">{admin.full_name}</h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">{admin.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleColor(admin.role)}`}>
                    {roleLabel(admin.role)}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor(admin.is_active)}`}>
                    {admin.is_active ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-3">
              {/* Role */}
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Admin Role</h3>
                <div className="relative mb-3">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 rounded-[10px] text-[13px] font-medium text-gray-800 dark:text-gray-200 cursor-pointer transition-all focus:outline-none"
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                  <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-[-90deg]" />
                </div>
                <button
                  onClick={() => updateRoleMutation.mutate(selectedRole)}
                  disabled={updateRoleMutation.isPending || selectedRole === admin.role}
                  className="px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
                >
                  {updateRoleMutation.isPending ? "Saving…" : "Save Changes"}
                </button>
                  <p className="text-[11px] text-orange-500/80 dark:text-orange-400/70 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    Role & status changes require a dedicated admin endpoint from the backend.
                  </p>
              </div>

              {/* Details */}
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Admin Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Mail, label: admin.email },
                    { icon: Clock, label: `Last Login ${formatTime(admin.last_login_at)}` },
                    { icon: Phone, label: admin.phone ?? "Not set" },
                    { icon: Calendar, label: `Added: ${formatDate(admin.created_at)}` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[12px] text-gray-700 dark:text-gray-300 truncate">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-3">
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Admin Login Password</h3>
                <div className="space-y-3 mb-4">
                  {[
                    { label: "Current Password", key: "current" },
                    { label: "New Password", key: "newPass" },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword[key as keyof typeof showPassword] ? "text" : "password"}
                          value={passwords[key as keyof typeof passwords]}
                          onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                          className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
                  Reset Password
                </button>

                <div className="mt-4 flex items-center justify-between px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200">2FA Verification</span>
                  </div>
                  <Switch className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Actions</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowSuspendDialog(true)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200/60 dark:border-orange-500/20 transition-all"
                  >
                    {admin.is_active ? "Suspend Account" : "Activate Account"}
                  </button>
                  <button
                    onClick={() => setShowRemoveDialog(true)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
                  >
                    Remove Access
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
  <AdminActivityLog />
)}
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {admin.is_active ? "Suspend Account?" : "Activate Account?"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              {admin.is_active
                ? `This will revoke ${admin.full_name}'s access to the admin panel.`
                : `This will restore ${admin.full_name}'s access to the admin panel.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowSuspendDialog(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">
              Cancel
            </button>
            <button
              onClick={() => updateStatusMutation.mutate(!admin.is_active)}
              disabled={updateStatusMutation.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {updateStatusMutation.isPending ? "Updating…" : admin.is_active ? "Suspend" : "Activate"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Remove admin permanently?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <div className="flex items-center gap-3 p-3 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] mb-3">
              <Avatar admin={admin} size="md" />
              <div>
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{admin.full_name}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{admin.email}</p>
                <div className="flex gap-1.5 mt-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColor(admin.role)}`}>{roleLabel(admin.role)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor(admin.is_active)}`}>{admin.is_active ? "Active" : "Suspended"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-orange-600 dark:text-orange-400 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              This action cannot be undone.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowRemoveDialog(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200/60 dark:border-orange-500/20 transition-all">
              Cancel
            </button>
            <button
              onClick={() => updateStatusMutation.mutate(false)}
              disabled={updateStatusMutation.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {updateStatusMutation.isPending ? "Removing…" : "Remove Access"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminProfiles = () => {
  const { data: sessionsData } = useQuery({
  queryKey: ["admin-sessions"],
  queryFn: () => api.get("/admin/security/sessions").then((r) => r.data),
});
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ full_name: "", email: "", password: "", role: "staff" });
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, statusFilter, roleFilter],
    queryFn: () =>
  api.get("/admin/users", {
    params: { page, limit, search: search || undefined },
  }).then((r) => {
    const raw = r.data;
    return {
      ...raw,
      items: (raw.items ?? []).map((u: any) => ({
        ...u,
        // Normalize app user fields to AdminUser shape
        role: u.role ?? "staff",
        is_active: u.status ? u.status.toLowerCase() === "active" : true,
        avatar_url: u.avatar_url ?? null,
        last_login_at: u.last_active_at ?? null,
        created_at: u.joined_at ?? new Date().toISOString(),
        updated_at: u.updated_at ?? new Date().toISOString(),
      })),
    };
  }),
  });

  const admins: AdminUser[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((a) => a.is_active).length;
  const suspendedAdmins = admins.filter((a) => !a.is_active).length;

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/users", newAdmin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin created successfully");
      setShowAddDialog(false);
      setNewAdmin({ full_name: "", email: "", password: "", role: "staff" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to create admin";
      toast.error(typeof msg === "string" ? msg : "Failed to create admin");
    },
  });

  if (selectedAdmin) {
    return <AdminDetail admin={selectedAdmin} onBack={() => setSelectedAdmin(null)} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Profiles</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Manage admin accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[13px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Admins", value: isLoading ? "—" : total, desc: "Active admin with system access", icon: Shield, color: "orange" },
          { label: "Active Admins", value: isLoading ? "—" : activeAdmins, desc: "Active administrators", icon: UserCog, color: "green" },
          { label: "Suspended Admins", value: isLoading ? "—" : suspendedAdmins, desc: "Administrators with no system access", icon: Lock, color: "red" },
          { label: "Active Sessions", value: isLoading ? "—" : sessionsData?.items?.length ?? 0, desc: "Currently logged-in admins", icon: Activity, color: "blue" },
        ].map(({ label, value, desc, icon: Icon, color }) => (
          <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${color}-100 dark:bg-${color}-500/20 flex-shrink-0`}>
                <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
          <Input
            placeholder="Search admin...."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-11 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[13px] shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: statusFilter, setter: setStatusFilter, options: [["all", "All Status"], ["active", "Active"], ["suspended", "Suspended"]] },
            { value: roleFilter, setter: setRoleFilter, options: [["all", "Roles"], ["superadmin", "Super Admin"], ["admin", "Admin"], ["staff", "Staff"]] },
          ].map(({ value, setter, options }) => (
            <div key={value} className="relative">
              <select
                value={value}
                onChange={(e) => { setter(e.target.value); setPage(1); }}
                className="appearance-none pl-4 pr-8 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/30 rounded-full text-[13px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all focus:outline-none shadow-sm"
              >
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-[-90deg]" />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
              <tr>
                {["Admin", "Description", "Role", "Status", "Last Active", "Created", "Action"].map((h) => (
                  <th key={h} className={`p-4 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${h === "Action" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                    </td>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="p-4"><Skeleton className="h-3.5 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[13px] text-gray-400">No admins found</td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAdmin(admin)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar admin={admin} size="md" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{admin.full_name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[12px] text-gray-500 dark:text-gray-400">
                        {admin.role === "superadmin" ? "Full system control" : admin.role === "admin" ? "Limited admin access" : "Read & support access"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleColor(admin.role)}`}>
                          {roleLabel(admin.role)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {admin.role === "superadmin" ? "Full Access" : admin.role === "admin" ? "Limited" : "Restricted"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor(admin.is_active)}`}>
                        {admin.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(admin.last_login_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(admin.created_at)}
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus-visible:ring-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/30 rounded-[16px] p-2">
                          <DropdownMenuLabel className="text-[12px] font-semibold">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
                          <DropdownMenuItem onClick={() => setSelectedAdmin(admin)} className="rounded-[10px] text-[13px] cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedAdmin(admin)} className="rounded-[10px] text-[13px] cursor-pointer">
                            <UserCog className="w-4 h-4 mr-2" /> Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
                          <DropdownMenuItem
                            onClick={() => setSelectedAdmin(admin)}
                            className="text-red-600 dark:text-red-400 rounded-[10px] text-[13px] cursor-pointer"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            {admin.is_active ? "Suspend Admin" : "Activate Admin"}
                          </DropdownMenuItem>
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
            Showing <span className="font-semibold text-gray-900 dark:text-white">{admins.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{total}</span> admins
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 text-[13px] font-medium disabled:opacity-40">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={admins.length < limit} onClick={() => setPage((p) => p + 1)} className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#1C1C1C]/90 border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-[13px] font-medium disabled:opacity-40">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Add New Admin</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Create a new admin account with role-based access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Full Name", key: "full_name", type: "text", placeholder: "e.g. John Doe" },
              { label: "Email", key: "email", type: "email", placeholder: "admin@jhinxpay.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Min. 12 characters" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                <Input
                  type={type}
                  placeholder={placeholder}
                  value={newAdmin[key as keyof typeof newAdmin]}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]"
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Role</Label>
              <div className="relative">
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, role: e.target.value }))}
                  className="w-full appearance-none pl-3 pr-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 rounded-[10px] text-[12px] font-medium text-gray-800 dark:text-gray-200 cursor-pointer focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-[-90deg]" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowAddDialog(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">
              Cancel
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newAdmin.full_name || !newAdmin.email || newAdmin.password.length < 12}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating…" : "Add Admin"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfiles;