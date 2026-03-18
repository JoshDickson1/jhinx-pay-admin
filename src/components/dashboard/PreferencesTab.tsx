import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

type Theme = "light" | "dark" | "system";

const notificationKeys = [
  { key: "transactions", label: "New Transactions", description: "Keep your account safe and secure." },
  { key: "kyc", label: "KYC Updates", description: "New submissions and status changes" },
  { key: "support", label: "Support Tickets", description: "New tickets and replies" },
  { key: "system", label: "System Alerts", description: "Maintenance and updates" },
  { key: "security", label: "Security Alerts", description: "Suspicious activity and fraud" },
];

const themeOptions: { id: Theme; label: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light Mode", icon: Sun },
  { id: "dark", label: "Dark Mode", icon: Moon },
  { id: "system", label: "System Default", icon: Monitor },
];

export const PreferencesTab = () => {
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  const [currency, setCurrency] = useState("Nigeria Naira (₦)");
  const [rowsPerPage, setRowsPerPage] = useState("25 Rows");
  const [saveOpen, setSaveOpen] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    transactions: true, kyc: true, support: true, system: true, security: true,
  });

  const { data: prefsData, isLoading } = useQuery({
    queryKey: ["admin", "notification-prefs"],
    queryFn: () => api.get("/admin/notifications/preferences").then((r) => r.data),
  });

  // Sync API data into local state
  useEffect(() => {
    if (prefsData) {
      setNotifications({
        transactions: prefsData.transactions ?? true,
        kyc: prefsData.kyc ?? true,
        support: prefsData.support ?? true,
        system: prefsData.system ?? true,
        security: prefsData.security ?? true,
      });
    }
  }, [prefsData]);

  const savePrefs = useMutation({
    mutationFn: () =>
      api.patch("/admin/notifications/preferences", notifications).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "notification-prefs"] });
      toast.success("Preferences saved");
      setSaveOpen(false);
    },
    onError: () => toast.error("Failed to save preferences"),
  });

  const toggleNotification = (key: string) =>
    setNotifications((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-3">
      {/* Notification Preferences */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Choose what you want to be notified about</p>
        </div>
        <div className="space-y-2">
          {notificationKeys.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2.5 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#EFEFEF]/80 dark:hover:bg-[#333]/80 transition-colors"
            >
              <div>
                <p className="text-[12px] font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{description}</p>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-9 rounded-full" />
              ) : (
                <Switch
                  checked={notifications[key]}
                  onCheckedChange={() => toggleNotification(key)}
                  className="data-[state=checked]:bg-green-500 scale-90 flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Appearance + Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Appearance */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
          <div className="mb-3">
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Appearance</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Choose your preferred color theme</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-[12px] border transition-all duration-200",
                  theme === id
                    ? "bg-gradient-to-br from-[#FFE6B0]/60 to-[#FFD98A]/40 dark:from-orange-500/20 dark:to-orange-500/10 border-orange-300/60 dark:border-orange-500/30 shadow-sm"
                    : "bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/40"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  theme === id ? "bg-white/70 dark:bg-[#1C1C1C]/60" : "bg-white/60 dark:bg-[#1C1C1C]/40"
                )}>
                  <Icon className={cn("w-4 h-4", theme === id ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400")} />
                </div>
                <span className={cn("text-[10px] font-semibold", theme === id ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-gray-400")}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Display */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
          <div className="mb-3">
            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Preferred Display</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Choose your preferred display settings</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Default Currency Display", value: currency, setter: setCurrency, options: ["Nigeria Naira (₦)", "US Dollar ($)", "Euro (€)", "British Pound (£)"] },
              { label: "Rows Per Page (Tables)", value: rowsPerPage, setter: setRowsPerPage, options: ["10 Rows", "25 Rows", "50 Rows", "100 Rows"] },
            ].map(({ label, value, setter, options }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <div className="relative">
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/40 focus:border-orange-300 dark:focus:border-orange-500/30 rounded-[10px] text-[12px] font-medium text-gray-800 dark:text-gray-200 cursor-pointer transition-all focus:outline-none"
                  >
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          onClick={() => setSaveOpen(true)}
          className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[12px] font-semibold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-md shadow-orange-500/20"
        >
          Save Changes
        </button>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Save Preferences?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Your notification, appearance, and display settings will be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setSaveOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => savePrefs.mutate()}
              disabled={savePrefs.isPending}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {savePrefs.isPending ? "Saving…" : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};