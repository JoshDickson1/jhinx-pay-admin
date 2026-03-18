import { Clock, Smartphone, Monitor, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
}

const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data),
  });

const formatLastSeen = (dateStr: string | null) => {
  if (!dateStr) return "Never";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatRole = (role?: string) =>
  (role ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin";

export const PendingActions = () => {
  const { data, isLoading } = useAdminUsers();

  const admins: AdminUser[] =
    data?.admins ?? data?.users ?? data?.items ?? data?.data ??
    (Array.isArray(data) ? data : []);

  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 flex flex-col h-full max-h-[470px] backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Admin Logs</h3>
        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F8F8F8] dark:bg-[#252525] rounded-[20px] p-3.5">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-5 w-28 rounded-md mb-3" />
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-3 w-28 col-span-2" />
                </div>
              </div>
            ))
          ) : admins.length === 0 ? (
            <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 py-8">
              No admin users found
            </p>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-[#F8F8F8] dark:bg-[#252525] rounded-[20px] p-3.5 border border-transparent hover:border-orange-500/20 hover:bg-white dark:hover:bg-[#2D2D2D] transition-all duration-300 group"
              >
                {/* Top Section */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-orange-500/30 transition-all">
                      {admin.avatar_url ? (
                        <img
                          src={admin.avatar_url}
                          alt={admin.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-[12px] font-bold">
                            {getInitials(admin.full_name)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#252525] ${admin.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight truncate">
                      {admin.full_name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">
                      {admin.email}
                    </p>
                  </div>
                </div>

                {/* Role & Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 px-2.5 py-0.5 bg-gray-200/50 dark:bg-white/10 rounded-md">
                    {formatRole(admin.role)}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                    admin.is_active
                      ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                    {admin.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-2 gap-y-2 border-t border-gray-100 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-medium">
                      {formatLastSeen(admin.last_login_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 justify-end">
                    <Monitor className="w-3 h-3" />
                    <span className="text-[10px] font-medium capitalize">{formatRole(admin.role)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.2); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
};