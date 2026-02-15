import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  onClick?: () => void;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  onClick,
}: MetricCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-5 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-gray-300/50 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5",
        onClick && "cursor-pointer"
      )}
    >
      {/* Icon and Change Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#F5F5F5] to-[#DFDFDF] dark:from-[#2D2B2B] dark:to-[#3A3737] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm",
              changeType === "positive" && "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
              changeType === "negative" && "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
              changeType === "neutral" && "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}
          >
            {changeType === "positive" && <ArrowUp className="w-3 h-3" />}
            {changeType === "negative" && <ArrowDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-[12px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
        {description && (
          <p className="text-[12px] text-gray-500 dark:text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
    </div>
  );
};