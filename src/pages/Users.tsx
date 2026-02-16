import { Users as UsersIcon, UserCheck, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { UserTable } from "@/components/users/UserTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <div className="w-full flex justify-start py-6">
      <Tabs defaultValue="pending" className="w-auto">
        <TabsList className="bg-white dark:bg-[#1C1C1C] border border-gray-100 dark:border-white/5 h-14 p-1.5 rounded-full shadow-sm gap-2">
          
          <TabsTrigger 
            value="all" 
            className="rounded-full px-8 py-2.5 text-sm data-[state=active]:text-white font-medium data-[state=active]:bg-gradient-to-br from-orange-300 to-orange-600 transition-all"
          >
            All Users
          </TabsTrigger>

          <TabsTrigger 
            value="pending" 
            className="rounded-full px-8 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-br from-orange-300 to-orange-600 data-[state=active]:text-white transition-all"
          >
            Pending KYC
          </TabsTrigger>

          <TabsTrigger 
            value="flagged" 
            className="rounded-full px-8 py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-br from-orange-300 to-orange-600 data-[state=active]:text-white transition-all"
          >
            Flagged Users
          </TabsTrigger>
          
        </TabsList>
      </Tabs>
    </div>

      {/* User Table */}
      <UserTable />
    </div>
  );
};

export default Users;
