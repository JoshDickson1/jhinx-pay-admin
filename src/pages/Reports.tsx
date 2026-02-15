import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  TrendingUp,
  Users,
  CreditCard,
  Shield,
  BarChart3,
  FileSpreadsheet,
  Trash2,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Mail,
  Plus,
  Edit2,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const reportTypes: ReportType[] = [
  { id: "daily-transactions", name: "Daily Transaction Summary", description: "All transactions for a specific day", icon: BarChart3, category: "Transactions" },
  { id: "monthly-revenue", name: "Monthly Revenue Report", description: "Revenue breakdown by feature", icon: TrendingUp, category: "Revenue" },
  { id: "user-growth", name: "User Growth Report", description: "New signups and active users", icon: Users, category: "Users" },
  { id: "kyc-approval", name: "KYC Approval Report", description: "Approved/rejected KYC submissions", icon: Shield, category: "Compliance" },
  { id: "gift-card-approval", name: "Gift Card Approval Report", description: "Gift card approvals and average time", icon: CreditCard, category: "Transactions" },
  { id: "fraud-report", name: "Fraud Report", description: "Flagged accounts and banned users", icon: Shield, category: "Compliance" },
];

interface GeneratedReport {
  id: string;
  name: string;
  dateRange: string;
  format: string;
  status: "completed" | "processing" | "failed";
  generatedAt: string;
  size: string;
  progress?: number;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  format: string;
  status: "active" | "paused";
}

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [emailOnComplete, setEmailOnComplete] = useState(false);
  
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([
    { id: "RPT-001", name: "Monthly Revenue Report", dateRange: "Jan 1 - Jan 31, 2026", format: "PDF", status: "completed", generatedAt: "2 hours ago", size: "1.2 MB" },
    { id: "RPT-002", name: "User Growth Report", dateRange: "Dec 1 - Dec 31, 2025", format: "CSV", status: "completed", generatedAt: "1 day ago", size: "856 KB" },
    { id: "RPT-003", name: "Gift Card Approval Report", dateRange: "Jan 1 - Jan 13, 2026", format: "Excel", status: "processing", generatedAt: "5 mins ago", size: "-", progress: 65 },
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    { id: "SCH-001", name: "Daily Summary", frequency: "Every day at 11:00 PM WAT", nextRun: "Today, 11:00 PM", recipients: ["admin@jhinxpay.com"], format: "PDF", status: "active" },
    { id: "SCH-002", name: "Weekly Revenue", frequency: "Every Sunday at 8:00 AM WAT", nextRun: "Jan 19, 8:00 AM", recipients: ["admin@jhinxpay.com", "finance@jhinxpay.com"], format: "Excel", status: "active" },
    { id: "SCH-003", name: "Monthly Compliance", frequency: "1st of every month", nextRun: "Feb 1, 9:00 AM", recipients: ["compliance@jhinxpay.com"], format: "PDF", status: "paused" },
  ]);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedPreviewReport, setSelectedPreviewReport] = useState<GeneratedReport | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          const reportName = reportTypes.find(r => r.id === selectedReport)?.name || "Report";
          const newReport: GeneratedReport = {
            id: `RPT-${String(recentReports.length + 1).padStart(3, "0")}`,
            name: reportName,
            dateRange: `${dateFrom} - ${dateTo}`,
            format: format.toUpperCase(),
            status: "completed",
            generatedAt: "Just now",
            size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          };
          
          setRecentReports(prev => [newReport, ...prev]);
          toast.success(`${reportName} generated successfully!`);
          
          if (emailOnComplete) {
            toast.success("Report sent to your email");
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteReport = (id: string) => {
    setRecentReports(prev => prev.filter(r => r.id !== id));
    toast.success("Report deleted");
  };

  const handlePreviewReport = (report: GeneratedReport) => {
    setSelectedPreviewReport(report);
    setPreviewDialogOpen(true);
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    toast.success(`Downloading ${report.name}...`);
  };

  const handleQuickExport = (type: string) => {
    toast.success(`Exporting ${type}...`);
    setTimeout(() => toast.success(`${type} exported successfully!`), 1500);
  };

  const handleToggleSchedule = (schedule: ScheduledReport) => {
    setScheduledReports(prev => prev.map(s => 
      s.id === schedule.id 
        ? { ...s, status: s.status === "active" ? "paused" : "active" } 
        : s
    ));
    toast.success(`Schedule ${schedule.status === "active" ? "paused" : "resumed"}`);
  };

  const handleRunScheduleNow = (schedule: ScheduledReport) => {
    toast.success(`Running ${schedule.name} now...`);
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduledReports(prev => prev.filter(s => s.id !== id));
    toast.success("Schedule deleted");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate and download platform reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Generate Report</CardTitle>
              <CardDescription>Select a report type and configure parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedReport === report.id
                        ? "border-orange-500 bg-orange-500/8"
                        : "border-border bg-surface-1 hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedReport === report.id ? "bg-orange-500/15" : "bg-surface-2"
                      }`}>
                        <report.icon className={`w-5 h-5 ${
                          selectedReport === report.id ? "text-orange-500" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          selectedReport === report.id ? "text-orange-500" : "text-foreground"
                        }`}>
                          {report.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">{report.category}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">From Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-10 bg-surface-1 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">To Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-10 bg-surface-1 border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Format & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="bg-surface-1 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="charts" 
                        checked={includeCharts}
                        onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                      />
                      <label htmlFor="charts" className="text-sm">Include charts</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="summary" 
                        checked={includeSummary}
                        onCheckedChange={(checked) => setIncludeSummary(!!checked)}
                      />
                      <label htmlFor="summary" className="text-sm">Include executive summary</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email" 
                        checked={emailOnComplete}
                        onCheckedChange={(checked) => setEmailOnComplete(!!checked)}
                      />
                      <label htmlFor="email" className="text-sm">Email when complete</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Generating report...</span>
                    <span className="text-orange-500">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="accent"
                className="w-full"
                disabled={!selectedReport || !dateFrom || !dateTo || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating... {generationProgress}%
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Reports</CardTitle>
                  <CardDescription>Previously generated reports</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Report</TableHead>
                    <TableHead className="text-muted-foreground">Date Range</TableHead>
                    <TableHead className="text-muted-foreground">Format</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Generated</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id} className="border-border hover:bg-surface-1">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.dateRange}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.format}</Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === "completed" ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </Badge>
                        ) : report.status === "processing" ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="warning" className="gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {report.progress}%
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="error">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.generatedAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handlePreviewReport(report)}
                              disabled={report.status !== "completed"}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownloadReport(report)}
                              disabled={report.status !== "completed"}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toast.success("Report sent to your email")}
                              disabled={report.status !== "completed"}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Email Report
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Export */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Export</CardTitle>
              <CardDescription>Export data tables directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickExport("User List")}
              >
                <Users className="w-4 h-4 mr-2" />
                Export User List
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickExport("Transactions")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Transactions
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickExport("Gift Card Queue")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Export Gift Card Queue
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickExport("Audit Log")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Export Audit Log
              </Button>
            </CardContent>
          </Card>

          {/* Scheduled Reports */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Scheduled Reports</CardTitle>
                  <CardDescription>Auto-generated reports</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledReports.map((schedule) => (
                <div key={schedule.id} className="p-3 rounded-lg bg-surface-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{schedule.name}</span>
                    <Badge 
                      variant={schedule.status === "active" ? "success" : "secondary"} 
                      className="text-[10px]"
                    >
                      {schedule.status === "active" ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{schedule.frequency}</p>
                  <p className="text-xs text-muted-foreground">Next: {schedule.nextRun}</p>
                  <div className="flex gap-1 pt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => handleToggleSchedule(schedule)}
                    >
                      {schedule.status === "active" ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => handleRunScheduleNow(schedule)}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => {
                        setEditingSchedule(schedule);
                        setScheduleDialogOpen(true);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="accent-outline" size="sm" className="w-full" onClick={() => setScheduleDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {selectedPreviewReport?.name} - {selectedPreviewReport?.dateRange}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-surface-1 rounded-lg p-8 text-center text-muted-foreground min-h-[300px] flex items-center justify-center">
              <div>
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Report preview would be displayed here</p>
                <p className="text-sm mt-2">Format: {selectedPreviewReport?.format} • Size: {selectedPreviewReport?.size}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button variant="accent" onClick={() => {
              handleDownloadReport(selectedPreviewReport!);
              setPreviewDialogOpen(false);
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
            <DialogDescription>
              Set up automatic report generation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue={editingSchedule?.name}>
                <SelectTrigger className="bg-surface-1">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.name}>{report.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" defaultValue="23:00" className="bg-surface-1" />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input placeholder="email@example.com" className="bg-surface-1" />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setScheduleDialogOpen(false);
              setEditingSchedule(null);
            }}>
              Cancel
            </Button>
            <Button variant="accent" onClick={() => {
              toast.success(editingSchedule ? "Schedule updated" : "Schedule created");
              setScheduleDialogOpen(false);
              setEditingSchedule(null);
            }}>
              {editingSchedule ? "Save Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
