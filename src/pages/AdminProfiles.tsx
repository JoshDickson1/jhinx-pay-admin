import { useState } from "react";
import { 
  Shield, 
  UserCog, 
  Ban, 
  Lock, 
  Unlock, 
  ArrowUpCircle, 
  ArrowDownCircle,
  MoreHorizontal,
  Search,
  Plus,
  Mail,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "operations_manager" | "support_agent" | "compliance_officer";
  status: "active" | "frozen" | "banned";
  lastActive: string;
  createdAt: string;
  avatar: string;
}

const admins: Admin[] = [
  { 
    id: "1", 
    name: "Sarah Johnson", 
    email: "sarah@jhinxpay.com", 
    role: "super_admin", 
    status: "active",
    lastActive: "2 mins ago",
    createdAt: "Jan 1, 2024",
    avatar: "SJ"
  },
  { 
    id: "2", 
    name: "Mike Chen", 
    email: "mike@jhinxpay.com", 
    role: "operations_manager", 
    status: "active",
    lastActive: "15 mins ago",
    createdAt: "Feb 15, 2024",
    avatar: "MC"
  },
  { 
    id: "3", 
    name: "Emily Davis", 
    email: "emily@jhinxpay.com", 
    role: "support_agent", 
    status: "active",
    lastActive: "1 hour ago",
    createdAt: "Mar 20, 2024",
    avatar: "ED"
  },
  { 
    id: "4", 
    name: "David Okonkwo", 
    email: "david@jhinxpay.com", 
    role: "compliance_officer", 
    status: "frozen",
    lastActive: "2 days ago",
    createdAt: "Apr 5, 2024",
    avatar: "DO"
  },
  { 
    id: "5", 
    name: "Lisa Thompson", 
    email: "lisa@jhinxpay.com", 
    role: "support_agent", 
    status: "banned",
    lastActive: "1 week ago",
    createdAt: "May 10, 2024",
    avatar: "LT"
  },
];

const roleLabels = {
  super_admin: "Super Admin",
  operations_manager: "Operations Manager",
  support_agent: "Support Agent",
  compliance_officer: "Compliance Officer",
};

const roleBadgeVariants = {
  super_admin: "accent" as const,
  operations_manager: "info" as const,
  support_agent: "secondary" as const,
  compliance_officer: "warning" as const,
};

const statusBadgeVariants = {
  active: "success" as const,
  frozen: "warning" as const,
  banned: "error" as const,
};

const AdminProfiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "freeze" | "unfreeze" | "ban" | "upgrade" | "downgrade" | "add" | null;
    admin: Admin | null;
  }>({ type: null, admin: null });

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = (type: typeof actionDialog.type, admin: Admin) => {
    setActionDialog({ type, admin });
  };

  const confirmAction = () => {
    if (!actionDialog.admin || !actionDialog.type) return;
    
    const actions = {
      freeze: `${actionDialog.admin.name}'s access has been frozen`,
      unfreeze: `${actionDialog.admin.name}'s access has been restored`,
      ban: `${actionDialog.admin.name} has been banned`,
      upgrade: `${actionDialog.admin.name} has been upgraded`,
      downgrade: `${actionDialog.admin.name} has been downgraded`,
      add: "New admin has been added",
    };
    
    toast.success(actions[actionDialog.type]);
    setActionDialog({ type: null, admin: null });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage admin accounts and permissions</p>
        </div>
        <Button 
          variant="accent" 
          className="gap-2"
          onClick={() => setActionDialog({ type: "add", admin: null })}
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{admins.length}</p>
              <p className="text-sm text-muted-foreground">Total Admins</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {admins.filter(a => a.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {admins.filter(a => a.status === "frozen").length}
              </p>
              <p className="text-sm text-muted-foreground">Frozen</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Ban className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {admins.filter(a => a.status === "banned").length}
              </p>
              <p className="text-sm text-muted-foreground">Banned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-1 border-border"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-surface-1 border-border">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="operations_manager">Operations Manager</SelectItem>
            <SelectItem value="support_agent">Support Agent</SelectItem>
            <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
              <TableHead className="text-muted-foreground">Admin</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Last Active</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                      <span className="text-orange-500 text-sm font-semibold">{admin.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariants[admin.role]}>
                    {roleLabels[admin.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariants[admin.status]}>
                    {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {admin.lastActive}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {admin.createdAt}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedAdmin(admin)}>
                        <UserCog className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("upgrade", admin)}>
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                        Upgrade Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("downgrade", admin)}>
                        <ArrowDownCircle className="w-4 h-4 mr-2" />
                        Downgrade Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {admin.status === "frozen" ? (
                        <DropdownMenuItem onClick={() => handleAction("unfreeze", admin)}>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unfreeze Access
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleAction("freeze", admin)}
                          disabled={admin.status === "banned"}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Freeze Access
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleAction("ban", admin)}
                        className="text-destructive"
                        disabled={admin.status === "banned"}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Ban Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog.type} onOpenChange={() => setActionDialog({ type: null, admin: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "freeze" && "Freeze Admin Access"}
              {actionDialog.type === "unfreeze" && "Restore Admin Access"}
              {actionDialog.type === "ban" && "Ban Admin"}
              {actionDialog.type === "upgrade" && "Upgrade Admin Role"}
              {actionDialog.type === "downgrade" && "Downgrade Admin Role"}
              {actionDialog.type === "add" && "Add New Admin"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "freeze" && `This will temporarily suspend ${actionDialog.admin?.name}'s access to the admin panel.`}
              {actionDialog.type === "unfreeze" && `This will restore ${actionDialog.admin?.name}'s access to the admin panel.`}
              {actionDialog.type === "ban" && `This will permanently ban ${actionDialog.admin?.name} from the admin panel. This action cannot be undone.`}
              {actionDialog.type === "upgrade" && `Select a new role for ${actionDialog.admin?.name}.`}
              {actionDialog.type === "downgrade" && `Select a new role for ${actionDialog.admin?.name}.`}
              {actionDialog.type === "add" && "Enter the details for the new admin."}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.type === "add" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" className="bg-surface-1" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Enter email address" className="bg-surface-1" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger className="bg-surface-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations_manager">Operations Manager</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                    <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(actionDialog.type === "upgrade" || actionDialog.type === "downgrade") && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <p className="text-sm text-muted-foreground">
                  {actionDialog.admin && roleLabels[actionDialog.admin.role]}
                </p>
              </div>
              <div className="space-y-2">
                <Label>New Role</Label>
                <Select>
                  <SelectTrigger className="bg-surface-1">
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="operations_manager">Operations Manager</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                    <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, admin: null })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === "ban" ? "destructive" : "accent"}
              onClick={confirmAction}
            >
              {actionDialog.type === "freeze" && "Freeze Access"}
              {actionDialog.type === "unfreeze" && "Restore Access"}
              {actionDialog.type === "ban" && "Ban Admin"}
              {actionDialog.type === "upgrade" && "Upgrade"}
              {actionDialog.type === "downgrade" && "Downgrade"}
              {actionDialog.type === "add" && "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Profile Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Profile</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/15 flex items-center justify-center">
                  <span className="text-orange-500 text-xl font-bold">{selectedAdmin.avatar}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedAdmin.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant={roleBadgeVariants[selectedAdmin.role]}>
                    {roleLabels[selectedAdmin.role]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusBadgeVariants[selectedAdmin.status]}>
                    {selectedAdmin.status.charAt(0).toUpperCase() + selectedAdmin.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Last Active</span>
                  <span className="text-foreground">{selectedAdmin.lastActive}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">{selectedAdmin.createdAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button variant="accent" className="flex-1 gap-2">
                  <UserCog className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfiles;
