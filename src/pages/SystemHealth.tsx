import { CheckCircle, RefreshCw, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemHealth } from "@/hooks/useDashboard";

interface Service {
  name: string;
  status: "healthy" | "degraded" | "down";
  message?: string | null;
}

const statusConfig = {
  healthy: {
    dot: "bg-blue-500",
    pulse: "bg-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    label: "Healthy",
  },
  degraded: {
    dot: "bg-orange-500",
    pulse: "bg-orange-400",
    text: "text-orange-600 dark:text-orange-400",
    label: "Degraded",
  },
  down: {
    dot: "bg-red-500",
    pulse: "bg-red-400",
    text: "text-red-600 dark:text-red-400",
    label: "Down",
  },
};

// Backend returns "Healthy", "Degraded", "Down" — normalize to lowercase
const normalizeStatus = (s?: string): Service["status"] => {
  const val = (s ?? "").toLowerCase();
  if (val === "healthy" || val === "ok" || val === "up" || val === "operational") return "healthy";
  if (val === "degraded" || val === "warning" || val === "slow") return "degraded";
  return "down";
};

const StatusIndicator = ({ status }: { status: Service["status"] }) => {
  const { dot, pulse, text, label } = statusConfig[status];
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-1.5 h-1.5">
        <div className={`absolute inset-0 rounded-full ${dot}`} />
        {status !== "healthy" && (
          <div className={`absolute inset-0 rounded-full ${pulse} animate-ping opacity-60`} />
        )}
      </div>
      <span className={`text-[11px] font-semibold ${text}`}>{label}</span>
    </div>
  );
};

const ServiceRow = ({ service, isLoading }: { service?: Service; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    );
  }
  if (!service) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200">
      <div className="min-w-0">
        <span className="font-medium text-gray-800 dark:text-gray-200 text-[12px]">{service.name}</span>
        {service.message && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{service.message}</p>
        )}
      </div>
      <StatusIndicator status={service.status} />
    </div>
  );
};

const SystemHealth = () => {
  const { data, isLoading, refetch, isFetching } = useSystemHealth();

  // Map exact API fields
  const components: Service[] = (data?.components ?? []).map((item: any) => ({
    name: item.name,
    status: normalizeStatus(item.status),
    message: item.message ?? null,
  }));

  // Overall status from API
  const overallStatus = normalizeStatus(data?.overall);
  const allHealthy = overallStatus === "healthy";
  const healthyCount = components.filter((s) => s.status === "healthy").length;
  const totalCount = components.length;

  const lastUpdated = data?.last_updated ?? null;
  const formatTime = (d?: string | null) => {
    if (!d) return "—";
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // No incidents in API — show empty state
  const incidents: any[] = data?.incidents ?? [];

  return (
    <div className="space-y-3">
      {/* Overall Health Banner */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] px-4 py-3 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isLoading ? "bg-gray-100 dark:bg-gray-700/30"
              : allHealthy ? "bg-blue-100 dark:bg-blue-500/20"
              : "bg-orange-100 dark:bg-orange-500/20"
            }`}>
              <Activity className={`w-4 h-4 ${
                isLoading ? "text-gray-400"
                : allHealthy ? "text-blue-600 dark:text-blue-400"
                : "text-orange-600 dark:text-orange-400"
              }`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-[13px]">Platform Health</h2>
              {isLoading ? (
                <Skeleton className="h-3 w-32 mt-1" />
              ) : (
                <p className="text-[11px] text-gray-500 dark:text-gray-500">
                  {totalCount === 0 ? "Loading…" : `${healthyCount}/${totalCount} services operational`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && totalCount > 0 && (
              <Badge className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border-0 ${
                allHealthy
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
              }`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {data?.overall ?? (allHealthy ? "All Systems Go" : "Degraded")}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 rounded-full border-gray-200 dark:border-gray-700 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] h-7 px-3"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
              <span className="text-[11px] font-medium">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* All Components in one card since API doesn't split core vs third-party */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-[13px]">System Components</h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(lastUpdated)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ServiceRow key={i} isLoading />
            ))
          ) : components.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 py-4 col-span-2">No components data</p>
          ) : (
            components.map((service) => (
              <ServiceRow key={service.name} service={service} isLoading={false} />
            ))
          )}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-[13px]">Recent Incidents</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Service disruptions and resolution history
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-[12px]" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-[12px] font-semibold text-gray-900 dark:text-white">No recent incidents</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">All systems have been running smoothly</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-[12px] border border-gray-200/50 dark:border-gray-700/30">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
                    {["Severity", "Incident", "Status", "Started", "Duration", "Impact"].map((h) => (
                      <TableHead key={h} className="text-gray-600 dark:text-gray-400 font-semibold text-[11px] py-2 whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident: any, index: number) => (
                    <TableRow key={incident.id ?? index} className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors border-gray-200/50 dark:border-gray-700/30">
                      <TableCell className="py-2">
                        <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 ${
                          (incident.severity ?? "").toLowerCase() === "critical"
                            ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                            : (incident.severity ?? "").toLowerCase() === "major"
                            ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                            : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                        }`}>
                          {incident.severity ?? "Minor"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white text-[12px] py-2">{incident.title ?? "—"}</TableCell>
                      <TableCell className="py-2">
                        <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 ${
                          (incident.status ?? "").toLowerCase() === "resolved"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        }`}>
                          {incident.status ?? "Ongoing"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2 whitespace-nowrap">{incident.started_at ?? "—"}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2 whitespace-nowrap">{incident.duration ?? "—"}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2">{incident.impact ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2.5">
              {incidents.map((incident: any, index: number) => (
                <div key={incident.id ?? index} className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{incident.severity ?? "Minor"}</span>
                    <Badge className={`px-1.5 py-0 rounded-full text-[9px] font-semibold border-0 ${
                      (incident.status ?? "").toLowerCase() === "resolved"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                    }`}>
                      {incident.status ?? "Ongoing"}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-[12px]">{incident.title ?? "—"}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{incident.impact ?? "—"}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>{incident.started_at ?? "—"}</span>
                    <span>{incident.duration ?? "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;