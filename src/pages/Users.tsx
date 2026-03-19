import { Users as UsersIcon, UserCheck, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { UserTable } from "@/components/users/UserTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

const Users = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["users", "stats"],
    queryFn: () => api.get("/admin/users/stats").then((r) => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage platform users and KYC verification</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Users"
              value={stats?.total_users?.toLocaleString() ?? "—"}
              change="" changeType="positive"
              icon={UsersIcon}
              description="All registered users"
            />
            <MetricCard
              title="Daily Active Users"
              value={stats?.daily_active_users?.toLocaleString() ?? "—"}
              change="" changeType="positive"
              icon={TrendingUp}
              description="Active today"
            />
            <MetricCard
              title="Monthly Active Users"
              value={stats?.monthly_active_users?.toLocaleString() ?? "—"}
              change="" changeType="positive"
              icon={UserCheck}
              description="Active last 30 days"
            />
          </>
        )}
      </div>

      <UserTable />
    </div>
  );
};

export default Users;