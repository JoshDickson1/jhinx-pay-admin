import { useState } from "react";
import {
  Send, Plus, Bell, Clock, Mail, Smartphone,
  MessageSquare, Users, Trash2, Edit2, MoreHorizontal,
  RefreshCw, AlertTriangle, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

// ── Types — exact API field names ─────────────────────────────────────────────

interface PlatformNotification {
  id: string;
  notification_name: string;
  notification_type: string;   // "announcement" | "maintenance" | "warning" | "promo"
  message: string;
  recipients: string;          // e.g. "all", "tier1"
  channels: string[];          // "Push Notification" | "Email" | "SMS"
  status: string;              // "sent" | "scheduled" | "draft" | "pending"
  sent_at?: string | null;
  scheduled_for?: string | null;
  dispatched_at?: string | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeStyles: Record<string, string> = {
  "Announcement":        "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent",
  "Platform Maintenance":"border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent",
  "Security Alert":      "border border-red-500 text-red-600 dark:text-red-400 bg-transparent",
  "Security Update":     "border border-red-400 text-red-500 dark:text-red-400 bg-transparent",
  "Promotion":           "border border-green-500 text-green-600 dark:text-green-400 bg-transparent",
  "Instant Crypto":      "border border-purple-400 text-purple-600 dark:text-purple-400 bg-transparent",
};

const typeLabels: Record<string, string> = {
  "Announcement":         "Announcement",
  "Platform Maintenance": "Maintenance",
  "Security Alert":       "Security Alert",
  "Security Update":      "Security Update",
  "Promotion":            "Promotion",
  "Instant Crypto":       "Instant Crypto",
};

const statusStyles: Record<string, string> = {
  sent:      "border border-green-500 text-green-600 dark:text-green-400 bg-transparent",
  scheduled: "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent",
  draft:     "border border-gray-400 text-gray-500 dark:text-gray-400 bg-transparent",
  pending:   "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent",
};

// API channel values exactly as backend expects
const CHANNELS = [
  { key: "push",  label: "Push Notification", apiValue: "Push Notification", icon: MessageSquare },
  { key: "email", label: "Email",              apiValue: "Email",             icon: Mail          },
  { key: "sms",   label: "SMS",                apiValue: "SMS",               icon: Smartphone    },
] as const;

const ChannelIcon = ({ ch }: { ch: string }) => {
  const found = CHANNELS.find((c) => c.apiValue === ch || c.key === ch.toLowerCase());
  if (!found) return null;
  const Icon = found.icon;
  return <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />;
};

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const emptyForm = {
  notification_name: "",
  notification_type: "Announcement",   // exact API enum value
  message: "",
  recipients: "All Users",             // exact API enum value
  push: false,
  email: false,
  sms: false,
  schedule: false,
  scheduled_for: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

const SystemNotifications = () => {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlatformNotification | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<PlatformNotification | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // ── Fetch notifications ────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["platform-notifications"],
    queryFn: () => api.get("/admin/platform-notifications").then((r) => r.data),
  });

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-notifications-stats"],
    queryFn: () => api.get("/admin/platform-notifications/stats").then((r) => r.data),
  });

  const notifications: PlatformNotification[] = data?.items ?? [];

  // ── Create mutation ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      api.post("/admin/platform-notifications", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-notifications"] });
      qc.invalidateQueries({ queryKey: ["platform-notifications-stats"] });
      toast.success(form.schedule ? "Notification scheduled!" : "Notification created!");
      setCreateOpen(false);
      setForm({ ...emptyForm });
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail.map((d: any) => d.msg).join(", "));
      } else {
        toast.error(typeof detail === "string" ? detail : "Failed to create notification");
      }
    },
  });

  // ── Dispatch mutation ──────────────────────────────────────────────────────
  const dispatchMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/admin/platform-notifications/${id}/dispatch`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-notifications"] });
      qc.invalidateQueries({ queryKey: ["platform-notifications-stats"] });
      toast.success("Notification dispatched successfully");
      setDispatchTarget(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to dispatch notification";
      toast.error(typeof msg === "string" ? msg : "Dispatch failed");
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyForm });
    setCreateOpen(true);
  };

  const openEdit = (n: PlatformNotification) => {
    setEditTarget(n);
    setForm({
      notification_name: n.notification_name,
      notification_type: n.notification_type,
      message: n.message,
      recipients: n.recipients ?? "All Users",
      push:  n.channels.includes("Push Notification"),
      email: n.channels.includes("Email"),
      sms:   n.channels.includes("SMS"),
      schedule: !!n.scheduled_for,
      scheduled_for: n.scheduled_for ?? "",
    });
    setCreateOpen(true);
  };

  const buildChannels = () => {
    const ch: string[] = [];
    if (form.push)  ch.push("Push Notification");
    if (form.email) ch.push("Email");
    if (form.sms)   ch.push("SMS");
    return ch;
  };

  const handleSubmit = () => {
    const channels = buildChannels();
    if (!form.notification_name || !form.message) {
      toast.error("Name and message are required");
      return;
    }
    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }

    const payload: Record<string, any> = {
      notification_name: form.notification_name,
      notification_type: form.notification_type,
      message: form.message,
      recipients: form.recipients,
      channels,
    };
    if (form.schedule && form.scheduled_for) {
      payload.scheduled_for = form.scheduled_for;
    }

    createMutation.mutate(payload);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Total Notifications",     value: statsData?.total_notifications     ?? 0, icon: Bell  },
    { label: "Scheduled Notifications", value: statsData?.scheduled_notifications ?? 0, icon: Clock },
    { label: "Sent Notifications",      value: statsData?.sent_notifications      ?? 0, icon: Send  },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">System Notifications</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            Send announcements and alerts to platform users
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Create Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            {statsLoading
              ? <Skeleton className="h-7 w-12" />
              : <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
            }
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Notification", "Type", "Recipients", "Channels", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-40 w-40" /></td>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-40 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <p className="text-[12px] text-gray-400">Failed to load notifications</p>
                      <button onClick={() => refetch()} className="text-[11px] text-orange-500 hover:underline">Retry</button>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-white">No notifications yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Create your first platform notification</p>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-semibold text-gray-900 dark:text-white">
                        {n.notification_name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate max-w-[180px]">
                        {n.message}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5", typeStyles[n.notification_type] ?? typeStyles.announcement)}>
                        {typeLabels[n.notification_type] ?? n.notification_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        {n.recipients === "All Users" ? "All Users" : n.recipients}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {(n.channels ?? []).map((ch) => (
                          <ChannelIcon key={ch} ch={ch} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5", statusStyles[n.status?.toLowerCase()] ?? statusStyles.draft)}>
                        {n.status ? n.status.charAt(0).toUpperCase() + n.status.slice(1) : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(n.dispatched_at ?? n.sent_at ?? n.scheduled_for ?? n.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                            <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl">
                          {/* Dispatch — only for unsent/pending */}
                          {(!n.dispatched_at && n.status !== "sent") && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setDispatchTarget(n)}
                                className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] text-orange-600 dark:text-orange-400"
                              >
                                <Zap className="w-3.5 h-3.5" /> Dispatch Now
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => openEdit(n)}
                            className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-500" /> Edit
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

        {/* Pagination info */}
        {!isLoading && notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100/80 dark:border-gray-700/20">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{notifications.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{data?.pagination?.total ?? notifications.length}</span> notifications
            </p>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {editTarget ? "Edit Notification" : "Create Notification"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              {editTarget ? "Update this platform notification." : "Send or schedule a notification to users."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Notification Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.notification_name}
                onChange={(e) => setForm({ ...form, notification_name: e.target.value })}
                placeholder="e.g. Scheduled Maintenance"
                className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notification Type</Label>
              <div className="relative">
                <select
                  value={form.notification_type}
                  onChange={(e) => setForm({ ...form, notification_type: e.target.value })}
                  className="w-full appearance-none h-10 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Platform Maintenance">Platform Maintenance</option>
                  <option value="Security Alert">Security Alert</option>
                  <option value="Security Update">Security Update</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Instant Crypto">Instant Crypto</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your notification message..."
                className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px] min-h-[80px] resize-none"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Recipients</Label>
              <div className="relative">
                <select
                  value={form.recipients}
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                  className="w-full appearance-none h-10 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer"
                >
                  <option value="All Users">All Users</option>
                  <option value="Tier 1+">Tier 1+</option>
                </select>
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                Delivery Channels <span className="text-red-400">*</span>
              </Label>
              {CHANNELS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`ch-${key}`}
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={(v) => setForm({ ...form, [key]: !!v })}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
                  />
                  <Label htmlFor={`ch-${key}`} className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="schedule"
                checked={form.schedule}
                onCheckedChange={(v) => setForm({ ...form, schedule: !!v })}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
              />
              <Label htmlFor="schedule" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">
                Schedule for later
              </Label>
            </div>

            {form.schedule && (
              <Input
                type="datetime-local"
                value={form.scheduled_for}
                onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
              />
            )}
          </div>

          <DialogFooter>
            <button
              disabled={createMutation.isPending || !form.notification_name || !form.message}
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {createMutation.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : <><Send className="w-3.5 h-3.5" /> {form.schedule ? "Schedule" : editTarget ? "Update" : "Send Now"}</>
              }
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dispatch Confirm Dialog ── */}
      <Dialog open={!!dispatchTarget} onOpenChange={() => setDispatchTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              Dispatch Notification?
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will immediately send "{dispatchTarget?.notification_name}" to{" "}
              {dispatchTarget?.recipients === "all" ? "all users" : dispatchTarget?.recipients}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDispatchTarget(null)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              disabled={dispatchMutation.isPending}
              onClick={() => dispatchTarget && dispatchMutation.mutate(dispatchTarget.id)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {dispatchMutation.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching…</>
                : <><Zap className="w-3.5 h-3.5" /> Dispatch</>
              }
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
      `}</style>
    </div>
  );
};

export default SystemNotifications;