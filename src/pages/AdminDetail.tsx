import { useEffect, useState } from "react";
import {
  Shield, UserCog, Lock, ArrowLeft, Mail, Activity,
  AlertTriangle, Clock, Calendar, Eye, Key,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Avatar, roleLabel, roleColor, statusColor, formatDate, formatTime } from "./AdminProfiles";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_active: string | null;
  created_at: string;
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

const PERM_CATEGORIES = [
  {
    label: "Dashboard", key: "dashboard",
    perms: [{ key: "admin.dashboard.read", label: "Read dashboard" }],
  },
  {
    label: "Transactions", key: "transactions",
    perms: [
      { key: "admin.transactions.read", label: "Read transactions" },
      { key: "admin.transactions.export", label: "Export transactions" },
      { key: "admin.transactions.flag", label: "Flag transactions" },
      { key: "admin.transactions.notes", label: "Add notes" },
      { key: "admin.transactions.refund", label: "Process refunds" },
    ],
  },
  {
    label: "Platform Users", key: "platform_users",
    perms: [
      { key: "admin.platform_users.read", label: "Read users" },
      { key: "admin.platform_users.update", label: "Update users" },
      { key: "admin.platform_users.flag", label: "Flag users" },
      { key: "admin.platform_users.profile.read", label: "Read user profiles" },
      { key: "admin.platform_users.kyc.read", label: "Read KYC data" },
    ],
  },
  {
    label: "Gift Cards", key: "giftcards",
    perms: [
      { key: "admin.giftcards.review.read", label: "Read submissions" },
      { key: "admin.giftcards.review.update", label: "Review submissions" },
      { key: "admin.giftcards.review.export", label: "Export submissions" },
    ],
  },
  {
    label: "Support", key: "support",
    perms: [
      { key: "admin.support.read", label: "Read tickets" },
      { key: "admin.support.write", label: "Reply to tickets" },
      { key: "admin.support.assign", label: "Assign tickets" },
      { key: "admin.support.close", label: "Close tickets" },
    ],
  },
  {
    label: "Notifications", key: "notifications",
    perms: [
      { key: "admin.notifications.read", label: "Read notifications" },
      { key: "admin.notifications.update", label: "Update preferences" },
      { key: "admin.notifications.create", label: "Create notifications" },
    ],
  },
  {
    label: "Admin Management", key: "users",
    perms: [
      { key: "admin.users.read", label: "Read admins" },
      { key: "admin.users.create", label: "Create admins" },
      { key: "admin.users.update", label: "Update admins" },
      { key: "admin.users.disable", label: "Disable admins" },
      { key: "admin.management.read", label: "Read management" },
      { key: "admin.management.update", label: "Update management" },
      { key: "admin.management.delete", label: "Delete management" },
    ],
  },
  {
    label: "Platform Settings", key: "platform_settings",
    perms: [
      { key: "admin.platform_settings.read", label: "Read settings" },
      { key: "admin.platform_settings.update", label: "Update settings" },
    ],
  },
  {
    label: "Security", key: "security",
    perms: [
      { key: "admin.security.password.change", label: "Change password" },
      { key: "admin.security.sessions.read", label: "Read sessions" },
      { key: "admin.security.sessions.revoke", label: "Revoke sessions" },
    ],
  },
  {
    label: "Reports & Metrics", key: "reports",
    perms: [
      { key: "admin.metrics.read", label: "Read metrics" },
      { key: "admin.revenue.read", label: "Read revenue" },
      { key: "admin.logs.read", label: "Read logs" },
      { key: "admin.user_activity.read", label: "Read user activity" },
    ],
  },
  {
    label: "Other", key: "other",
    perms: [
      { key: "admin.profile.read", label: "Read own profile" },
      { key: "admin.profile.update", label: "Update own profile" },
      { key: "admin.system_health.read", label: "Read system health" },
      { key: "admin.policies.read", label: "Read policies" },
    ],
  },
];

export const AdminDetail = ({ adminId, onBack, initialTab = "general" }: { adminId: string; onBack: () => void; initialTab?: string }) => {  const qc = useQueryClient();
  const { admin: currentAdmin } = useAuthStore();
  const isViewingSelf = currentAdmin?.id === adminId;

const [activeTab, setActiveTab] = useState<"general" | "security" | "activity" | "permissions">(
  initialTab as "general" | "security" | "activity" | "permissions"
);
  const [selectedRole, setSelectedRole] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "" });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false });
  const [changingPassword, setChangingPassword] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<Set<string>>(new Set());
  const [pendingRemove, setPendingRemove] = useState<Set<string>>(new Set());
  const [savingPerms, setSavingPerms] = useState(false);

  // ── Fetch admin profile ───────────────────────────────────────────────────
  const { data: admin, isLoading } = useQuery<AdminUser>({
    queryKey: ["admin-profile", adminId],
    queryFn: () => api.get(`/admin/profiles/${adminId}`).then((r) => r.data),
  });

  useEffect(() => {
    if (admin?.role && !selectedRole) setSelectedRole(admin.role);
  }, [admin?.role]);

  // ── Roles data (for permissions) ─────────────────────────────────────────
  const { data: rolesData } = useQuery<{ roles: Record<string, string[]> }>({
    queryKey: ["admin-roles"],
    queryFn: () => api.get("/admin/roles").then((r) => r.data),
  });

  // ── My permissions (only when viewing self) ───────────────────────────────
  const { data: myPermsData } = useQuery<{ role: string; permissions: string[] }>({
    queryKey: ["my-permissions"],
    queryFn: () => api.get("/admin/me/permissions").then((r) => r.data),
    enabled: isViewingSelf && activeTab === "permissions",
  });

  // ── Audit logs ────────────────────────────────────────────────────────────
  const { data: auditData, isLoading: auditLoading } = useQuery<{ total: number; items: AuditLog[] }>({
    queryKey: ["admin-audit-logs", adminId],
    queryFn: () => api.get(`/admin/profiles/${adminId}/audit-logs`).then((r) => r.data),
    enabled: activeTab === "activity",
  });
  const auditLogs = auditData?.items ?? [];

  // ── Permissions helpers ───────────────────────────────────────────────────
  const allPermissions = rolesData?.roles?.superadmin ?? [];
  const roleDefaultPerms: string[] = rolesData?.roles?.[admin?.role ?? "staff"] ?? [];
  const effectivePerms: string[] = isViewingSelf
    ? (myPermsData?.permissions ?? roleDefaultPerms)
    : roleDefaultPerms;

  const hasChanges = pendingAdd.size > 0 || pendingRemove.size > 0;

  const isPermEnabled = (perm: string) => {
    if (pendingAdd.has(perm)) return true;
    if (pendingRemove.has(perm)) return false;
    return effectivePerms.includes(perm);
  };

  const togglePerm = (perm: string) => {
    if (isViewingSelf || admin?.role === "superadmin") return;
    const current = isPermEnabled(perm);
    if (current) {
      setPendingRemove((s) => new Set([...s, perm]));
      setPendingAdd((s) => { const n = new Set(s); n.delete(perm); return n; });
    } else {
      setPendingAdd((s) => new Set([...s, perm]));
      setPendingRemove((s) => { const n = new Set(s); n.delete(perm); return n; });
    }
  };

  const savePermissions = async () => {
    setSavingPerms(true);
    try {
      await Promise.all([
        ...[...pendingAdd].map((perm) =>
          api.post(`/admin/profiles/${adminId}/permissions/add`, { permission: perm })
        ),
        ...[...pendingRemove].map((perm) =>
          api.post(`/admin/profiles/${adminId}/permissions/remove`, { permission: perm })
        ),
      ]);
      setPendingAdd(new Set());
      setPendingRemove(new Set());
      toast.success("Permissions updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail?.message ?? "Failed to update permissions");
    } finally {
      setSavingPerms(false);
    }
  };

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
      toast.success("Admin permanently removed");
      setShowRemoveDialog(false);
      onBack();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to remove admin");
      setShowRemoveDialog(false);
    },
  });

  const resetPermsMutation = useMutation({
    mutationFn: () => api.post(`/admin/profiles/${adminId}/reset-permissions`),
    onSuccess: () => {
      setPendingAdd(new Set());
      setPendingRemove(new Set());
      toast.success("Permissions reset to role default");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail?.message ?? "Failed to reset permissions");
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
    { id: "permissions", label: "Permissions", icon: Key },
  ] as const;

  const isSuspendPending = suspendMutation.isPending || resumeMutation.isPending;
  const isSuperAdminProfile = admin?.role === "superadmin";

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

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex md:flex-row flex-col gap-4 md:items-start">
        {/* Desktop sidebar tabs */}
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
                className={cn(
                  "flex-1 py-2 rounded-full text-[11px] font-medium transition-all",
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

          {/* ── General Tab ── */}
          {activeTab === "general" && (
            <div className="space-y-3">
              {!isSuperAdminProfile && (
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
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => updateRoleMutation.mutate(selectedRole)}
                    disabled={updateRoleMutation.isPending || selectedRole === admin.role}
                    className="px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
                  >
                    {updateRoleMutation.isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}

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

          {/* ── Security Tab ── */}
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
                {isSuperAdminProfile ? (
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 italic">
                    Super Admin accounts cannot be suspended or removed from this view.
                  </p>
                ) : (
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
                )}
              </div>
            </div>
          )}

          {/* ── Activity Log Tab ── */}
          {activeTab === "activity" && (
            <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 dark:border-gray-700/20">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Activity Log</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Activity for {admin.full_name} — {auditData?.total ?? 0} entries
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                  <thead className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80">
                    <tr>
                      {["Timestamp", "Action", "Resource", "Status"].map((h) => (
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
                        <td colSpan={4} className="p-8 text-center text-[12px] text-gray-400">No activity logs yet</td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="border-t border-gray-200/30 dark:border-gray-700/30 hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors">
                          <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(log.timestamp ?? log.created_at)}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                              {actionLabel(log.action)}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                            {(log.target ?? log.resource) !== "None:None" ? (log.target ?? log.resource ?? "—") : "—"}
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              log.status === "SUCCESS"
                                ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                            )}>
                              {log.status ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Permissions Tab ── */}
          {activeTab === "permissions" && (
            <div className="space-y-3">
              {isViewingSelf ? (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 rounded-[12px] border border-blue-200/60 dark:border-blue-500/20">
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <p className="text-[12px] text-blue-700 dark:text-blue-400">
                    You cannot modify your own permissions. Ask another superadmin to make changes.
                  </p>
                </div>
              ) : isSuperAdminProfile ? (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-orange-50 dark:bg-orange-500/10 rounded-[12px] border border-orange-200/60 dark:border-orange-500/20">
                  <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-[12px] text-orange-700 dark:text-orange-400">
                    Super Admin accounts have all permissions by default and cannot be restricted.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px]">
                  <div>
                    <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200">
                      {hasChanges
                        ? `${pendingAdd.size + pendingRemove.size} unsaved change${pendingAdd.size + pendingRemove.size > 1 ? "s" : ""}`
                        : `Showing permissions for ${roleLabel(admin.role)} role`}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {effectivePerms.length} of {allPermissions.length} permissions enabled
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasChanges && (
                      <button
                        onClick={() => { setPendingAdd(new Set()); setPendingRemove(new Set()); }}
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/40 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all"
                      >
                        Discard
                      </button>
                    )}
                    <button
                      onClick={() => resetPermsMutation.mutate()}
                      disabled={resetPermsMutation.isPending}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1C1C1C] text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/40 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all"
                    >
                      {resetPermsMutation.isPending ? "Resetting…" : "Reset to default"}
                    </button>
                    {hasChanges && (
                      <button
                        onClick={savePermissions}
                        disabled={savingPerms}
                        className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-sm disabled:opacity-60"
                      >
                        {savingPerms ? "Saving…" : "Save changes"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
                {PERM_CATEGORIES.map((cat, catIdx) => {
                  const enabledCount = cat.perms.filter((p) => isPermEnabled(p.key)).length;
                  return (
                    <div key={cat.key} className={catIdx > 0 ? "border-t border-gray-100/80 dark:border-gray-700/20" : ""}>
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {cat.label}
                        </span>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          enabledCount === cat.perms.length
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : enabledCount === 0
                            ? "bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400"
                            : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        )}>
                          {enabledCount}/{cat.perms.length}
                        </span>
                      </div>
                      {cat.perms.map((perm) => {
                        const enabled = isPermEnabled(perm.key);
                        const isPendingChange = pendingAdd.has(perm.key) || pendingRemove.has(perm.key);
                        const isSuperAdminOnly = !rolesData?.roles?.admin?.includes(perm.key) &&
                          !rolesData?.roles?.staff?.includes(perm.key);
                        const disabled = isViewingSelf || isSuperAdminProfile;
                        return (
                          <div
                            key={perm.key}
                            className={cn(
                              "flex items-center justify-between px-4 py-2.5 border-t border-gray-100/60 dark:border-gray-700/20 transition-colors",
                              !disabled && "hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40",
                              isPendingChange && "bg-orange-50/50 dark:bg-orange-500/5"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200">{perm.label}</p>
                                {isSuperAdminOnly && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400">
                                    Superadmin only
                                  </span>
                                )}
                                {isPendingChange && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-500">
                                    Unsaved
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{perm.key}</p>
                            </div>
                            <button
                              onClick={() => !disabled && togglePerm(perm.key)}
                              disabled={disabled}
                              className={cn(
                                "relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ml-3",
                                enabled ? "bg-gradient-to-r from-orange-400 to-orange-500" : "bg-gray-200 dark:bg-gray-700",
                                disabled && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <span className={cn(
                                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                enabled && "translate-x-4"
                              )} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-600 px-1">
                Changes apply only to this admin account. Role-level permissions require a backend endpoint.
              </p>
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