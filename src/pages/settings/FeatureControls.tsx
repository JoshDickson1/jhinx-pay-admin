import { useState } from "react";
import {
  Power, AlertTriangle, Bitcoin, CreditCard, Gamepad2,
  ArrowUpDown, Send, ArrowDownToLine, ShoppingCart, Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "active" | "paused";
  category: "crypto" | "giftcard" | "games";
  pauseReason?: string;
  pausedUntil?: string;
}

const seedFeatures: Feature[] = [
  { id: "crypto-buy",     name: "Buy Crypto",      description: "Allow users to purchase cryptocurrency", icon: ShoppingCart,    status: "active", category: "crypto"    },
  { id: "crypto-sell",    name: "Sell Crypto",      description: "Allow users to sell cryptocurrency",    icon: Store,           status: "active", category: "crypto"    },
  { id: "crypto-swap",    name: "Swap Crypto",      description: "Allow crypto-to-crypto swaps",          icon: ArrowUpDown,     status: "paused", category: "crypto"    },
  { id: "crypto-send",    name: "Send Crypto",      description: "Allow external crypto transfers",       icon: Send,            status: "active", category: "crypto"    },
  { id: "crypto-receive", name: "Receive Crypto",   description: "Allow crypto deposits",                 icon: ArrowDownToLine, status: "active", category: "crypto"    },
  { id: "gc-buy",         name: "Buy Gift Cards",   description: "Allow users to purchase gift cards",    icon: ShoppingCart,    status: "active", category: "giftcard"  },
  { id: "gc-sell",        name: "Sell Gift Cards",  description: "Allow users to sell gift cards",        icon: Store,           status: "active", category: "giftcard"  },
  { id: "games-topup",    name: "Game Top-ups",     description: "Allow in-game currency purchases",      icon: Gamepad2,        status: "active", category: "games"     },
];

type Category = "crypto" | "giftcard" | "games";

const categoryMeta: Record<Category, { label: string; Icon: React.ElementType }> = {
  crypto:   { label: "Cryptocurrency", Icon: Bitcoin    },
  giftcard: { label: "Gift Cards",     Icon: CreditCard },
  games:    { label: "Gaming",         Icon: Gamepad2   },
};

const FeatureControls = () => {
  const [features, setFeatures] = useState<Feature[]>(seedFeatures);
  const [activeTab, setActiveTab] = useState<Category>("crypto");

  // Pause feature dialog
  const [pauseFeature, setPauseFeature] = useState<Feature | null>(null);
  const [pauseReason, setPauseReason] = useState("");
  const [pauseUntil, setPauseUntil] = useState("");
  const [pauseNotify, setPauseNotify] = useState(true);

  // Pause all dialog
  const [pauseAllCat, setPauseAllCat] = useState<Category | null>(null);
  const [pauseAllReason, setPauseAllReason] = useState("");
  const [pauseAllNotify, setPauseAllNotify] = useState(true);

  const catFeatures = features.filter((f) => f.category === activeTab);
  const activeCount = catFeatures.filter((f) => f.status === "active").length;
  const allPaused = activeCount === 0;

  const doToggle = (f: Feature) => {
    if (f.status === "paused") {
      setFeatures((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "active", pauseReason: undefined, pausedUntil: undefined } : x));
      toast.success(`${f.name} resumed`);
    } else {
      setPauseFeature(f);
      setPauseReason(""); setPauseUntil(""); setPauseNotify(true);
    }
  };

  const confirmPause = () => {
    if (!pauseFeature) return;
    setFeatures((prev) => prev.map((x) => x.id === pauseFeature.id ? { ...x, status: "paused", pauseReason: pauseReason || "Manually paused", pausedUntil: pauseUntil || undefined } : x));
    toast.success(`${pauseFeature.name} paused`);
    setPauseFeature(null);
  };

  const doPauseAll = () => {
    if (allPaused) {
      setFeatures((prev) => prev.map((x) => x.category === activeTab ? { ...x, status: "active", pauseReason: undefined, pausedUntil: undefined } : x));
      toast.success(`All ${categoryMeta[activeTab].label} features resumed`);
    } else {
      setPauseAllCat(activeTab);
      setPauseAllReason(""); setPauseAllNotify(true);
    }
  };

  const confirmPauseAll = () => {
    if (!pauseAllCat) return;
    setFeatures((prev) => prev.map((x) => x.category === pauseAllCat ? { ...x, status: "paused", pauseReason: pauseAllReason || "Category-wide pause" } : x));
    toast.success(`All ${categoryMeta[pauseAllCat].label} features paused`);
    setPauseAllCat(null);
  };

  return (
    <div className="space-y-3 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feature Control</h1>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Pause or enable platform features for maintenance</p>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-1 w-fit">
        {(["crypto", "giftcard", "games"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === cat
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {categoryMeta[cat].label}
          </button>
        ))}
      </div>

      {/* Category card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80 dark:border-gray-700/20">
          <div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">{categoryMeta[activeTab].label}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {activeCount} of {catFeatures.length} feature{catFeatures.length !== 1 ? "s" : ""} Active
            </p>
          </div>
          <button
            onClick={doPauseAll}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all shadow-sm",
              allPaused
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20"
                : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
            )}
          >
            <Power className="w-3.5 h-3.5" />
            {allPaused ? "Resume All" : "Pause All"}
          </button>
        </div>

        {/* Features list */}
        <div className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
          {catFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#F5F5F5]/30 dark:hover:bg-[#2D2B2B]/30 transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{f.name}</span>
                      <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5 border bg-transparent",
                        f.status === "active"
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-orange-400 text-orange-600 dark:text-orange-400"
                      )}>
                        {f.status === "active" ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{f.description}</p>
                    {f.pauseReason && (
                      <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1">
                        Reason: {f.pauseReason}{f.pausedUntil && ` · Until: ${f.pausedUntil}`}
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={f.status === "active"}
                  onCheckedChange={() => doToggle(f)}
                  className="data-[state=checked]:bg-green-500 ml-4"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pause Feature Dialog ── */}
      <Dialog open={!!pauseFeature} onOpenChange={() => setPauseFeature(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Pause Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <Input
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Reason for pausing"
              className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
            />
            <div className="relative">
              <Input
                type="datetime-local"
                value={pauseUntil}
                onChange={(e) => setPauseUntil(e.target.value)}
                placeholder="Expected Resume Time"
                className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notify"
                checked={pauseNotify}
                onCheckedChange={(v) => setPauseNotify(!!v)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
              />
              <Label htmlFor="notify" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">Notify Users</Label>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={confirmPause}
              className="w-full py-2.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
            >
              Pause Features
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Pause All Dialog ── */}
      <Dialog open={!!pauseAllCat} onOpenChange={() => setPauseAllCat(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              Pause All {pauseAllCat ? categoryMeta[pauseAllCat].label : ""} Features
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-orange-50/60 dark:bg-orange-500/8 rounded-[12px] border border-orange-200/50 dark:border-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-700 dark:text-orange-400">
                This will immediately disable all {pauseAllCat ? categoryMeta[pauseAllCat].label.toLowerCase() : ""} features for all users.
              </p>
            </div>
            <Input
              value={pauseAllReason}
              onChange={(e) => setPauseAllReason(e.target.value)}
              placeholder="Reason for pausing"
              className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
            />
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notify-all"
                checked={pauseAllNotify}
                onCheckedChange={(v) => setPauseAllNotify(!!v)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]"
              />
              <Label htmlFor="notify-all" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">Notify Users</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setPauseAllCat(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={confirmPauseAll} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
              Pause All
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureControls;