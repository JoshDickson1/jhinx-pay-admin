import { Clock, Monitor, Smartphone, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_active: string | null;
  created_at: string;
}

const formatLastSeen = (dateStr: string | null) => {
  if (!dateStr) return "Never";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// "Active" = last_active within 15 minutes AND is_active true
const isOnline = (admin: AdminUser) => {
  if (!admin.is_active || !admin.last_active) return false;
  const diff = Math.floor((Date.now() - new Date(admin.last_active).getTime()) / 1000);
  return diff < 900; // 15 minutes
};

const getInitials = (name: string) =>
  (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const roleLabel = (role?: string) => {
  const map: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
    operations_admin: "Ops Admin",
    support_lead: "Support Lead",
    finance_admin: "Finance Admin",
    compliance_admin: "Compliance",
    read_only: "Read Only",
  };
  return map[role ?? ""] ?? (role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Admin");
};

const roleColor = (role?: string) => {
  const map: Record<string, string> = {
    superadmin: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
    admin: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    staff: "bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400",
  };
  return map[role ?? ""] ?? map.staff;
};

const parseUA = (ua: string) => {
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua ?? "");
  return isMobile ? "Mobile" : "Desktop";
};

export const PendingActions = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profiles-widget"],
    queryFn: () => api.get("/admin/profiles/").then((r) => r.data),
    refetchInterval: 30000, // refresh every 30s for near-real-time
  });

  const admins: AdminUser[] = data?.items ?? [];

  // Sort: online first, then by last_active
  const sorted = [...admins].sort((a, b) => {
    const aOnline = isOnline(a) ? 1 : 0;
    const bOnline = isOnline(b) ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    const aTime = a.last_active ? new Date(a.last_active).getTime() : 0;
    const bTime = b.last_active ? new Date(b.last_active).getTime() : 0;
    return bTime - aTime;
  });

  const onlineCount = admins.filter(isOnline).length;

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 flex flex-col h-full max-h-[470px] backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-[15px] tracking-tight">
            Admin Activity
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading ? "Loading…" : `${onlineCount} online now`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onlineCount > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
          )}
          <button
            onClick={() => navigate("/admin-profiles")}
            className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors group"
          >
            <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F8F8F8] dark:bg-[#252525] rounded-[16px] p-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 py-8">
              No admins found
            </p>
          ) : (
            sorted.map((admin) => {
              const online = isOnline(admin);
              return (
                <div
                  key={admin.id}
                  onClick={() => navigate("/admin-profiles")}
                  className="bg-[#F8F8F8] dark:bg-[#252525] rounded-[16px] p-3.5 border border-transparent hover:border-orange-500/20 hover:bg-white dark:hover:bg-[#2D2D2D] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-orange-500/30 transition-all">
                        <span className="text-white text-[12px] font-bold">
                          {getInitials(admin.full_name)}
                        </span>
                      </div>
                      {/* Online dot — only show if actually online */}
                      {online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#252525]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                          {admin.full_name}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {admin.email}
                      </p>
                    </div>

                    {/* Role badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${roleColor(admin.role)}`}>
                      {roleLabel(admin.role)}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">
                        {online ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Online now</span>
                        ) : (
                          formatLastSeen(admin.last_active)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                      <span className="text-[10px]">{admin.is_active ? "Active" : "Suspended"}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.2); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.4); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};