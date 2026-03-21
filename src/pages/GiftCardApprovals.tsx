import { CreditCard, Clock, CheckCircle, XCircle, TrendingUp, FileDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GiftCardQueue } from "@/components/giftcards/GiftCardQueue";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDuration = (s: number) => {
  if (!s) return "0s";
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const GiftCardApprovals = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["gc-stats"],
    queryFn: () => api.get("/admin/giftcards/submissions/stats").then((r) => r.data),
    refetchInterval: 60_000,
  });

  const stats = [
    {
      label: "Total Pending Value",
      value: statsData ? `$${(statsData.total_pending_value_usd ?? 0).toLocaleString()}` : "—",
      icon: CreditCard,
    },
    {
      label: "Pending",
      value: statsData?.pending?.value ?? 0,
      icon: CreditCard,
    },
    {
      label: "Approved",
      value: statsData?.approved?.value ?? 0,
      icon: CheckCircle,
    },
    {
      label: "Rejected",
      value: statsData?.rejected?.value ?? 0,
      icon: XCircle,
    },
    {
      label: "Avg Review Time",
      value: statsData ? formatDuration(statsData.avg_review_time_seconds ?? 0) : "—",
      icon: Clock,
    },
  ];

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/admin/giftcards/submissions/export.csv", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `giftcard-submissions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap px-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gift Card Queue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[12px]">
            Review and verify submitted gift cards before approval or rejection.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <div>
              {statsLoading
                ? <Skeleton className="h-7 w-16" />
                : <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Queue Table */}
      <GiftCardQueue />
    </div>
  );
};

export default GiftCardApprovals;