import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface Service {
  name: string;
  status: "healthy" | "degraded" | "down";
}

interface Incident {
  severity: "Minor" | "Major" | "Critical";
  title: string;
  status: "Ongoing" | "Resolved" | "Investigating";
  started: string;
  duration: string;
  impact: string;
}

const coreServices: Service[] = [
  { name: "API Gateway", status: "healthy" },
  { name: "Auth Service", status: "healthy" },
  { name: "Wallet Engine", status: "degraded" },
  { name: "Transaction Engine", status: "healthy" },
  { name: "Notification Service", status: "healthy" },
];

const thirdPartyProviders: Service[] = [
  { name: "Flutterwave (Payments)", status: "degraded" },
  { name: "Reloadly (Gift Cards)", status: "down" },
  { name: "Binance (Crypto Rates)", status: "healthy" },
  { name: "SMS Gateway (OTP)", status: "healthy" },
];

const recentIncidents: Incident[] = [
  {
    severity: "Minor",
    title: "Wallet Latency",
    status: "Ongoing",
    started: "Feb 11 03:15",
    duration: "32m",
    impact: "Slow balance updates",
  },
  {
    severity: "Major",
    title: "Reloadly API Outage",
    status: "Resolved",
    started: "Feb 10 09:24",
    duration: "1h 18m",
    impact: "Gift card approvals delayed",
  },
];

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

const SystemHealth = () => {
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const allHealthy = [...coreServices, ...thirdPartyProviders].every(
    (s) => s.status === "healthy"
  );

  const handleRefresh = () => {
    setLastUpdated("Just now");
  };

  const healthyCount = [...coreServices, ...thirdPartyProviders].filter(s => s.status === "healthy").length;
  const totalCount = coreServices.length + thirdPartyProviders.length;

  return (
    <div className="space-y-3">
      {/* Overall Health Banner */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] px-4 py-3 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allHealthy ? "bg-blue-100 dark:bg-blue-500/20" : "bg-orange-100 dark:bg-orange-500/20"}`}>
              <Activity className={`w-4 h-4 ${allHealthy ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-[13px]">Platform Health</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-500">{healthyCount}/{totalCount} services operational</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border-0 ${
                allHealthy
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
              }`}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {allHealthy ? "All Systems Go" : "Degraded"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 rounded-full border-gray-200 dark:border-gray-700 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] h-7 px-3"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-[11px] font-medium">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Core Platform Services */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-[13px]">Core Services</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated}
            </span>
          </div>
          <div className="space-y-1.5">
            {coreServices.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200 text-[12px]">
                  {service.name}
                </span>
                <StatusIndicator status={service.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Third-Party Providers */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-[13px]">Third-Party Providers</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated}
            </span>
          </div>
          <div className="space-y-1.5">
            {thirdPartyProviders.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200 text-[12px]">
                  {service.name}
                </span>
                <StatusIndicator status={service.status} />
              </div>
            ))}
          </div>
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

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-[12px] border border-gray-200/50 dark:border-gray-700/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
                {["Severity", "Incident", "Status", "Started", "Duration", "Impact", ""].map((h) => (
                  <TableHead key={h} className="text-gray-600 dark:text-gray-400 font-semibold text-[11px] py-2">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIncidents.map((incident, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors border-gray-200/50 dark:border-gray-700/30"
                >
                  <TableCell className="py-2">
                    <Badge
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 ${
                        incident.severity === "Critical"
                          ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          : incident.severity === "Major"
                          ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white text-[12px] py-2">
                    {incident.title}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 ${
                        incident.status === "Resolved"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : incident.status === "Ongoing"
                          ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2">{incident.started}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2">{incident.duration}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 text-[11px] py-2">{incident.impact}</TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[8px] h-6 px-2 text-[11px] font-medium"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2.5">
          {recentIncidents.map((incident, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[12px] p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                      {incident.severity}
                    </span>
                    <Badge
                      className={`px-1.5 py-0 rounded-full text-[9px] font-semibold border-0 ${
                        incident.status === "Resolved"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : incident.status === "Ongoing"
                          ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {incident.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-[12px]">
                    {incident.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {incident.impact}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                  <span>{incident.started}</span>
                  <span>{incident.duration}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[8px] h-6 px-2 text-[11px] font-medium"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;