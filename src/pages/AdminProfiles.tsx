import { useState } from "react";
import {
  Shield, UserCog, Lock, MoreHorizontal, Search, Plus,
  Clock, Calendar, ChevronLeft, ChevronRight, Eye, EyeOff,
  Activity, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AdminDetail } from "./AdminDetail";

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

export const Avatar = ({ admin, size = "md" }: { admin: { full_name: string }; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const text = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xl" : "text-[13px]";
  const initials = (admin.full_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm`}>
      <span className={`text-white font-semibold ${text}`}>{initials}</span>
    </div>
  );
};

export { roleLabel, roleColor, statusColor, formatDate, formatTime };

const AdminProfiles = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    full_name: "", email: "", password: "", confirmPassword: "", role: "staff",
  });
  const limit = 25;

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/profiles/stats").then((r) => r.data),
  });

const [showNewAdminPassword, setShowNewAdminPassword] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery<{ total: number; items: AdminUser[] }>({
    queryKey: ["admin-profiles", page, search, statusFilter, roleFilter],
    queryFn: () =>
      api.get("/admin/profiles/", {
        params: {
          page, limit,
          search: search || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          is_active: statusFilter === "active" ? true : statusFilter === "suspended" ? false : undefined,
        },
      }).then((r) => r.data),
  });

  const admins: AdminUser[] = data?.items ?? [];
  const total: number = data?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: () => api.post("/admin/users", {
      full_name: newAdmin.full_name,
      email: newAdmin.email,
      password: newAdmin.password,
      role: newAdmin.role,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Admin created successfully");
      setShowAddDialog(false);
      setNewAdmin({ full_name: "", email: "", password: "", confirmPassword: "", role: "staff" });
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

      {/* Stats */}
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
          ].map(({ value, setter, options }, idx) => (
            <div key={idx} className="relative">
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
                      {adm.role !== "superadmin" && (
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
                      )}
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
    { label: "Confirm Password", key: "confirmPassword", type: "password", placeholder: "Re-enter password" },
  ].map(({ label, key, type, placeholder }) => (
    <div key={key} className="space-y-1">
      <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
      <div className="relative">
        <Input
          type={type === "password" ? (showNewAdminPassword[key] ? "text" : "password") : type}
          placeholder={placeholder}
          value={newAdmin[key as keyof typeof newAdmin]}
          onChange={(e) => setNewAdmin((p) => ({ ...p, [key]: e.target.value }))}
          className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px] pr-9"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowNewAdminPassword((p) => ({ ...p, [key]: !p[key] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showNewAdminPassword[key]
              ? <EyeOff className="w-3.5 h-3.5" />
              : <Eye className="w-3.5 h-3.5" />
            }
          </button>
        )}
      </div>
      {key === "password" && newAdmin.password.length > 0 && newAdmin.password.length < 12 && (
        <p className="text-[11px] text-red-500">Password must be at least 12 characters</p>
      )}
      {key === "confirmPassword" && newAdmin.confirmPassword.length > 0 && newAdmin.confirmPassword !== newAdmin.password && (
        <p className="text-[11px] text-red-500">Passwords do not match</p>
      )}
    </div>
  ))}

  {/* Role — outside the map */}
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
              disabled={
                createMutation.isPending || !newAdmin.full_name || !newAdmin.email ||
                newAdmin.password.length < 12 || newAdmin.password !== newAdmin.confirmPassword
              }
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