import { useState } from "react";
import {
  Send, Plus, Bell, Clock, Mail, Smartphone,
  MessageSquare, Users, Trash2, Edit2, MoreHorizontal, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "maintenance" | "warning" | "promo";
  recipients: string;
  channels: string[];
  status: "sent" | "scheduled" | "draft";
  sentAt?: string;
  scheduledFor?: string;
}

const initial: Notification[] = [
  { id: "1", title: "Platform Maintenance", message: "Scheduled maintenance on Jan 15, 2AM - 4AM WAT", type: "maintenance", recipients: "All Users", channels: ["push", "email", "sms"], status: "scheduled", scheduledFor: "23 Jan 2026" },
  { id: "2", title: "New Feature: Instant Crypto", message: "Buy crypto instantly with your debit card!", type: "announcement", recipients: "All Users", channels: ["push"], status: "sent", sentAt: "21 Jan 2026" },
  { id: "3", title: "Weekend Bonus Rates", message: "Get 5% extra on all gift card trades this weekend!", type: "promo", recipients: "All Users", channels: ["email", "sms"], status: "sent", sentAt: "20 Jan 2026" },
  { id: "4", title: "Security Update", message: "Important security improvements have been made", type: "warning", recipients: "All Users", channels: ["push", "email", "sms"], status: "scheduled", scheduledFor: "19 Jan 2026" },
];

const typeStyles: Record<string, string> = {
  announcement: "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent",
  maintenance:   "border border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent",
  warning:       "border border-red-500 text-red-600 dark:text-red-400 bg-transparent",
  promo:         "border border-green-500 text-green-600 dark:text-green-400 bg-transparent",
};
const typeLabels: Record<string, string> = {
  announcement: "Announcement", maintenance: "Maintenance", warning: "Security Alert", promo: "Promotion",
};
const statusStyles: Record<string, string> = {
  sent:      "border border-green-500 text-green-600 dark:text-green-400 bg-transparent",
  scheduled: "border border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent",
  draft:     "border border-gray-400 text-gray-500 dark:text-gray-400 bg-transparent",
};

const ChannelIcon = ({ ch }: { ch: string }) => {
  if (ch === "push")  return <MessageSquare className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />;
  if (ch === "email") return <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />;
  if (ch === "sms")   return <Smartphone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />;
  return null;
};

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initial);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Notification | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "", type: "announcement", message: "",
    allUsers: false, tier1: false, emailComplete: false,
    push: false, email: false, sms: false,
    schedule: false, date: "", time: "",
  });

  const resetForm = () => setForm({ title: "", type: "announcement", message: "", allUsers: false, tier1: false, emailComplete: false, push: false, email: false, sms: false, schedule: false, date: "", time: "" });

  const openCreate = () => { resetForm(); setEditTarget(null); setCreateOpen(true); };

  const openEdit = (n: Notification) => {
    setEditTarget(n);
    setForm({
      title: n.title, type: n.type, message: n.message,
      allUsers: n.recipients === "All Users", tier1: n.recipients === "Tier 1+", emailComplete: false,
      push: n.channels.includes("push"), email: n.channels.includes("email"), sms: n.channels.includes("sms"),
      schedule: !!n.scheduledFor, date: "", time: "",
    });
    setCreateOpen(true);
  };

  const handleSend = () => {
    if (!form.title || !form.message) return;
    const channels = [form.push && "push", form.email && "email", form.sms && "sms"].filter(Boolean) as string[];
    const recipients = form.allUsers ? "All Users" : form.tier1 ? "Tier 1+" : "All Users";

    if (editTarget) {
      setNotifications((prev) => prev.map((n) => n.id === editTarget.id ? { ...n, title: form.title, message: form.message, type: form.type as any, recipients, channels, status: form.schedule ? "scheduled" : "sent", scheduledFor: form.schedule ? `${form.date} ${form.time}` : undefined, sentAt: !form.schedule ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : undefined } : n));
      toast.success("Notification updated");
    } else {
      const newN: Notification = {
        id: String(Date.now()), title: form.title, message: form.message,
        type: form.type as any, recipients, channels,
        status: form.schedule ? "scheduled" : "sent",
        sentAt: !form.schedule ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : undefined,
        scheduledFor: form.schedule ? `${form.date} ${form.time}` : undefined,
      };
      setNotifications((prev) => [newN, ...prev]);
      toast.success(form.schedule ? "Notification scheduled!" : "Notification sent!");
    }
    setCreateOpen(false);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const stats = [
    { label: "Total Notifications", value: notifications.length,                               icon: Bell    },
    { label: "Scheduled Notifications", value: notifications.filter(n => n.status === "scheduled").length, icon: Clock   },
    { label: "Sent Notifications", value: notifications.filter(n => n.status === "sent").length,           icon: Send    },
  ];

  return (
    <div className="space-y-3 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">System Notification</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Send announcements and alerts to users</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
          <Plus className="w-3.5 h-3.5" /> Create Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
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
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate max-w-[180px]">{n.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5", typeStyles[n.type])}>{typeLabels[n.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                      <Users className="w-3 h-3" /> {n.recipients}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {n.channels.map((ch) => <ChannelIcon key={ch} ch={ch} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5", statusStyles[n.status])}>
                      {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {n.sentAt || n.scheduledFor || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl">
                        <DropdownMenuItem onClick={() => openEdit(n)} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                        <DropdownMenuItem onClick={() => handleDelete(n.id)} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 text-red-600 dark:text-red-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {editTarget ? "Edit Notification" : "Create Notification"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notification Name</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Input Notification Name" className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notification Type</Label>
              <div className="relative">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full appearance-none h-10 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                  <option value="">Select Notification Type</option>
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="warning">Security Alert</option>
                  <option value="promo">Promotion</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Notification Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Input Notification Messages" className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px] min-h-[80px] resize-none" />
            </div>

            {/* Recipients */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Recipients</Label>
              {[
                { key: "allUsers", label: "All Users" },
                { key: "tier1",    label: "Tier 1+" },
                { key: "emailComplete", label: "Email when complete" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2.5">
                  <Checkbox
                    id={key}
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={(v) => setForm({ ...form, [key]: !!v })}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
                  />
                  <Label htmlFor={key} className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>

            {/* Channels */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Delivery Channels</Label>
              {[
                { key: "push",  label: "Push Notification" },
                { key: "email", label: "Email" },
                { key: "sms",   label: "SMS" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`ch-${key}`}
                    checked={form[key as keyof typeof form] as boolean}
                    onCheckedChange={(v) => setForm({ ...form, [key]: !!v })}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
                  />
                  <Label htmlFor={`ch-${key}`} className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>

            {/* Schedule toggle */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="schedule"
                checked={form.schedule}
                onCheckedChange={(v) => setForm({ ...form, schedule: !!v })}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
              />
              <Label htmlFor="schedule" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">Schedule Notification</Label>
            </div>

            {form.schedule && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Time</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              disabled={!form.title || !form.message}
              onClick={handleSend}
              className="w-full py-2.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {editTarget ? "Update Notification" : form.schedule ? "Create Notification" : "Send Notification"}
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