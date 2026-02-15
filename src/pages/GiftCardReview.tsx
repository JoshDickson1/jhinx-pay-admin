import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  CreditCard,
  Shield,
  Camera,
  MessageSquare,
  Pause,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GiftCardReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - would come from API
  const submission = {
    id: id || "GC-001",
    brand: "Amazon",
    cardValue: "$100",
    cardCode: "ABCD-EFGH-IJKL-MNOP",
    user: "@john_doe",
    userEmail: "john.doe@email.com",
    userId: "USR-001",
    submittedTime: "Jan 13, 2026 • 3:42 PM",
    timeElapsed: "14 minutes",
    payoutAmount: "₦152,000",
    rate: "$1 = ₦1,520",
    riskScore: 72,
    riskBreakdown: [
      { label: "User account age: 6 months", risk: "low", icon: CheckCircle },
      { label: "Past successful trades: 5", risk: "low", icon: CheckCircle },
      { label: "Card amount: $100", risk: "medium", icon: AlertTriangle },
      { label: "Photo provided: Yes", risk: "low", icon: CheckCircle },
      { label: "New device: Yes", risk: "medium", icon: AlertTriangle },
      { label: "IP location: Lagos, Nigeria", risk: "low", icon: CheckCircle },
    ],
    userHistory: {
      totalCardsSold: 5,
      accepted: 5,
      rejected: 0,
      successRate: "100%",
      totalVolume: "$350",
    },
    adminNotes: [
      { author: "Admin Mike", note: "User has clean history, trusted seller", time: "2 days ago" },
    ],
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-success";
      case "medium":
        return "text-warning";
      case "high":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Review Gift Card</h1>
            <Badge variant="warning">Pending</Badge>
          </div>
          <p className="text-muted-foreground mt-0.5">Submission ID: {submission.id}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{submission.timeElapsed} ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Card Details */}
        <div className="space-y-4">
          {/* Card Info */}
          <div className="card-glow bg-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">Card Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Brand</span>
                <Badge variant="accent">{submission.brand}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Card Value</span>
                <span className="font-semibold text-foreground">{submission.cardValue}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Card Code</span>
                <code className="font-mono text-sm bg-surface-2 px-2 py-1 rounded">{submission.cardCode}</code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Payout Amount</span>
                <span className="font-bold text-orange-500 text-lg">{submission.payoutAmount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-foreground">{submission.rate}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="card-glow bg-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">User Information</h2>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-surface-1 rounded-lg mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
                <span className="text-orange-500 text-lg font-bold">J</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-500">{submission.user}</p>
                <p className="text-sm text-muted-foreground">{submission.userEmail}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/users/${submission.userId}`)}
              >
                View Profile
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-1 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{submission.userHistory.totalCardsSold}</p>
                <p className="text-xs text-muted-foreground">Cards Sold</p>
              </div>
              <div className="bg-surface-1 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-success">{submission.userHistory.successRate}</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="bg-surface-1 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{submission.userHistory.accepted}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
              <div className="bg-surface-1 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{submission.userHistory.totalVolume}</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
            </div>
          </div>

          {/* Photo Review */}
          <div className="card-glow bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-foreground">Card Photo</h2>
              </div>
              <Badge variant="success">Good Quality</Badge>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-video bg-surface-2 rounded-lg overflow-hidden cursor-pointer group">
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-1">
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Gift Card Image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Card Photo</DialogTitle>
                </DialogHeader>
                <div className="aspect-video bg-surface-1 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-24 h-24 text-muted-foreground" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Panel - Risk Assessment & Actions */}
        <div className="space-y-4">
          {/* Risk Assessment */}
          <div className="card-glow bg-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">Risk Assessment</h2>
            </div>

            {/* Risk Score */}
            <div className="bg-surface-1 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <Badge variant="warning">{submission.riskScore}/100 - Medium</Badge>
              </div>
              <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success via-warning to-destructive"
                  style={{ width: `${submission.riskScore}%` }}
                />
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="space-y-2">
              {submission.riskBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-1 transition-colors"
                >
                  <item.icon className={`w-4 h-4 ${getRiskColor(item.risk)}`} />
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <Badge
                    variant={item.risk === "low" ? "success" : item.risk === "medium" ? "warning" : "error"}
                    className="text-[10px]"
                  >
                    {item.risk}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="card-glow bg-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-foreground">Admin Notes</h2>
            </div>

            <div className="space-y-3 mb-4">
              {submission.adminNotes.map((note, i) => (
                <div key={i} className="bg-surface-1 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-orange-500">{note.author}</span>
                    <span className="text-xs text-muted-foreground">{note.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{note.note}</p>
                </div>
              ))}
            </div>

            <Textarea
              placeholder="Add a note..."
              className="bg-surface-1 border-border resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="card-glow-accent bg-card rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Button variant="accent" className="w-full justify-center gap-2" size="lg">
                <CheckCircle className="w-5 h-5" />
                Approve & Payout
              </Button>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select>
                    <SelectTrigger className="bg-surface-1 border-border">
                      <SelectValue placeholder="Reject reason..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="invalid">Invalid/Redeemed Code</SelectItem>
                      <SelectItem value="photo">Photo Doesn't Match</SelectItem>
                      <SelectItem value="region">Unsupported Region</SelectItem>
                      <SelectItem value="fraud">Suspected Fraud</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Request Info
                </Button>
                <Button variant="outline" className="flex-1 border-border gap-2">
                  <Pause className="w-4 h-4" />
                  Hold for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardReview;
