import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, ArrowLeftRight, Wallet, Download } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const userGrowthData = [
  { month: "Jul", users: 2100, active: 890 },
  { month: "Aug", users: 2450, active: 1020 },
  { month: "Sep", users: 2890, active: 1250 },
  { month: "Oct", users: 3420, active: 1480 },
  { month: "Nov", users: 4100, active: 1780 },
  { month: "Dec", users: 4680, active: 2050 },
  { month: "Jan", users: 5247, active: 2134 },
];

const transactionVolumeData = [
  { day: "Mon", crypto: 5200000, giftCards: 850000, games: 320000 },
  { day: "Tue", crypto: 4800000, giftCards: 920000, games: 280000 },
  { day: "Wed", crypto: 6100000, giftCards: 780000, games: 350000 },
  { day: "Thu", crypto: 5500000, giftCards: 1020000, games: 410000 },
  { day: "Fri", crypto: 7200000, giftCards: 1150000, games: 480000 },
  { day: "Sat", crypto: 8100000, giftCards: 1380000, games: 520000 },
  { day: "Sun", crypto: 6800000, giftCards: 1100000, games: 440000 },
];

const revenueData = [
  { week: "Week 1", revenue: 285000 },
  { week: "Week 2", revenue: 312000 },
  { week: "Week 3", revenue: 298000 },
  { week: "Week 4", revenue: 350000 },
];

const kycDistribution = [
  { name: "Tier 0", value: 1200, color: "hsl(var(--muted-foreground))" },
  { name: "Tier 1", value: 3500, color: "hsl(var(--orange-500))" },
  { name: "Tier 2", value: 547, color: "hsl(var(--success))" },
];

const retentionData = [
  { day: "Day 1", rate: 85 },
  { day: "Day 3", rate: 72 },
  { day: "Day 7", rate: 62 },
  { day: "Day 14", rate: 54 },
  { day: "Day 30", rate: 48 },
];

const chartConfig = {
  users: { label: "Total Users", color: "hsl(var(--orange-500))" },
  active: { label: "Active Users", color: "hsl(var(--success))" },
  crypto: { label: "Crypto", color: "hsl(var(--orange-500))" },
  giftCards: { label: "Gift Cards", color: "hsl(var(--info))" },
  games: { label: "Games", color: "hsl(var(--success))" },
  revenue: { label: "Revenue", color: "hsl(var(--orange-500))" },
  rate: { label: "Retention Rate", color: "hsl(var(--orange-500))" },
};

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Platform performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[140px] bg-surface-1 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="accent-outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">5,247</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+12%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Active</p>
                <p className="text-2xl font-bold text-foreground">3,876</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+14%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Volume</p>
                <p className="text-2xl font-bold text-foreground">₦45.2M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+8%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">₦1.24M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+18%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="bg-surface-1 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Total and active users over time</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--orange-500))"
                  fill="hsl(var(--orange-500) / 0.2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card className="bg-surface-1 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Transaction Volume</CardTitle>
            <p className="text-sm text-muted-foreground">Daily volume by category</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <BarChart data={transactionVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="crypto" fill="hsl(var(--orange-500))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="giftCards" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="games" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-xs text-muted-foreground">Crypto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-info" />
                <span className="text-xs text-muted-foreground">Gift Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" />
                <span className="text-xs text-muted-foreground">Games</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-surface-1 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Weekly Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">This month's revenue trend</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₦${(v / 1000)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--orange-500))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--orange-500))", strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* KYC Distribution */}
        <Card className="bg-surface-1 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">KYC Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Users by verification tier</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kycDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {kycDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              {kycDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retention */}
        <Card className="bg-surface-1 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Retention</CardTitle>
            <p className="text-sm text-muted-foreground">Retention rate over time</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <AreaChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--orange-500))"
                  fill="hsl(var(--orange-500) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Performing Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center">
                  <span className="text-orange-500 text-sm">₿</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Crypto Trading</p>
                  <p className="text-xs text-muted-foreground">12,340 transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">₦850K</p>
                <Badge variant="success" className="text-[10px]">68%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-info/10 flex items-center justify-center">
                  <span className="text-info text-sm">🎁</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Gift Cards</p>
                  <p className="text-xs text-muted-foreground">1,250 transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">₦320K</p>
                <Badge variant="info" className="text-[10px]">26%</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center">
                  <span className="text-success text-sm">🎮</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Game Recharge</p>
                  <p className="text-xs text-muted-foreground">890 transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">₦75K</p>
                <Badge variant="accent" className="text-[10px]">6%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Average Transaction Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
              <span className="text-sm text-muted-foreground">Crypto</span>
              <span className="text-sm font-semibold text-foreground">₦4,470</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
              <span className="text-sm text-muted-foreground">Gift Cards</span>
              <span className="text-sm font-semibold text-foreground">₦2,380</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
              <span className="text-sm text-muted-foreground">Games</span>
              <span className="text-sm font-semibold text-foreground">₦985</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/15">
              <span className="text-sm text-orange-500 font-medium">Platform Average</span>
              <span className="text-sm font-bold text-orange-500">₦3,520</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
