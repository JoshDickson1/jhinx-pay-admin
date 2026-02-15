import { Users as UsersIcon, UserCheck, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { UserTable } from "@/components/users/UserTable";

const Users = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage platform users and KYC verification</p>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Users"
          value="5,247"
          change="+12%"
          changeType="positive"
          icon={UsersIcon}
          description="All registered users"
        />
        <MetricCard
          title="Daily Active Users"
          value="1,342"
          change="+9%"
          changeType="positive"
          icon={TrendingUp}
          description="Active today"
        />
        <MetricCard
          title="Monthly Active Users"
          value="3,876"
          change="+14%"
          changeType="positive"
          icon={UserCheck}
          description="Active last 30 days"
        />
      </div>

      {/* User Table */}
      <UserTable />
    </div>
  );
};

export default Users;
