import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemHealth } from "@/hooks/useDashboard";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  lastChecked: string;
  message?: string;
}

const StatusIcon = ({ status }: { status: ServiceStatus["status"] }) => {
  const config = {
    operational: { icon: CheckCircle, className: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20" },
    degraded: { icon: AlertTriangle, className: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" },
    down: { icon: XCircle, className: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20" },
  };
  const { icon: Icon, className } = config[status] ?? config.operational;
  return (
    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${className} shadow-sm`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
  );
};

const StatusBadge = ({ status }: { status: ServiceStatus["status"] }) => {
  const config = {
    operational: { text: "Operational", className: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20" },
    degraded: { text: "Degraded", className: "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" },
    down: { text: "Down", className: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20" },
  };
  const cfg = config[status] ?? config.operational;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.className} border-0`}>
      {cfg.text}
    </span>
  );
};

// Normalize backend status strings to our three states
const normalizeStatus = (s?: string): ServiceStatus["status"] => {
  const val = (s ?? "").toLowerCase();
  if (val === "operational" || val === "ok" || val === "healthy" || val === "up") return "operational";
  if (val === "degraded" || val === "warning" || val === "slow") return "degraded";
  return "down";
};

const formatChecked = (dateStr?: string) => {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 10) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

export const SystemHealth = () => {
  const { data, isLoading, refetch, isFetching } = useSystemHealth();

  // Normalize whatever shape the backend returns
  const raw: any[] =
    data?.components ?? data?.services ?? data?.items ??
    (Array.isArray(data) ? data : []);

  const topLevelTime = data?.last_updated ?? data?.checked_at ?? null;

const services: ServiceStatus[] = raw.map((item: any) => ({
  name: item.name ?? item.component ?? item.service ?? "Unknown",
  status: normalizeStatus(item.status ?? item.health),
  lastChecked: formatChecked(
    item.last_checked ?? item.checked_at ?? item.updated_at ?? topLevelTime
  ),
  message: item.message ?? item.description ?? undefined,
}));

  const allOperational = services.length > 0 && services.every((s) => s.status === "operational");

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shadow-sm ${
            allOperational
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : "bg-gradient-to-br from-orange-400 to-orange-600"
          }`}>
            {allOperational
              ? <CheckCircle className="w-[18px] h-[18px] text-white" />
              : <AlertTriangle className="w-[18px] h-[18px] text-white" />
            }
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">
            {isLoading ? "Checking systems…" : allOperational ? "All Systems Operational" : "System Status Issues"}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] rounded-[12px] h-9 px-3"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="text-[13px] font-medium">Refresh</span>
        </Button>
      </div>

      {/* Services List */}
      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-9 h-9 rounded-[12px]" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 hidden sm:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-400 dark:text-gray-500">
            No system data available
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.name}
              className="p-4 flex items-center justify-between hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusIcon status={service.status} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-[13px] mb-0.5">
                    {service.name}
                  </p>
                  {service.message && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate">
                      {service.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-gray-500 dark:text-gray-500 hidden sm:inline">
                  {service.lastChecked}
                </span>
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};