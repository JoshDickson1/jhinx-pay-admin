import { useState, useRef, useEffect } from "react";
import { Camera, Trash2, Lock, Shield, ChevronRight, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import {
  useMe, useUpdateProfile, useUploadProfilePicture, useDeleteProfilePicture,
  useChangePassword, useSessions, useLogoutAllSessions, useLogoutSession,
} from "@/hooks/useProfile";
import { getAvatarUrl } from "@/lib/utils";

// Parse user_agent string into readable device/browser
const parseUserAgent = (ua: string) => {
  const browser = ua.includes("Edg") ? "Edge"
    : ua.includes("Chrome") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") ? "Safari"
    : "Browser";

  const os = ua.includes("Windows") ? "Windows"
    : ua.includes("Mac OS") ? "macOS"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux"
    : "Unknown";

  return { browser, os };
};

const formatSessionDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export const ProfileTab = () => {
  const { admin } = useAuthStore();
  const { data: me, isLoading: meLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const uploadPicture = useUploadProfilePicture();
  const deletePicture = useDeleteProfilePicture();
  const changePassword = useChangePassword();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const logoutAll = useLogoutAllSessions();
  const logoutSession = useLogoutSession();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    if (me) {
      const parts = (me.full_name ?? "").split(" ");
      setForm({
        firstName: me.first_name ?? parts[0] ?? "",
        lastName: me.last_name ?? parts.slice(1).join(" ") ?? "",
        phone: me.phone ?? "",
        role: me.role ?? "",
      });
    }
  }, [me]);

  const [twoFA, setTwoFA] = useState(true);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [sessionToLogout, setSessionToLogout] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const rawSessions = sessionsData?.items ?? sessionsData?.sessions ?? sessionsData?.data ?? [];
  const sessions = Array.isArray(rawSessions) ? rawSessions : [];

  const avatarUrl = getAvatarUrl(me?.avatar_url ?? admin?.avatar_url);
  const displayName = (me?.first_name && me?.last_name)
    ? `${me.first_name} ${me.last_name}`
    : me?.first_name ?? me?.last_name ?? admin?.full_name ?? "Admin";
  const displayEmail = me?.email ?? admin?.email ?? "";
  const displayRole = (me?.role ?? admin?.role) === "superadmin" ? "Super Admin" : (me?.role ?? admin?.role ?? "Admin");
  const initials = displayName.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  const handleSaveProfile = () => {
    updateProfile.mutate({ first_name: form.firstName, last_name: form.lastName, phone: form.phone });
  };

  const handleChangePassword = () => {
    if (passwords.newPass !== passwords.confirm) return;
    changePassword.mutate(
      { current_password: passwords.current, new_password: passwords.newPass },
      { onSuccess: () => { setPasswordOpen(false); setPasswords({ current: "", newPass: "", confirm: "" }); } }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPicture.mutate(file);
  };

  return (
    <div className="space-y-3 w-full">

      {/* Profile Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden w-full">
        <div className="h-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15),transparent_70%)]" />
        </div>
        <div className="px-4 sm:px-5 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className={`w-16 h-16 rounded-full ring-4 ring-white dark:ring-[#1C1C1C] overflow-hidden flex-shrink-0 shadow-lg flex items-center justify-center ${!avatarUrl ? "bg-gradient-to-br from-orange-400 to-orange-600" : ""}`}>
              {meLoading ? (
                <Skeleton className="w-16 h-16 rounded-full" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{initials}</span>
              )}
            </div>
            <div className="pb-1 min-w-0 flex-1">
              {meLoading ? (
                <>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-44 mb-1" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </>
              ) : (
                <>
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{displayName}</h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
                  <Badge className="mt-1 text-[9px] px-2 py-0.5 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-50/20 dark:to-orange-50/10 text-orange-700 dark:text-white border-0 rounded-full font-bold uppercase tracking-wide">
                    {displayRole}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPicture.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40 disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
              {uploadPicture.isPending ? "Uploading…" : "Change Picture"}
            </button>
            <button
              onClick={() => deletePicture.mutate()}
              disabled={deletePicture.isPending || !avatarUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40 disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
              Remove Picture
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG or PNG · Max 2MB</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4 w-full">
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Personal Information</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Update your personal information and profile details</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { label: "First Name", key: "firstName" },
            { label: "Last Name", key: "lastName" },
            { label: "Phone", key: "phone" },
            { label: "Role", key: "role" },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
              {meLoading ? (
                <Skeleton className="h-9 rounded-[10px]" />
              ) : (
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  disabled={key === "role"}
                  className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[10px] text-[12px] disabled:opacity-60 w-full"
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={updateProfile.isPending}
          className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-md shadow-orange-500/20 disabled:opacity-60"
        >
          {updateProfile.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Security */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4 w-full">
        <div className="mb-3">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Security</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Keep your account safe and secure</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setPasswordOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-[#1C1C1C] flex items-center justify-center border border-gray-200/50 dark:border-gray-700/30 flex-shrink-0">
              <Lock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 text-left text-[12px] font-medium text-gray-800 dark:text-gray-200">Change Password</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
            <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-[#1C1C1C] flex items-center justify-center border border-gray-200/50 dark:border-gray-700/30 flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 text-[12px] font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication</span>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} className="data-[state=checked]:bg-green-500 scale-90 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4 w-full">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Active Session Logs</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {sessionsLoading ? "Loading…" : `${sessions.length} device${sessions.length !== 1 ? "s" : ""} signed in`}
            </p>
          </div>
          <button
            onClick={() => setLogoutAllOpen(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Logout All</span>
          </button>
        </div>

        {/* Mobile — card view */}
        <div className="sm:hidden space-y-2">
          {sessionsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 rounded-[10px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))
          ) : sessions.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 py-6">No active sessions</p>
          ) : (
            sessions.map((s: any, i: number) => {
              const { browser, os } = parseUserAgent(s.user_agent ?? "");
              return (
                <div key={s.id ?? i} className="p-3 rounded-[10px] bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/40 dark:border-gray-700/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{os}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500">{browser}</p>
                    </div>
                    <Badge className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>IP: <span className="text-gray-700 dark:text-gray-300 font-medium">{s.ip ?? "—"}</span></span>
                    <span>Started: <span className="text-gray-700 dark:text-gray-300 font-medium">{s.created_at ? formatSessionDate(s.created_at) : "—"}</span></span>
                    <span>Expires: <span className="text-gray-700 dark:text-gray-300 font-medium">{s.expires_at ? formatSessionDate(s.expires_at) : "—"}</span></span>
                  </div>
                  <button
                    onClick={() => setSessionToLogout(s.id)}
                    className="w-full py-1.5 rounded-[8px] text-[11px] font-medium bg-white dark:bg-[#1C1C1C] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 transition-all duration-200"
                  >
                    End Session
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop — table view */}
        <div className="hidden sm:block overflow-x-auto rounded-[10px] border border-gray-200/50 dark:border-gray-700/30">
          <Table className="min-w-[540px]">
            <TableHeader>
              <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
                {["Device", "IP", "Started", "Expires", "Status", ""].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 py-2 whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-2"><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[12px] text-gray-400 py-6">No active sessions</TableCell>
                </TableRow>
              ) : (
                sessions.map((s: any, i: number) => {
                  const { browser, os } = parseUserAgent(s.user_agent ?? "");
                  return (
                    <TableRow key={s.id ?? i} className="border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40">
                      <TableCell className="py-2">
                        <p className="text-[12px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">{os}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500">{browser}</p>
                      </TableCell>
                      <TableCell className="text-[11px] text-gray-600 dark:text-gray-400 py-2 whitespace-nowrap">{s.ip ?? "—"}</TableCell>
                      <TableCell className="text-[11px] text-gray-500 dark:text-gray-500 py-2 whitespace-nowrap">
                        {s.created_at ? formatSessionDate(s.created_at) : "—"}
                      </TableCell>
                      <TableCell className="text-[11px] text-gray-500 dark:text-gray-500 py-2 whitespace-nowrap">
                        {s.expires_at ? formatSessionDate(s.expires_at) : "—"}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 whitespace-nowrap">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <button
                          onClick={() => setSessionToLogout(s.id)}
                          className="px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-gray-200/60 dark:border-gray-700/40 transition-all duration-200 whitespace-nowrap"
                        >
                          Logout
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Change Password</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Enter your current password to set a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "Current Password", key: "current" },
              { label: "New Password", key: "newPass" },
              { label: "Confirm New Password", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                <Input
                  type="password"
                  value={passwords[key as keyof typeof passwords]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]"
                />
              </div>
            ))}
            {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
              <p className="text-[11px] text-red-500">Passwords do not match.</p>
            )}
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <button
              onClick={() => setPasswordOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !passwords.current || passwords.newPass !== passwords.confirm}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {changePassword.isPending ? "Updating…" : "Update Password"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout All Dialog */}
      <Dialog open={logoutAllOpen} onOpenChange={setLogoutAllOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Logout All Devices?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will end all active sessions across all devices. You'll need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <button onClick={() => setLogoutAllOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">
              Cancel
            </button>
            <button
              onClick={() => logoutAll.mutate(undefined, { onSuccess: () => setLogoutAllOpen(false) })}
              disabled={logoutAll.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 disabled:opacity-60"
            >
              {logoutAll.isPending ? "Logging out…" : "Logout All"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Session Logout Dialog */}
      <Dialog open={sessionToLogout !== null} onOpenChange={() => setSessionToLogout(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">End Session?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will log out the selected device session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <button onClick={() => setSessionToLogout(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">
              Cancel
            </button>
            <button
              onClick={() => { if (sessionToLogout) logoutSession.mutate(sessionToLogout, { onSuccess: () => setSessionToLogout(null) }); }}
              disabled={logoutSession.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 disabled:opacity-60"
            >
              {logoutSession.isPending ? "Ending…" : "End Session"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};