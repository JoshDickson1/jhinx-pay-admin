import { useState } from "react";
import { 
  Power, 
  AlertTriangle,
  Bitcoin,
  CreditCard,
  Gamepad2,
  ArrowUpDown,
  Send,
  ArrowDownToLine,
  ShoppingCart,
  Store,
  Wrench,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "paused" | "maintenance";
  category: "crypto" | "giftcard" | "games";
  lastChanged?: string;
  pauseReason?: string;
  pausedUntil?: string;
}

const initialFeatures: Feature[] = [
  // Crypto features
  { id: "crypto-buy", name: "Buy Crypto", description: "Allow users to purchase cryptocurrency", icon: ShoppingCart, status: "active", category: "crypto" },
  { id: "crypto-sell", name: "Sell Crypto", description: "Allow users to sell cryptocurrency", icon: Store, status: "active", category: "crypto" },
  { id: "crypto-swap", name: "Swap Crypto", description: "Allow crypto-to-crypto swaps", icon: ArrowUpDown, status: "active", category: "crypto" },
  { id: "crypto-send", name: "Send Crypto", description: "Allow external crypto transfers", icon: Send, status: "paused", category: "crypto", pauseReason: "Security review in progress", lastChanged: "2 hours ago" },
  { id: "crypto-receive", name: "Receive Crypto", description: "Allow crypto deposits", icon: ArrowDownToLine, status: "active", category: "crypto" },
  
  // Gift card features
  { id: "giftcard-buy", name: "Buy Gift Cards", description: "Allow users to purchase gift cards", icon: ShoppingCart, status: "active", category: "giftcard" },
  { id: "giftcard-sell", name: "Sell Gift Cards", description: "Allow users to sell gift cards", icon: Store, status: "active", category: "giftcard" },
  
  // Game features
  { id: "games-topup", name: "Game Top-ups", description: "Allow in-game currency purchases", icon: Gamepad2, status: "maintenance", category: "games", pauseReason: "API provider maintenance", pausedUntil: "Jan 15, 2026 6:00 AM" },
];

const categoryLabels = {
  crypto: "Cryptocurrency",
  giftcard: "Gift Cards",
  games: "Gaming",
};

const categoryIcons = {
  crypto: Bitcoin,
  giftcard: CreditCard,
  games: Gamepad2,
};

const FeatureControls = () => {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [pauseDialog, setPauseDialog] = useState<{
    feature: Feature | null;
    isOpen: boolean;
  }>({ feature: null, isOpen: false });
  const [pauseForm, setPauseForm] = useState({
    reason: "",
    duration: "",
    notifyUsers: true,
  });
  const [categoryPauseDialog, setCategoryPauseDialog] = useState<{
    category: "crypto" | "giftcard" | "games" | null;
    isOpen: boolean;
  }>({ category: null, isOpen: false });

  const getStatusBadge = (status: Feature["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Active</Badge>;
      case "paused":
        return <Badge variant="warning" className="gap-1"><XCircle className="w-3 h-3" />Paused</Badge>;
      case "maintenance":
        return <Badge variant="info" className="gap-1"><Wrench className="w-3 h-3" />Maintenance</Badge>;
    }
  };

  const handleToggleFeature = (feature: Feature) => {
    if (feature.status === "active") {
      setPauseDialog({ feature, isOpen: true });
    } else {
      // Resume the feature
      setFeatures(prev => prev.map(f => 
        f.id === feature.id 
          ? { ...f, status: "active", pauseReason: undefined, pausedUntil: undefined, lastChanged: "Just now" }
          : f
      ));
      toast.success(`${feature.name} has been resumed`);
    }
  };

  const handlePauseConfirm = () => {
    if (!pauseDialog.feature) return;
    
    setFeatures(prev => prev.map(f => 
      f.id === pauseDialog.feature!.id 
        ? { 
            ...f, 
            status: "paused" as const, 
            pauseReason: pauseForm.reason, 
            pausedUntil: pauseForm.duration || undefined,
            lastChanged: "Just now"
          }
        : f
    ));
    
    toast.success(`${pauseDialog.feature.name} has been paused`);
    setPauseDialog({ feature: null, isOpen: false });
    setPauseForm({ reason: "", duration: "", notifyUsers: true });
  };

  const handlePauseCategory = (category: "crypto" | "giftcard" | "games") => {
    const categoryFeatures = features.filter(f => f.category === category);
    const allPaused = categoryFeatures.every(f => f.status !== "active");
    
    if (allPaused) {
      // Resume all
      setFeatures(prev => prev.map(f => 
        f.category === category 
          ? { ...f, status: "active", pauseReason: undefined, pausedUntil: undefined, lastChanged: "Just now" }
          : f
      ));
      toast.success(`All ${categoryLabels[category]} features have been resumed`);
    } else {
      setCategoryPauseDialog({ category, isOpen: true });
    }
  };

  const handleCategoryPauseConfirm = () => {
    if (!categoryPauseDialog.category) return;
    
    setFeatures(prev => prev.map(f => 
      f.category === categoryPauseDialog.category 
        ? { 
            ...f, 
            status: "paused" as const, 
            pauseReason: pauseForm.reason || "Category-wide pause", 
            lastChanged: "Just now"
          }
        : f
    ));
    
    toast.success(`All ${categoryLabels[categoryPauseDialog.category]} features have been paused`);
    setCategoryPauseDialog({ category: null, isOpen: false });
    setPauseForm({ reason: "", duration: "", notifyUsers: true });
  };

  const groupedFeatures = {
    crypto: features.filter(f => f.category === "crypto"),
    giftcard: features.filter(f => f.category === "giftcard"),
    games: features.filter(f => f.category === "games"),
  };

  const getCategoryStatus = (category: "crypto" | "giftcard" | "games") => {
    const categoryFeatures = groupedFeatures[category];
    const activeCount = categoryFeatures.filter(f => f.status === "active").length;
    const totalCount = categoryFeatures.length;
    
    if (activeCount === totalCount) return "all-active";
    if (activeCount === 0) return "all-paused";
    return "partial";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feature Controls</h1>
          <p className="text-muted-foreground mt-1">Pause or enable platform features for maintenance</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="border-warning/50 bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Caution</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Pausing features will immediately affect all users. Consider sending a system notification before disabling critical features.
        </AlertDescription>
      </Alert>

      {/* Feature Categories */}
      <div className="space-y-6">
        {(["crypto", "giftcard", "games"] as const).map((category) => {
          const CategoryIcon = categoryIcons[category];
          const categoryStatus = getCategoryStatus(category);
          
          return (
            <Card key={category} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{categoryLabels[category]}</CardTitle>
                      <CardDescription>
                        {groupedFeatures[category].filter(f => f.status === "active").length} of {groupedFeatures[category].length} features active
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant={categoryStatus === "all-paused" ? "accent" : "destructive"}
                    size="sm"
                    onClick={() => handlePauseCategory(category)}
                    className="gap-2"
                  >
                    <Power className="w-4 h-4" />
                    {categoryStatus === "all-paused" ? "Resume All" : "Pause All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedFeatures[category].map((feature) => (
                    <div 
                      key={feature.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        feature.status === "active" 
                          ? "bg-surface-1 border-border" 
                          : "bg-warning/5 border-warning/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          feature.status === "active" ? "bg-success/10" : "bg-warning/10"
                        }`}>
                          <feature.icon className={`w-5 h-5 ${
                            feature.status === "active" ? "text-success" : "text-warning"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{feature.name}</p>
                            {getStatusBadge(feature.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                          {feature.pauseReason && (
                            <p className="text-xs text-warning mt-1">
                              Reason: {feature.pauseReason}
                              {feature.pausedUntil && ` • Until: ${feature.pausedUntil}`}
                            </p>
                          )}
                          {feature.lastChanged && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last changed: {feature.lastChanged}
                            </p>
                          )}
                        </div>
                      </div>
                      <Switch 
                        checked={feature.status === "active"}
                        onCheckedChange={() => handleToggleFeature(feature)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pause Feature Dialog */}
      <Dialog open={pauseDialog.isOpen} onOpenChange={(open) => setPauseDialog({ ...pauseDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pause {pauseDialog.feature?.name}
            </DialogTitle>
            <DialogDescription>
              This will immediately disable this feature for all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for pausing</Label>
              <Textarea
                value={pauseForm.reason}
                onChange={(e) => setPauseForm({ ...pauseForm, reason: e.target.value })}
                placeholder="e.g., Scheduled maintenance, Security review, API issues..."
                className="bg-surface-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Expected resume time (optional)</Label>
              <Input
                type="datetime-local"
                value={pauseForm.duration}
                onChange={(e) => setPauseForm({ ...pauseForm, duration: e.target.value })}
                className="bg-surface-1"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
              <div>
                <Label>Notify users</Label>
                <p className="text-xs text-muted-foreground">Send push notification to affected users</p>
              </div>
              <Switch 
                checked={pauseForm.notifyUsers}
                onCheckedChange={(checked) => setPauseForm({ ...pauseForm, notifyUsers: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialog({ feature: null, isOpen: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePauseConfirm} className="gap-2">
              <Power className="w-4 h-4" />
              Pause Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Category Dialog */}
      <Dialog open={categoryPauseDialog.isOpen} onOpenChange={(open) => setCategoryPauseDialog({ ...categoryPauseDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pause All {categoryPauseDialog.category && categoryLabels[categoryPauseDialog.category]} Features
            </DialogTitle>
            <DialogDescription>
              This will immediately disable all {categoryPauseDialog.category && categoryLabels[categoryPauseDialog.category].toLowerCase()} features for all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for pausing</Label>
              <Textarea
                value={pauseForm.reason}
                onChange={(e) => setPauseForm({ ...pauseForm, reason: e.target.value })}
                placeholder="e.g., Scheduled maintenance, Provider issues..."
                className="bg-surface-1"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
              <div>
                <Label>Notify users</Label>
                <p className="text-xs text-muted-foreground">Send push notification to all users</p>
              </div>
              <Switch 
                checked={pauseForm.notifyUsers}
                onCheckedChange={(checked) => setPauseForm({ ...pauseForm, notifyUsers: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryPauseDialog({ category: null, isOpen: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCategoryPauseConfirm} className="gap-2">
              <Power className="w-4 h-4" />
              Pause All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureControls;
