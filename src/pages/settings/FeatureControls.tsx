import {
  Power, AlertTriangle, Bitcoin, CreditCard, Gamepad2,
  ArrowUpDown, Send, ArrowDownToLine, ShoppingCart, Store,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

interface PlatformFeature {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  pause_reason: string | null;
  expected_resume_at: string | null;
  paused_at: string | null;
  paused_by_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryFeatureGroup {
  category: string;
  total_count: number;
  active_count: number;
  features: PlatformFeature[];
}

interface FeaturesResponse {
  categories: CategoryFeatureGroup[];
}

const CATEGORIES = ["Cryptocurrency", "Gift Cards", "Gaming"] as const;
type Category = typeof CATEGORIES[number];

const categoryMeta: Record<Category, { label: string; Icon: React.ElementType }> = {
  "Cryptocurrency": { label: "Cryptocurrency", Icon: Bitcoin    },
  "Gift Cards":     { label: "Gift Cards",     Icon: CreditCard },
  "Gaming":         { label: "Gaming",         Icon: Gamepad2   },
};

const slugIconMap: Record<string, React.ElementType> = {
  crypto_buy:     ShoppingCart,
  crypto_sell:    Store,
  crypto_swap:    ArrowUpDown,
  crypto_send:    Send,
  crypto_receive: ArrowDownToLine,
  giftcard_buy:   ShoppingCart,
  giftcard_sell:  Store,
  gaming_topup:   Gamepad2,
};

const getIcon = (slug: string): React.ElementType => slugIconMap[slug] ?? Power;

const formatDate = (d: string | null) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const FeatureControls = () => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Category>("Cryptocurrency");
  const [pauseTarget, setPauseTarget]       = useState<PlatformFeature | null>(null);
  const [pauseReason, setPauseReason]       = useState("");
  const [pauseUntil, setPauseUntil]         = useState("");
  const [pauseNotify, setPauseNotify]       = useState(true);
  const [pauseAllCat, setPauseAllCat]       = useState<Category | null>(null);
  const [pauseAllReason, setPauseAllReason] = useState("");
  const [pauseAllNotify, setPauseAllNotify] = useState(true);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<FeaturesResponse>({
    queryKey: ["platform-features"],
    queryFn: () => api.get("/admin/features").then((r) => r.data),
  });

  const featuresByCategory: Record<string, PlatformFeature[]> = {};
  (data?.categories ?? []).forEach((g) => { featuresByCategory[g.category] = g.features; });

  const catFeatures: PlatformFeature[] = featuresByCategory[activeTab] ?? [];
  const activeCount = catFeatures.filter((f) => f.is_active).length;
  const allPaused   = catFeatures.length > 0 && activeCount === 0;

  const pauseMutation = useMutation({
    mutationFn: ({ slug, reason, until }: { slug: string; reason?: string; until?: string }) =>
      api.post(`/admin/features/${slug}/pause`, {
        reason: reason || undefined,
        expected_resume_at: until || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-features"] });
      toast.success("Feature paused");
      setPauseTarget(null); setPauseReason(""); setPauseUntil("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to pause feature";
      toast.error(typeof msg === "string" ? msg : "Failed to pause feature");
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (slug: string) => api.post(`/admin/features/${slug}/resume`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-features"] });
      toast.success("Feature resumed");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to resume feature";
      toast.error(typeof msg === "string" ? msg : "Failed to resume feature");
    },
  });

  const pauseAllMutation = useMutation({
    mutationFn: ({ category, reason }: { category: Category; reason?: string }) =>
      api.post(`/admin/features/category/${category}/pause-all`, {
        reason: reason || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-features"] });
      toast.success(`All ${pauseAllCat} features paused`);
      setPauseAllCat(null); setPauseAllReason("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? "Failed to pause all features";
      toast.error(typeof msg === "string" ? msg : "Failed to pause all features");
    },
  });

  const resumeAllMutation = useMutation({
    mutationFn: async (category: Category) => {
      const paused = (featuresByCategory[category] ?? []).filter((f) => !f.is_active);
      await Promise.all(paused.map((f) => api.post(`/admin/features/${f.slug}/resume`, {})));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-features"] });
      toast.success(`All ${activeTab} features resumed`);
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ["platform-features"] });
      toast.error("Some features could not be resumed — check individually");
    },
  });

  const handleToggle = (f: PlatformFeature) => {
    if (!f.is_active) { resumeMutation.mutate(f.slug); }
    else { setPauseTarget(f); setPauseReason(""); setPauseUntil(""); setPauseNotify(true); }
  };

  const handlePauseAll = () => {
    if (allPaused) { resumeAllMutation.mutate(activeTab); }
    else { setPauseAllCat(activeTab); setPauseAllReason(""); setPauseAllNotify(true); }
  };

  const isBusy = pauseMutation.isPending || resumeMutation.isPending || pauseAllMutation.isPending || resumeAllMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feature Control</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Pause or enable platform features for maintenance</p>
        </div>
        <Skeleton className="h-10 w-72 rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[16px]" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 animate-fade-in">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feature Control</h1>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-[16px] p-6 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Failed to load platform features</p>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white transition-all shadow-md">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feature Control</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Pause or enable platform features for maintenance</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm disabled:opacity-60">
          <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-1 w-fit">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveTab(cat)} className={cn("px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 whitespace-nowrap", activeTab === cat ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/20" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")}>
            {categoryMeta[cat].label}
          </button>
        ))}
      </div>

      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80 dark:border-gray-700/20">
          <div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">{categoryMeta[activeTab].label}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{activeCount} of {catFeatures.length} feature{catFeatures.length !== 1 ? "s" : ""} active</p>
          </div>
          <button onClick={handlePauseAll} disabled={isBusy || catFeatures.length === 0} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed", allPaused ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20")}>
            {(pauseAllMutation.isPending || resumeAllMutation.isPending) ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
            {allPaused ? "Resume All" : "Pause All"}
          </button>
        </div>

        {catFeatures.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12px] text-gray-400 dark:text-gray-500">No features found for this category</div>
        ) : (
          <div className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
            {catFeatures.map((f) => {
              const Icon = getIcon(f.slug);
              const paused = !f.is_active;
              const isThisToggling = (pauseMutation.isPending && pauseTarget?.slug === f.slug) || (resumeMutation.isPending);
              return (
                <div key={f.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#F5F5F5]/30 dark:hover:bg-[#2D2B2B]/30 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{f.name}</span>
                        <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-0.5 border bg-transparent", paused ? "border-orange-400 text-orange-600 dark:text-orange-400" : "border-green-500 text-green-600 dark:text-green-400")}>
                          {paused ? "Paused" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{f.description}</p>
                      {paused && f.pause_reason && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1">
                          Reason: {f.pause_reason}
                          {f.expected_resume_at && ` · Resumes: ${formatDate(f.expected_resume_at)}`}
                          {f.paused_at && ` · Paused: ${formatDate(f.paused_at)}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch checked={f.is_active} disabled={isThisToggling || isBusy} onCheckedChange={() => handleToggle(f)} className="data-[state=checked]:bg-green-500 ml-4 disabled:opacity-50" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pause single dialog */}
      <Dialog open={!!pauseTarget} onOpenChange={() => setPauseTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Pause "{pauseTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <Input value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} placeholder="Reason for pausing (optional)" className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            <div className="space-y-1">
              <Label className="text-[11px] text-gray-500 dark:text-gray-400">Expected resume time (optional)</Label>
              <Input type="datetime-local" value={pauseUntil} onChange={(e) => setPauseUntil(e.target.value)} className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            </div>
            <style>{`
  .dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1) opacity(6);
  }
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 5;
  }
  input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
    opacity: 0.8;
  }
`}</style>
            <div className="flex items-center gap-2.5">
              <Checkbox id="notify" checked={pauseNotify} onCheckedChange={(v) => setPauseNotify(!!v)} className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]" />
              <Label htmlFor="notify" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">Notify users</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setPauseTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={pauseMutation.isPending} onClick={() => pauseTarget && pauseMutation.mutate({ slug: pauseTarget.slug, reason: pauseReason || undefined, until: pauseUntil || undefined })} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-1.5">
              {pauseMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pausing…</> : "Pause Feature"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause all dialog */}
      <Dialog open={!!pauseAllCat} onOpenChange={() => setPauseAllCat(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Pause All {pauseAllCat} Features?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-orange-50/60 dark:bg-orange-500/10 rounded-[12px] border border-orange-200/50 dark:border-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-700 dark:text-orange-400">This will immediately disable all {pauseAllCat?.toLowerCase()} features for all users.</p>
            </div>
            <Input value={pauseAllReason} onChange={(e) => setPauseAllReason(e.target.value)} placeholder="Reason for pausing (optional)" className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            <div className="flex items-center gap-2.5">
              <Checkbox id="notify-all" checked={pauseAllNotify} onCheckedChange={(v) => setPauseAllNotify(!!v)} className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-[4px]" />
              <Label htmlFor="notify-all" className="text-[12px] font-normal text-gray-700 dark:text-gray-300 cursor-pointer">Notify users</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setPauseAllCat(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={pauseAllMutation.isPending} onClick={() => pauseAllCat && pauseAllMutation.mutate({ category: pauseAllCat, reason: pauseAllReason || undefined })} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-60 flex items-center justify-center gap-1.5">
              {pauseAllMutation.isPending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pausing…</> : "Pause All"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureControls;