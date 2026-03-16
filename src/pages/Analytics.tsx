import { useState } from "react";
import {
  Users, TrendingUp, ArrowLeftRight, Wallet, FileDown, Filter,
  Calendar, Download, Bitcoin, Gift, Gamepad2,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Chart data ───────────────────────────────────────────────────────────────

const userGrowthData = [
  { year: "2022", total: 1500, active: 800 },
  { year: "2023", total: 3200, active: 1800 },
  { year: "2024", total: 2800, active: 1200 },
  { year: "2025", total: 3600, active: 2000 },
  { year: "2026", total: 5900, active: 5700 },
];

const txVolumeData = [
  { day: "Mon",   crypto: 1200, games: 400,  giftcard: 800  },
  { day: "Tue",   crypto: 1800, games: 200,  giftcard: 600  },
  { day: "Wed",   crypto: 1400, games: 600,  giftcard: 1200 },
  { day: "Thurs", crypto: 6200, games: 2800, giftcard: 1800 },
  { day: "Fri",   crypto: 800,  games: 200,  giftcard: 400  },
  { day: "Sat",   crypto: 600,  games: 100,  giftcard: 200  },
  { day: "Sun",   crypto: 3800, games: 1200, giftcard: 3200 },
];

const weeklyRevenueData = [
  { week: "Week 1", revenue: 150000 },
  { week: "Week 2", revenue: 320000 },
  { week: "Week 3", revenue: 280000 },
  { week: "Week 4", revenue: 580000 },
];

const kycData = [
  { name: "Tier 0", value: 30, color: "#E5E5E5" },
  { name: "Tier 1", value: 50, color: "#F59E0B" },
  { name: "Tier 2", value: 20, color: "#3B82F6" },
];

const retentionData = [
  { week: "Week 1", rate: 5  },
  { week: "Week 2", rate: 20 },
  { week: "Week 3", rate: 40 },
  { week: "Week 4", rate: 95 },
];

const topFeatures = [
  { label: "1,432 Transactions", value: 1432, max: 1432, color: "#F59E0B", type: "Crypto"    },
  { label: "884 Transactions",   value: 884,  max: 1432, color: "#22D3EE", type: "Games"     },
  { label: "432 Transactions",   value: 432,  max: 1432, color: "#4ADE80", type: "Gift Card" },
];

const avgTxSizes = [
  { label: "Crypto",           value: "120K", icon: Bitcoin,   color: "from-orange-400 to-orange-500", bg: "bg-orange-500/10" },
  { label: "Gift Cards",       value: "270K", icon: Gift,      color: "from-purple-400 to-purple-600", bg: "bg-purple-500/10" },
  { label: "Game Points",      value: "70K",  icon: Gamepad2,  color: "from-green-400 to-green-600",   bg: "bg-green-500/10"  },
  { label: "Platform Average", value: "93K",  icon: TrendingUp, color: "from-teal-400 to-teal-600",   bg: "bg-teal-500/10"   },
];

// ── Custom tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] shadow-xl px-3 py-2.5">
      <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Metric card ───────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, change, icon: Icon }: { label: string; value: string; change: string; icon: any }) => (
  <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
      <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
    <div>
      <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {change}
      </p>
    </div>
  </div>
);

// ── Chart card wrapper ────────────────────────────────────────────────────────

const ChartCard = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm", className)}>
    <p className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">{title}</p>
    {children}
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────

const Analytics = () => {
  const [reportOpen, setReportOpen]     = useState(false);
  const [exportOpen, setExportOpen]     = useState(false);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [dateRange,  setDateRange]      = useState("Last 30 days");
  const [reportType, setReportType]     = useState("Full Report");
  const [exportFmt,  setExportFmt]      = useState("PDF");
  const [exportPeriod, setExportPeriod] = useState("This month");
  const [filterTx,   setFilterTx]       = useState(true);
  const [filterUsers, setFilterUsers]   = useState(true);
  const [filterRev,  setFilterRev]      = useState(true);

  const chartAxisStyle = { tick: { fill: "#9CA3AF", fontSize: 10 }, axisLine: false, tickLine: false };

  return (
    <div className="space-y-3 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics &amp; Reports</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Platform performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilterOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium bg-white/80 dark:bg-[#1C1C1C]/90 border border-gray-200/50 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all shadow-sm">
            <FileDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setReportOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
            View Reports
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total Users"         value="5,247"   change="23% from last week"   icon={Users}         />
        <MetricCard label="Monthly Active"      value="3,648"   change="23% from last week"   icon={Users}         />
        <MetricCard label="Transaction Volume"  value="₦45.2M"  change="23% from this month"  icon={ArrowLeftRight} />
        <MetricCard label="Monthly Revenue"     value="₦1.4M"   change="23% from this month"  icon={Wallet}        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* User Growth */}
        <ChartCard title="User Growth">
          <div className="flex items-center gap-4 mb-2">
            {[{ label: "Total Users", color: "#F59E0B" }, { label: "Active Users", color: "#4ADE80" }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB20" vertical={false} />
              <XAxis dataKey="year" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total"  stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: "#F59E0B" }} name="Total Users"  />
              <Line type="monotone" dataKey="active" stroke="#4ADE80" strokeWidth={2} dot={{ r: 3, fill: "#4ADE80" }} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Transaction Volume */}
        <ChartCard title="Transaction Volume">
          <div className="flex items-center gap-4 mb-2">
            {[{ label: "Crypto", color: "#F59E0B" }, { label: "Games", color: "#4ADE80" }, { label: "Gift Card", color: "#3B82F6" }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={txVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB20" />
              <XAxis dataKey="day" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="crypto"   stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: "#F59E0B" }} name="Crypto"    />
              <Line type="monotone" dataKey="games"    stroke="#4ADE80" strokeWidth={2} dot={{ r: 3, fill: "#4ADE80" }} name="Games"     />
              <Line type="monotone" dataKey="giftcard" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: "#3B82F6" }} name="Gift Card" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Weekly Revenue */}
        <ChartCard title="Weekly Revenue">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyRevenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB20" vertical={false} />
              <XAxis dataKey="week" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 3, fill: "#F59E0B" }} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* KYC Distribution */}
        <ChartCard title="KYC Distribution">
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={kycData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {kycData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              {kycData.map(({ name, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* User Retention */}
        <ChartCard title="User Retention">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB20" vertical={false} />
              <XAxis dataKey="week" {...chartAxisStyle} />
              <YAxis {...chartAxisStyle} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#F59E0B" strokeWidth={2} fill="url(#retentionGrad)" dot={{ r: 3, fill: "#F59E0B" }} name="Retention %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Top Performing Features */}
        <ChartCard title="Top Performing Features">
          <div className="space-y-3 mt-2">
            {topFeatures.map(({ label, value, max, color }) => (
              <div key={label} className="space-y-1">
                <div className="relative h-10 rounded-full overflow-hidden bg-[#F5F5F5] dark:bg-[#2D2B2B]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full flex items-center px-4 transition-all duration-700"
                    style={{ width: `${(value / max) * 100}%`, background: color }}
                  >
                    <span className="text-[12px] font-semibold text-white whitespace-nowrap">{label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            {[{ label: "Crypto", color: "#F59E0B" }, { label: "Games", color: "#22D3EE" }, { label: "Gift Card", color: "#4ADE80" }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Average Transaction Size */}
        <ChartCard title="Average Transaction Size">
          <div className="grid grid-cols-2 gap-3 mt-1">
            {avgTxSizes.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={cn("rounded-[14px] p-4 relative overflow-hidden", bg, "border border-gray-200/30 dark:border-gray-700/20")}>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-[22px] font-bold text-gray-900 dark:text-white">{value}</p>
                <div className={cn("absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center opacity-80", color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── View Reports Dialog ── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Generate Report</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Choose report type and date range.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {[
              { label: "Report Type",  value: reportType, set: setReportType, opts: ["Full Report", "Transactions Only", "User Analytics", "Revenue Summary", "KYC Report"] },
              { label: "Date Range",   value: dateRange,  set: setDateRange,  opts: ["Last 7 days", "Last 30 days", "Last 90 days", "This year", "Custom range"] },
            ].map(({ label, value, set, opts }) => (
              <div key={label} className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                <div className="relative">
                  <select value={value} onChange={(e) => set(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer">
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <TrendingUp className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Include Sections</Label>
              {[
                { label: "Transactions", val: filterTx,    set: setFilterTx    },
                { label: "Users",        val: filterUsers, set: setFilterUsers  },
                { label: "Revenue",      val: filterRev,   set: setFilterRev    },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">{label}</span>
                  <Switch checked={val} onCheckedChange={set} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setReportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setReportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Generate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Export Dialog ── */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Export Data</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Download analytics data in your preferred format.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {["PDF", "CSV", "Excel"].map((f) => (
                  <button key={f} onClick={() => setExportFmt(f)} className={cn("py-2 rounded-[10px] text-[12px] font-semibold transition-all border", exportFmt === f ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-transparent shadow-sm" : "bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/40 hover:border-orange-300 dark:hover:border-orange-500/30")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Period</Label>
              <div className="relative">
                <select value={exportPeriod} onChange={(e) => setExportPeriod(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                  {["This week", "This month", "Last month", "Last 3 months", "This year"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setExportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={() => setExportOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" /> Export
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Filter Dialog ── */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Filter Analytics</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Customize the data shown in charts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Date Range</Label>
              <div className="relative">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full appearance-none h-9 pl-3 pr-8 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 cursor-pointer">
                  {["Last 7 days", "Last 30 days", "Last 90 days", "This year"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Data Series</Label>
              {[
                { label: "Transaction Data", val: filterTx,    set: setFilterTx    },
                { label: "User Data",        val: filterUsers, set: setFilterUsers  },
                { label: "Revenue Data",     val: filterRev,   set: setFilterRev    },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[10px]">
                  <span className="text-[12px] text-gray-700 dark:text-gray-300">{label}</span>
                  <Switch checked={val} onCheckedChange={set} className="data-[state=checked]:bg-green-500 scale-90" />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setFilterOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Reset</button>
            <button onClick={() => setFilterOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">Apply Filters</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;