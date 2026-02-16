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

const StatusIndicator = ({ status }: { status: Service["status"] }) => {
  const config = {
    healthy: {
      dot: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      label: "Healthy",
    },
    degraded: {
      dot: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      label: "Downgraded",
    },
    down: {
      dot: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      label: "Down",
    },
  };

  const { dot, text, label } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`text-[13px] font-medium ${text}`}>{label}</span>
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
    // Add your refresh logic here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-[15px] font-medium text-gray-600 dark:text-gray-400">
          Real-time platform stability status
        </h1>
      </div>

      {/* Overall Health Banner */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full p-5 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-[20px]">
              Overall Health
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-0 ${
                allHealthy
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {allHealthy ? "Healthy" : "Degraded"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2 rounded-full border-gray-200 dark:border-gray-700 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] h-9 px-4"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[13px] font-medium">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Platform Services */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-[18px]">
              Core Platform Services
            </h3>
            <span className="text-[12px] text-gray-500 dark:text-gray-500">
              Last updated: {lastUpdated}
            </span>
          </div>
          <div className="space-y-3">
            {coreServices.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[16px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200 cursor-pointer group"
              >
                <span className="font-medium text-gray-900 dark:text-white text-[14px]">
                  {service.name}
                </span>
                <StatusIndicator status={service.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Third-Party Providers */}
        <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-[18px]">
              Third-Party Providers
            </h3>
            <span className="text-[12px] text-gray-500 dark:text-gray-500">
              Last updated: {lastUpdated}
            </span>
          </div>
          <div className="space-y-3">
            {thirdPartyProviders.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[16px] hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-200 cursor-pointer group"
              >
                <span className="font-medium text-gray-900 dark:text-white text-[14px]">
                  {service.name}
                </span>
                <StatusIndicator status={service.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-[20px] mb-1">
            Recent Incident
          </h3>
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            Service disruptions and their resolution history
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-[16px] border border-gray-200/50 dark:border-gray-700/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 hover:bg-[#F5F5F5]/80 dark:hover:bg-[#2D2B2B]/80 border-gray-200/50 dark:border-gray-700/30">
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Severity
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Incident Title
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Status
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Started
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Duration
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Impact
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIncidents.map((incident, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-[#F5F5F5]/50 dark:hover:bg-[#2D2B2B]/50 transition-colors border-gray-200/50 dark:border-gray-700/30"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-white text-[13px]">
                    {incident.severity}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white text-[13px]">
                    {incident.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold border-0 ${
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
                  <TableCell className="text-gray-700 dark:text-gray-300 text-[13px]">
                    {incident.started}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 text-[13px]">
                    {incident.duration}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 text-[13px]">
                    {incident.impact}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[10px] h-8 px-3 text-[13px] font-medium"
                    >
                      View timeline
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {recentIncidents.map((incident, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[16px] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">
                      {incident.severity}
                    </span>
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
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-[14px] mb-1">
                    {incident.title}
                  </h4>
                  <p className="text-[12px] text-gray-600 dark:text-gray-400">
                    {incident.impact}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Started: {incident.started}</span>
                  <span>Duration: {incident.duration}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[10px] h-8 text-[13px] font-medium"
              >
                View timeline
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;