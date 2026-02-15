import { useState } from "react";
import { 
  Send, 
  Plus, 
  Bell, 
  Clock, 
  Mail, 
  Smartphone,
  MessageSquare,
  Users,
  Calendar,
  Trash2,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Platform Maintenance",
    message: "Scheduled maintenance on Jan 15, 2AM - 4AM WAT",
    type: "maintenance",
    recipients: "All Users",
    channels: ["push", "email"],
    status: "sent",
    sentAt: "Jan 10, 2026",
  },
  {
    id: "2",
    title: "New Feature: Instant Crypto",
    message: "Buy crypto instantly with your debit card!",
    type: "announcement",
    recipients: "Tier 1+",
    channels: ["push"],
    status: "sent",
    sentAt: "Jan 8, 2026",
  },
  {
    id: "3",
    title: "Weekend Bonus Rates",
    message: "Get 5% extra on all gift card trades this weekend!",
    type: "promo",
    recipients: "All Users",
    channels: ["push", "email", "sms"],
    status: "scheduled",
    scheduledFor: "Jan 15, 2026 9:00 AM",
  },
  {
    id: "4",
    title: "Security Update",
    message: "Important security improvements have been made",
    type: "warning",
    recipients: "All Users",
    channels: ["push", "email"],
    status: "draft",
  },
];

const typeLabels = {
  announcement: "Announcement",
  maintenance: "Maintenance",
  warning: "Security Alert",
  promo: "Promotion",
};

const typeBadgeVariants = {
  announcement: "info" as const,
  maintenance: "warning" as const,
  warning: "error" as const,
  promo: "success" as const,
};

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement" as Notification["type"],
    recipients: "all",
    channels: { push: true, email: false, sms: false },
    schedule: "now",
    scheduledDate: "",
    scheduledTime: "",
  });

  const handleCreate = () => {
    const channels = [];
    if (formData.channels.push) channels.push("push");
    if (formData.channels.email) channels.push("email");
    if (formData.channels.sms) channels.push("sms");

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      recipients: formData.recipients === "all" ? "All Users" : formData.recipients === "tier1" ? "Tier 1+" : "Specific Users",
      channels,
      status: formData.schedule === "now" ? "sent" : "scheduled",
      sentAt: formData.schedule === "now" ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
      scheduledFor: formData.schedule === "later" ? `${formData.scheduledDate} ${formData.scheduledTime}` : undefined,
    };

    setNotifications(prev => [newNotification, ...prev]);
    toast.success(formData.schedule === "now" ? "Notification sent!" : "Notification scheduled!");
    setIsCreateDialogOpen(false);
    setFormData({
      title: "",
      message: "",
      type: "announcement",
      recipients: "all",
      channels: { push: true, email: false, sms: false },
      schedule: "now",
      scheduledDate: "",
      scheduledTime: "",
    });
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Notifications</h1>
          <p className="text-muted-foreground mt-1">Send announcements and alerts to users</p>
        </div>
        <Button variant="accent" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {notifications.filter(n => n.status === "sent").length}
              </p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {notifications.filter(n => n.status === "scheduled").length}
              </p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {notifications.filter(n => n.status === "draft").length}
              </p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
              <TableHead className="text-muted-foreground">Notification</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Recipients</TableHead>
              <TableHead className="text-muted-foreground">Channels</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id} className="border-border">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{notification.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{notification.message}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadgeVariants[notification.type]}>
                    {typeLabels[notification.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {notification.recipients}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {notification.channels.includes("push") && (
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    )}
                    {notification.channels.includes("email") && (
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    )}
                    {notification.channels.includes("sms") && (
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      notification.status === "sent" ? "success" : 
                      notification.status === "scheduled" ? "info" : 
                      "secondary"
                    }
                  >
                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {notification.sentAt || notification.scheduledFor || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send System Notification</DialogTitle>
            <DialogDescription>
              Create and send a notification to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: Notification["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="warning">Security Alert</SelectItem>
                  <SelectItem value="promo">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter notification title"
                className="bg-surface-1"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter notification message..."
                className="bg-surface-1 min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <RadioGroup 
                value={formData.recipients} 
                onValueChange={(value) => setFormData({ ...formData, recipients: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal">All users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tier1" id="tier1" />
                  <Label htmlFor="tier1" className="font-normal">Tier 1+ only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="font-normal">Specific users (enter emails)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Delivery Channels</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="push" 
                    checked={formData.channels.push}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, channels: { ...formData.channels, push: !!checked }})
                    }
                  />
                  <Label htmlFor="push" className="font-normal flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Push notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="email" 
                    checked={formData.channels.email}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, channels: { ...formData.channels, email: !!checked }})
                    }
                  />
                  <Label htmlFor="email" className="font-normal flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sms" 
                    checked={formData.channels.sms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, channels: { ...formData.channels, sms: !!checked }})
                    }
                  />
                  <Label htmlFor="sms" className="font-normal flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> SMS
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule</Label>
              <RadioGroup 
                value={formData.schedule} 
                onValueChange={(value) => setFormData({ ...formData, schedule: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="font-normal">Send immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="later" id="later" />
                  <Label htmlFor="later" className="font-normal">Schedule for later</Label>
                </div>
              </RadioGroup>
              
              {formData.schedule === "later" && (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="bg-surface-1"
                  />
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="bg-surface-1"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => toast.success("Draft saved")}>
              Save Draft
            </Button>
            <Button 
              variant="accent" 
              onClick={handleCreate} 
              disabled={!formData.title || !formData.message}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {formData.schedule === "now" ? "Send" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemNotifications;
