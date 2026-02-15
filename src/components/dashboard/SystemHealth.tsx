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
  switch (status) {
    case "operational":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "degraded":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "down":
      return <XCircle className="w-4 h-4 text-destructive" />;
  }
};

const StatusBadge = ({ status }: { status: ServiceStatus["status"] }) => {
  const config = {
    operational: { text: "Operational", className: "text-success bg-success/10" },
    degraded: { text: "Degraded", className: "text-warning bg-warning/10" },
    down: { text: "Down", className: "text-destructive bg-destructive/10" },
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config[status].className}`}>
      {config[status].text}
    </span>
  );
};

export const SystemHealth = () => {
  const allOperational = services.every((s) => s.status === "operational");
  const hasIssues = services.some((s) => s.status !== "operational");

  return (
    <div className="card-glow bg-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          {allOperational ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning" />
          )}
          <h3 className="font-semibold text-foreground">
            {allOperational ? "All Systems Operational" : "System Status Issues"}
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      <div className="divide-y divide-border">
        {services.map((service) => (
          <div
            key={service.name}
            className="p-4 flex items-center justify-between hover:bg-surface-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <StatusIcon status={service.status} />
              <div>
                <p className="font-medium text-foreground text-sm">{service.name}</p>
                {service.message && (
                  <p className="text-xs text-muted-foreground">{service.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
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
