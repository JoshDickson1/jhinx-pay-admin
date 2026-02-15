import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  User,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface Ticket {
  id: string;
  user: string;
  email: string;
  category: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "high" | "medium" | "low";
  created: string;
  lastReply: string;
  messages: {
    sender: "user" | "admin";
    name: string;
    message: string;
    time: string;
  }[];
}

const mockTickets: Ticket[] = [
  {
    id: "#1234",
    user: "@john_doe",
    email: "john@example.com",
    category: "Gift Cards",
    subject: "Card not approved after 2 hours",
    status: "open",
    priority: "high",
    created: "2 hours ago",
    lastReply: "30 mins ago",
    messages: [
      {
        sender: "user",
        name: "John Doe",
        message: "I submitted an Amazon $100 card 2 hours ago and it's still pending. Why?",
        time: "Jan 13, 1:15 PM",
      },
      {
        sender: "admin",
        name: "Admin Sarah",
        message: "Hi John, I'm checking your submission now. Can you confirm the card code you entered was correct?",
        time: "Jan 13, 1:45 PM",
      },
      {
        sender: "user",
        name: "John Doe",
        message: "Yes, the code is XXXX-XXXX-XXXX. It's definitely correct.",
        time: "Jan 13, 3:42 PM",
      },
    ],
  },
  {
    id: "#1235",
    user: "@mary_k",
    email: "mary@example.com",
    category: "Crypto",
    subject: "Transaction stuck in pending",
    status: "pending",
    priority: "medium",
    created: "1 day ago",
    lastReply: "5 hours ago",
    messages: [
      {
        sender: "user",
        name: "Mary K",
        message: "My USDT withdrawal has been pending for 24 hours. Transaction ID: TX-2026-005678",
        time: "Jan 12, 10:00 AM",
      },
    ],
  },
  {
    id: "#1236",
    user: "@tunde99",
    email: "tunde@example.com",
    category: "Games",
    subject: "Wrong player ID charged",
    status: "open",
    priority: "high",
    created: "3 hours ago",
    lastReply: "1 hour ago",
    messages: [
      {
        sender: "user",
        name: "Tunde Ade",
        message: "I recharged COD Mobile but the CP went to the wrong player ID. Please help!",
        time: "Jan 13, 11:00 AM",
      },
    ],
  },
  {
    id: "#1237",
    user: "@alex_smith",
    email: "alex@example.com",
    category: "Account",
    subject: "Unable to login",
    status: "resolved",
    priority: "low",
    created: "2 days ago",
    lastReply: "1 day ago",
    messages: [],
  },
  {
    id: "#1238",
    user: "@jane_w",
    email: "jane@example.com",
    category: "Gift Cards",
    subject: "Rate discrepancy",
    status: "closed",
    priority: "low",
    created: "3 days ago",
    lastReply: "2 days ago",
    messages: [],
  },
];

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const variants: Record<Ticket["status"], { variant: "success" | "warning" | "info" | "default"; label: string }> = {
    open: { variant: "warning", label: "Open" },
    pending: { variant: "info", label: "Pending" },
    resolved: { variant: "success", label: "Resolved" },
    closed: { variant: "default", label: "Closed" },
  };
  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
};

const PriorityBadge = ({ priority }: { priority: Ticket["priority"] }) => {
  const variants: Record<Ticket["priority"], { variant: "error" | "warning" | "default"; label: string }> = {
    high: { variant: "error", label: "High" },
    medium: { variant: "warning", label: "Medium" },
    low: { variant: "default", label: "Low" },
  };
  const { variant, label } = variants[priority];
  return <Badge variant={variant}>{label}</Badge>;
};

const Support = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [replyText, setReplyText] = useState("");

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = mockTickets.filter((t) => t.status === "open").length;
  const pendingCount = mockTickets.filter((t) => t.status === "pending").length;
  const resolvedToday = 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{resolvedToday}</p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-surface-1 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, user, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-2 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-surface-2 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-surface-2 border-border">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-surface-1 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Ticket ID</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Subject</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Priority</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground">Last Reply</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="border-border hover:bg-surface-2 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell className="font-mono text-sm text-foreground">{ticket.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ticket.user}</p>
                      <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ticket.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-foreground">{ticket.subject}</TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                  <TableCell className="text-muted-foreground">{ticket.created}</TableCell>
                  <TableCell className="text-muted-foreground">{ticket.lastReply}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-surface-1 border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Ticket {selectedTicket?.id}</span>
              <div className="flex items-center gap-2">
                {selectedTicket && <StatusBadge status={selectedTicket.status} />}
                {selectedTicket && <PriorityBadge priority={selectedTicket.priority} />}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Ticket Info */}
              <div className="p-4 bg-surface-2 rounded-lg mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{selectedTicket.user}</span>
                    <span className="text-xs text-muted-foreground">{selectedTicket.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-orange-500">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Category:</span> {selectedTicket.category} • 
                  <span className="font-medium ml-2">Subject:</span> {selectedTicket.subject}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {selectedTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.sender === "admin"
                        ? "bg-orange-500/8 border border-orange-500/15 ml-8"
                        : "bg-surface-2 mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${msg.sender === "admin" ? "text-orange-500" : "text-foreground"}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="border-t border-border pt-4">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mb-3 bg-surface-2 border-border"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-border" />
                      Send email notification
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Add Internal Note</Button>
                    <Button variant="accent" size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
