import { useState } from "react";
import { Camera, Trash2, Lock, Shield, ChevronRight, LogOut, Monitor, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sessions = [
  { device: "MacBook Pro", browser: "Edge macOS", ip: "102.89.21.3", location: "Lagos, Nigeria", lastActive: "—", status: "current" as const },
  { device: "HP Elite Book", browser: "Chrome Windows", ip: "402.89.21.3", location: "Abuja, Nigeria", lastActive: "Jan 13, 2:30 PM", status: "active" as const },
];

export const ProfileTab = () => {
  const [form, setForm] = useState({ firstName: "Wizz", lastName: "Jeo", phone: "08142131582", role: "Super Admin" });
  const [twoFA, setTwoFA] = useState(true);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [sessionToLogout, setSessionToLogout] = useState<number | null>(null);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  return (
    <div className="space-y-3">
      {/* Profile Card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        {/* Hero Banner */}
        <div className="h-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15),transparent_70%)]" />
        </div>

        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-[#1C1C1C] overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 shadow-lg">
              <img
                src="https://ca.slack-edge.com/T08BN2VF2GL-U0A25LVCYL9-11f7983440b6-512"
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="pb-1">
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Obed Vine</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">beddv@gmail.com</p>
              <Badge className="mt-1 text-[9px] px-2 py-0.5 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/10 text-orange-700 dark:text-orange-400 border-0 rounded-full font-bold uppercase tracking-wide">
                Super Admin
              </Badge>
            </div>
          </div>

          {/* Picture actions */}
          <div className="flex items-center gap-2 mb-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40">
              <Camera className="w-3.5 h-3.5" />
              Change Picture
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40">
              <Trash2 className="w-3 h-3" />
              Remove Picture
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">JPG or PNG · Max 2MB</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Personal Information</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Update your personal information and profile details</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "First Name", key: "firstName" },
            { label: "Last Name", key: "lastName" },
            { label: "Phone", key: "phone" },
            { label: "Role", key: "role" },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                disabled={key === "role"}
                className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[10px] text-[12px] disabled:opacity-60"
              />
            </div>
          ))}
        </div>

        <button className="px-5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-md shadow-orange-500/20">
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Security</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Keep your account safe and secure</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setPasswordOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-[#1C1C1C] flex items-center justify-center border border-gray-200/50 dark:border-gray-700/30">
              <Lock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 text-left text-[12px] font-medium text-gray-800 dark:text-gray-200">Change Password</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
            <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-[#1C1C1C] flex items-center justify-center border border-gray-200/50 dark:border-gray-700/30">
              <Shield className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 text-[12px] font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication</span>
            <Switch
              checked={twoFA}
              onCheckedChange={setTwoFA}
              className="data-[state=checked]:bg-green-500 scale-90"
            />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Active Session Logs</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{sessions.length} devices signed in</p>
          </div>
          <button
            onClick={() => setLogoutAllOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 border border-gray-200/60 dark:border-gray-700/40"
          >
            <LogOut className="w-3 h-3" />
            Logout All
          </button>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-gray-200/50 dark:border-gray-700/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
                {["Device", "IP", "Location", "Last Active", "Status", ""].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 py-2">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s, i) => (
                <TableRow key={i} className="border-gray-200/50 dark:border-gray-700/30 hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40">
                  <TableCell className="py-2">
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{s.device}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500">{s.browser}</p>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-600 dark:text-gray-400 py-2">{s.ip}</TableCell>
                  <TableCell className="text-[11px] text-gray-600 dark:text-gray-400 py-2">{s.location}</TableCell>
                  <TableCell className="text-[11px] text-gray-500 dark:text-gray-500 py-2">{s.lastActive}</TableCell>
                  <TableCell className="py-2">
                    <Badge className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      s.status === "current"
                        ? "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                        : "bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                    }`}>
                      {s.status === "current" ? "Current" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    {s.status !== "current" && (
                      <button
                        onClick={() => setSessionToLogout(i)}
                        className="px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 border border-gray-200/60 dark:border-gray-700/40 transition-all duration-200"
                      >
                        Logout
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
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
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setPasswordOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setPasswordOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
            >
              Update Password
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout All Dialog */}
      <Dialog open={logoutAllOpen} onOpenChange={setLogoutAllOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Logout All Devices?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will end all active sessions across all devices. You'll need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setLogoutAllOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setLogoutAllOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20"
            >
              Logout All
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Session Logout Dialog */}
      <Dialog open={sessionToLogout !== null} onOpenChange={() => setSessionToLogout(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">End Session?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              {sessionToLogout !== null && `This will log out ${sessions[sessionToLogout]?.device} (${sessions[sessionToLogout]?.location}).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setSessionToLogout(null)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setSessionToLogout(null)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20"
            >
              End Session
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};