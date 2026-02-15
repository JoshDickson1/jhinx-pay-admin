import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Smartphone,
  Shield,
  Clock,
  Wallet,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Ban,
  Unlock,
  Key,
  Download,
  Plus,
} from "lucide-react";

// Mock user data
const userData = {
  id: "USR-001234",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+234 801 234 5678",
  profilePhoto: null,
  status: "active" as const,
  joinDate: "Jul 15, 2025",
  lastLogin: "2 hours ago",
  kycTier: 2,
  kycStatus: "approved" as const,
  kycSubmittedDate: "Aug 1, 2025",
  kycReviewedBy: "Admin Sarah",
  device: "iPhone 14 Pro",
  os: "iOS 17.2",
  location: "Lagos, Nigeria",
  balances: {
    naira: 125450,
    usdt: 250.0,
    btc: 0.0023,
    eth: 0.15,
  },
  kycDocuments: {
    fullName: "John Adebayo Doe",
    email: "john.doe@example.com",
    phone: "+234 801 234 5678",
    govId: "NIN-12345678901",
    selfie: true,
  },
  transactions: [
    { id: "TX-001", type: "Crypto Buy", amount: "₦45,000", status: "completed", date: "Jan 13, 2026" },
    { id: "TX-002", type: "Gift Card Sell", amount: "₦76,000", status: "completed", date: "Jan 12, 2026" },
    { id: "TX-003", type: "Game Recharge", amount: "₦5,000", status: "completed", date: "Jan 10, 2026" },
    { id: "TX-004", type: "Crypto Sell", amount: "₦120,000", status: "pending", date: "Jan 8, 2026" },
    { id: "TX-005", type: "Gift Card Sell", amount: "₦38,000", status: "failed", date: "Jan 5, 2026" },
  ],
  auditLog: [
    { action: "KYC Approved", by: "Admin Sarah", date: "Aug 1, 2025 • 2:30 PM" },
    { action: "Account Created", by: "System", date: "Jul 15, 2025 • 10:15 AM" },
  ],
  notes: [
    { by: "Admin Sarah", note: "User contacted support about delayed withdrawal on Jan 10 - resolved", date: "Jan 10, 2026" },
  ],
};

const KycBadge = ({ tier }: { tier: number }) => {
  const variants = {
    0: "tier0",
    1: "tier1",
    2: "tier2",
  } as const;
  return <Badge variant={variants[tier as keyof typeof variants]}>Tier {tier}</Badge>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "active" | "frozen" | "banned"> = {
    active: "active",
    frozen: "frozen",
    banned: "banned",
  };
  return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
};

const UserDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{userData.name}</h1>
          <p className="text-muted-foreground">{userData.id}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-warning">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Freeze Account
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Ban className="w-4 h-4 mr-2" />
              Ban Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & KYC */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="bg-surface-1 border-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-orange-500/15 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-orange-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{userData.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">{userData.email}</p>
                <div className="flex items-center gap-2">
                  <KycBadge tier={userData.kycTier} />
                  <StatusBadge status={userData.status} />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{userData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground">{userData.joinDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last login</span>
                  <span className="text-foreground">{userData.lastLogin}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{userData.device} • {userData.os}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{userData.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Information */}
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">KYC Information</CardTitle>
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Tier</span>
                  <KycBadge tier={userData.kycTier} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-foreground">{userData.kycSubmittedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reviewed by</span>
                  <span className="text-foreground">{userData.kycReviewedBy}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-3">Verified Documents</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">Full Name: {userData.kycDocuments.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">Government ID</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">Selfie Verification</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View Documents</Button>
                <Button variant="accent-outline" size="sm" className="flex-1">Request Update</Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Balances */}
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Account Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2">
                <span className="text-sm text-muted-foreground">Naira</span>
                <span className="text-sm font-semibold text-foreground">₦{userData.balances.naira.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2">
                <span className="text-sm text-muted-foreground">USDT</span>
                <span className="text-sm font-semibold text-foreground">${userData.balances.usdt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2">
                <span className="text-sm text-muted-foreground">BTC</span>
                <span className="text-sm font-semibold text-foreground">{userData.balances.btc} BTC</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-2">
                <span className="text-sm text-muted-foreground">ETH</span>
                <span className="text-sm font-semibold text-foreground">{userData.balances.eth} ETH</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Transactions & Activity */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="bg-surface-1 border border-border">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Card className="bg-surface-1 border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Transaction History</CardTitle>
                  <Button variant="accent-outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">ID</TableHead>
                        <TableHead className="text-muted-foreground">Type</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-border hover:bg-surface-2">
                          <TableCell className="font-mono text-sm text-foreground">{tx.id}</TableCell>
                          <TableCell className="text-foreground">{tx.type}</TableCell>
                          <TableCell className="font-medium text-foreground">{tx.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tx.status === "completed" ? "success" :
                                tx.status === "pending" ? "warning" : "error"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="bg-surface-1 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Account Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.auditLog.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">by {log.by}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="bg-surface-1 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-500">{note.by}</span>
                        <span className="text-xs text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="text-sm text-foreground">{note.note}</p>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4">
                    <Textarea
                      placeholder="Add a note about this user..."
                      className="bg-surface-2 border-border mb-3"
                      rows={3}
                    />
                    <Button variant="accent" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
