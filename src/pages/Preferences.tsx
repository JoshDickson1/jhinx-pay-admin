import { useState } from "react";
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  Volume2,
  Mail,
  Smartphone,
  Globe,
  Clock,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

const Preferences = () => {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    desktopNotifications: false,
    
    // Notification types
    newTransactions: true,
    kycUpdates: true,
    supportTickets: true,
    systemAlerts: true,
    securityAlerts: true,
    weeklyReports: false,
    
    // Display
    language: "en",
    timezone: "WAT",
    dateFormat: "DD/MM/YYYY",
    currency: "NGN",
    
    // Table preferences
    rowsPerPage: "25",
    compactMode: false,
  });

  const handleSave = () => {
    toast.success("Preferences saved successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
          <p className="text-muted-foreground mt-1">Customize your admin panel experience</p>
        </div>
        <Button variant="accent" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the admin panel looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <RadioGroup 
                value={theme} 
                onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}
                className="grid grid-cols-3 gap-3"
              >
                <label 
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "light" ? "border-orange-500 bg-orange-500/5" : "border-border bg-surface-1"
                  }`}
                >
                  <RadioGroupItem value="light" className="sr-only" />
                  <Sun className={`w-6 h-6 ${theme === "light" ? "text-orange-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${theme === "light" ? "text-orange-500" : "text-foreground"}`}>Light</span>
                </label>
                <label 
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "dark" ? "border-orange-500 bg-orange-500/5" : "border-border bg-surface-1"
                  }`}
                >
                  <RadioGroupItem value="dark" className="sr-only" />
                  <Moon className={`w-6 h-6 ${theme === "dark" ? "text-orange-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${theme === "dark" ? "text-orange-500" : "text-foreground"}`}>Dark</span>
                </label>
                <label 
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === "system" ? "border-orange-500 bg-orange-500/5" : "border-border bg-surface-1"
                  }`}
                >
                  <RadioGroupItem value="system" className="sr-only" />
                  <Monitor className={`w-6 h-6 ${theme === "system" ? "text-orange-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${theme === "system" ? "text-orange-500" : "text-foreground"}`}>System</span>
                </label>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Use smaller spacing in tables and lists</p>
              </div>
              <Switch 
                checked={preferences.compactMode}
                onCheckedChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch 
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications</p>
                </div>
              </div>
              <Switch 
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Sound Alerts</Label>
                  <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
                </div>
              </div>
              <Switch 
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => setPreferences({ ...preferences, soundEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show browser notifications</p>
                </div>
              </div>
              <Switch 
                checked={preferences.desktopNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, desktopNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Notification Types</CardTitle>
            <CardDescription>Select which events trigger notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "newTransactions", label: "New Transactions", desc: "Gift card submissions, crypto trades" },
              { key: "kycUpdates", label: "KYC Updates", desc: "New submissions and status changes" },
              { key: "supportTickets", label: "Support Tickets", desc: "New tickets and replies" },
              { key: "systemAlerts", label: "System Alerts", desc: "Maintenance and updates" },
              { key: "securityAlerts", label: "Security Alerts", desc: "Suspicious activity and fraud" },
              { key: "weeklyReports", label: "Weekly Reports", desc: "Weekly summary emails" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <Label>{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch 
                  checked={preferences[item.key as keyof typeof preferences] as boolean}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, [item.key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              Regional Settings
            </CardTitle>
            <CardDescription>Localization and format preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select 
                value={preferences.timezone} 
                onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAT">West Africa Time (WAT)</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                  <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                  <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={preferences.dateFormat} 
                onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Currency Display</Label>
              <Select 
                value={preferences.currency} 
                onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rows Per Page (Tables)</Label>
              <Select 
                value={preferences.rowsPerPage} 
                onValueChange={(value) => setPreferences({ ...preferences, rowsPerPage: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;
