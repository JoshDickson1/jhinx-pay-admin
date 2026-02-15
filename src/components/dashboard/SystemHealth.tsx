import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  lastChecked: string;
  message?: string;
}

const services: ServiceStatus[] = [
  { name: "Core API", status: "operational", lastChecked: "Just now" },
  { name: "Payment Gateway (Flutterwave)", status: "degraded", lastChecked: "5 min ago", message: "Slow response times detected" },
  { name: "Gift Cards API (Reloadly)", status: "down", lastChecked: "15 min ago", message: "Service unavailable" },
  { name: "Crypto Exchange", status: "operational", lastChecked: "2 min ago" },
  { name: "SMS Gateway", status: "operational", lastChecked: "1 min ago" },
];

const StatusIcon = ({ status }: { status: ServiceStatus["status"] }) => {
  const config = {
    operational: {
      icon: CheckCircle,
      className: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20",
    },
    degraded: {
      icon: AlertTriangle,
      className: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20",
    },
    down: {
      icon: XCircle,
      className: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20",
    },
  };

  const { icon: Icon, className } = config[status];

  return (
    <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${className} shadow-sm`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
  );
};

const StatusBadge = ({ status }: { status: ServiceStatus["status"] }) => {
  const config = {
    operational: { 
      text: "Operational", 
      className: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20" 
    },
    degraded: { 
      text: "Degraded", 
      className: "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20" 
    },
    down: { 
      text: "Down", 
      className: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20" 
    },
  };

  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${config[status].className} border-0`}>
      {config[status].text}
    </span>
  );
};

export const SystemHealth = () => {
  const allOperational = services.every((s) => s.status === "operational");
  const hasIssues = services.some((s) => s.status !== "operational");

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
            {allOperational ? (
              <CheckCircle className="w-[18px] h-[18px] text-white" />
            ) : (
              <AlertTriangle className="w-[18px] h-[18px] text-white" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">
            {allOperational ? "All Systems Operational" : "System Status Issues"}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] rounded-[12px] h-9 px-3"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-[13px] font-medium">Refresh</span>
        </Button>
      </div>

      {/* Services List */}
      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/30">
        {services.map((service) => (
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
        ))}
      </div>
    </div>
  );
};