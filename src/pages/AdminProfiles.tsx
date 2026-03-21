import { useEffect, useState } from "react";
import {
  Shield, UserCog, Lock, MoreHorizontal, Search, Plus,
  Clock, Calendar, ChevronLeft, ChevronRight, Eye, ArrowLeft,
  Mail, Activity, AlertTriangle, CheckCircle,
} from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_active: string | null;
  created_at: string;
}

interface AdminStats {
  total_admins: number;
  active_admins: number;
  suspended_admins: number;
  active_sessions: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  admin_name: string;
  admin_email: string;
  role: string;
  action: string;
  target: string;
  details: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const roleLabel = (role?: string) => {
  const map: Record<string, string> = {
    superadmin: "Super Admin", admin: "Admin", staff: "Staff",
  };
  return map[role ?? ""] ?? (role ? role.charAt(0).toUpperCase() + role.slice(1) : "Admin");
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

const actionColor = (action: string) => {
  if (action.includes("suspend") || action.includes("flag"))
    return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400";
  if (action.includes("create") || action.includes("resume"))
    return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400";
  if (action.includes("login"))
    return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
  if (action.includes("delete") || action.includes("remove"))
    return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400";
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
    "admin.features.resume": "Resumed Feature",
    "admin.features.suspend": "Suspended Feature",
    "admin.platform_notifications.create": "Created Notification",
    "admin.platform_notifications.dispatch": "Dispatched Notification",
    "support.ticket.close": "Closed Ticket",
    "support.ticket.resolve": "Resolved Ticket",
    "support.ticket.reply": "Replied to Ticket",
    "support.ticket.assign": "Assigned Ticket",
  };
  return map[action] ?? action.split(".").pop()?.replace(/_/g, " ") ?? action;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ admin, size = "md" }: { admin: AdminUser; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const text = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xl" : "text-[13px]";
  const initials = (admin.full_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm`}>
      <span className={`text-white font-semibold ${text}`}>{initials}</span>
    </div>
  );
};

// ─── Admin Detail ─────────────────────────────────────────────────────────────

const AdminDetail = ({ adminId, onBack }: { adminId: string; onBack: () => void }) => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "activity">("general");
  const [selectedRole, setSelectedRole] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "" });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false });
  const [changingPassword, setChangingPassword] = useState(false);

  // ── Fetch single admin profile ────────────────────────────────────────────
  const { data: admin, isLoading } = useQuery({
  queryKey: ["admin-profile", adminId],
  queryFn: () => api.get(`/admin/profiles/${adminId}`).then((r) => r.data as AdminUser),
});

// Sync selectedRole when admin loads
useEffect(() => {
  if (admin?.role && !selectedRole) {
    setSelectedRole(admin.role);
  }
}, [admin?.role]);

  // ── Audit logs for this admin ─────────────────────────────────────────────
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => api.get("/admin/profiles/audit-logs/all").then((r) => r.data),
    enabled: activeTab === "activity",
  });
  const auditLogs: AuditLog[] = auditData?.items ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateRoleMutation = useMutation({
    mutationFn: (role: string) => api.patch(`/admin/profiles/${adminId}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profile", adminId] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const suspendMutation = useMutation({
    mutationFn: () => api.post(`/admin/profiles/${adminId}/suspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profile", adminId] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`${admin?.full_name} has been suspended`);
      setShowSuspendDialog(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to suspend admin");
      setShowSuspendDialog(false);
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => api.post(`/admin/profiles/${adminId}/resume`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profile", adminId] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`${admin?.full_name} has been reactivated`);
      setShowSuspendDialog(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to resume admin");
      setShowSuspendDialog(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => api.delete(`/admin/profiles/${adminId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`Admin permanently removed`);
      setShowRemoveDialog(false);
      onBack();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to remove admin");
      setShowRemoveDialog(false);
    },
  });

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass) return toast.error("Fill in both fields");
    if (passwords.newPass.length < 12) return toast.error("Password must be at least 12 characters");
    setChangingPassword(true);
    try {
      await api.post("/admin/security/change-password", {
        current_password: passwords.current,
        new_password: passwords.newPass,
      });
      toast.success("Password changed");
      setPasswords({ current: "", newPass: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: UserCog },
    { id: "security", label: "Security", icon: Shield },
    { id: "activity", label: "Activity Log", icon: Activity },
  ] as const;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-16 rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-64 w-48 rounded-[16px] hidden lg:block" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-28 rounded-[16px]" />
            <Skeleton className="h-40 rounded-[16px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!admin) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Admin not found</p>
      <button onClick={onBack} className="text-[13px] text-orange-500 hover:underline">← Back</button>
    </div>
  );

  const isSuspendPending = suspendMutation.isPending || resumeMutation.isPending;

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex md:flex-row flex-col gap-4 md:items-start">
        {/* Sidebar tabs */}
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
              <button key={id} onClick={() => setActiveTab(id)}
                className={cn("flex-1 py-2 rounded-full text-[12px] font-medium transition-all",
                  activeTab === id ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm" : "text-gray-600 dark:text-gray-400"
                )}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Hero */}
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
              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Admin Role</h3>
                <div className="relative mb-3">
                  <select
                    value={selectedRole || admin.role}
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
              </div>

              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Admin Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Mail, label: admin.email },
                    { icon: Clock, label: `Last Active: ${formatTime(admin.last_active)}` },
                    { icon: Calendar, label: `Added: ${formatDate(admin.created_at)}` },
                    { icon: Shield, label: roleLabel(admin.role) },
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
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
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
                        <button type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwords.current || !passwords.newPass}
                  className="px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
                >
                  {changingPassword ? "Updating…" : "Change Password"}
                </button>
                <div className="mt-4 flex items-center justify-between px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200">2FA Verification</span>
                  </div>
                  <Switch className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Account Actions</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowSuspendDialog(true)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200/60 dark:border-orange-500/20 transition-all"
                  >
                    {admin.is_active ? "Suspend Account" : "Reactivate Account"}
                  </button>
                  <button
                    onClick={() => setShowRemoveDialog(true)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/60 dark:border-red-500/20 transition-all"
                  >
                    Remove Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Audit Logs</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Platform-wide admin activity — {auditData?.total ?? 0} total
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                  <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
                    <tr>
                      {["Timestamp", "Admin", "Action", "Target"].map((h) => (
                        <th key={h} className="p-3 text-left text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-200/30 dark:border-gray-700/30">
                          {[...Array(4)].map((_, j) => (
                            <td key={j} className="p-3"><Skeleton className="h-3.5 w-24" /></td>
                          ))}
                        </tr>
                      ))
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[12px] text-gray-400">No audit logs yet</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                          <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="p-3">
                            <p className="text-[12px] font-medium text-gray-900 dark:text-white">{log.admin_name}</p>
                            <p className="text-[10px] text-gray-400">{log.admin_email}</p>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                              {actionLabel(log.action)}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                            {log.target !== "None:None" ? log.target : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {admin.is_active ? "Suspend Account?" : "Reactivate Account?"}
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
              onClick={() => admin.is_active ? suspendMutation.mutate() : resumeMutation.mutate()}
              disabled={isSuspendPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {isSuspendPending ? "Updating…" : admin.is_active ? "Suspend" : "Reactivate"}
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
            <div className="flex items-center gap-2 text-[12px] text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              This action cannot be undone.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowRemoveDialog(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">
              Cancel
            </button>
            <button
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 disabled:opacity-60"
            >
              {removeMutation.isPending ? "Removing…" : "Remove Permanently"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminProfiles = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ full_name: "", email: "", password: "", role: "staff" });
  const limit = 25;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/profiles/stats").then((r) => r.data as AdminStats),
  });

  // ── Admin List ────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["admin-profiles", page, search, statusFilter, roleFilter],
    queryFn: () =>
      api.get("/admin/profiles/", {
        params: {
          page,
          limit,
          search: search || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          is_active: statusFilter === "active" ? true : statusFilter === "suspended" ? false : undefined,
        },
      }).then((r) => r.data),
  });

  const admins: AdminUser[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  // ── Create admin ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/users", newAdmin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Admin created successfully");
      setShowAddDialog(false);
      setNewAdmin({ full_name: "", email: "", password: "", role: "staff" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to create admin";
      toast.error(typeof msg === "string" ? msg : "Failed to create admin");
    },
  });

  if (selectedAdminId) {
    return <AdminDetail adminId={selectedAdminId} onBack={() => setSelectedAdminId(null)} />;
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
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {/* Stats — now from /admin/profiles/stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Admins", value: statsLoading ? "—" : (stats?.total_admins ?? 0), desc: "All admin accounts", icon: Shield, color: "orange" },
          { label: "Active Admins", value: statsLoading ? "—" : (stats?.active_admins ?? 0), desc: "Currently active", icon: UserCog, color: "green" },
          { label: "Suspended", value: statsLoading ? "—" : (stats?.suspended_admins ?? 0), desc: "Access revoked", icon: Lock, color: "red" },
          { label: "Active Sessions", value: statsLoading ? "—" : (stats?.active_sessions ?? 0), desc: "Currently logged in", icon: Activity, color: "blue" },
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
            placeholder="Search admins…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-11 h-11 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border-gray-200/50 dark:border-gray-700/30 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[13px] shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: statusFilter, setter: setStatusFilter, options: [["all", "All Status"], ["active", "Active"], ["suspended", "Suspended"]] },
            { value: roleFilter, setter: setRoleFilter, options: [["all", "All Roles"], ["superadmin", "Super Admin"], ["admin", "Admin"], ["staff", "Staff"]] },
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
                {["Admin", "Role", "Status", "Last Active", "Created", "Action"].map((h) => (
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
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="p-4"><Skeleton className="h-3.5 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[13px] text-gray-400">No admins found</td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr
                    key={adm.id}
                    className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAdminId(adm.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar admin={adm} size="md" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{adm.full_name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">{adm.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleColor(adm.role)}`}>
                          {roleLabel(adm.role)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {adm.role === "superadmin" ? "Full Access" : adm.role === "admin" ? "Limited" : "Restricted"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColor(adm.is_active)}`}>
                        {adm.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(adm.last_active)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(adm.created_at)}
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
                          <DropdownMenuItem onClick={() => setSelectedAdminId(adm.id)} className="rounded-[10px] text-[13px] cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedAdminId(adm.id)} className="rounded-[10px] text-[13px] cursor-pointer">
                            <UserCog className="w-4 h-4 mr-2" /> Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30" />
                          <DropdownMenuItem
                            onClick={() => setSelectedAdminId(adm.id)}
                            className={cn("rounded-[10px] text-[13px] cursor-pointer", adm.is_active ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400")}
                          >
                            {adm.is_active
                              ? <><Lock className="w-4 h-4 mr-2" /> Suspend</>
                              : <><CheckCircle className="w-4 h-4 mr-2" /> Reactivate</>
                            }
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
                {key === "password" && newAdmin.password.length > 0 && newAdmin.password.length < 12 && (
                  <p className="text-[11px] text-red-500">Password must be at least 12 characters</p>
                )}
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