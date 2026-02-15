import { useState } from "react";
import { Save, Edit2, X, Check } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Limit {
  tier: string;
  tierBadge: "tier0" | "tier1" | "tier2";
  dailyLimit: number;
  perTransaction: number;
  cryptoWithdrawal: number;
}

const initialLimits: Limit[] = [
  { tier: "Tier 0", tierBadge: "tier0", dailyLimit: 0, perTransaction: 0, cryptoWithdrawal: 0 },
  { tier: "Tier 1", tierBadge: "tier1", dailyLimit: 500000, perTransaction: 200000, cryptoWithdrawal: 200000 },
  { tier: "Tier 2", tierBadge: "tier2", dailyLimit: 1000000, perTransaction: 500000, cryptoWithdrawal: 500000 },
];

const TransactionLimits = () => {
  const [limits, setLimits] = useState<Limit[]>(initialLimits);
  const [editingLimit, setEditingLimit] = useState<Limit | null>(null);
  const [formData, setFormData] = useState<Limit | null>(null);

  const formatNaira = (amount: number) => {
    if (amount === 0) return "₦0 (browse only)";
    return `₦${amount.toLocaleString()}`;
  };

  const handleEdit = (limit: Limit) => {
    setEditingLimit(limit);
    setFormData({ ...limit });
  };

  const handleSave = () => {
    if (!formData) return;
    
    setLimits(prev => 
      prev.map(l => l.tier === formData.tier ? formData : l)
    );
    toast.success(`${formData.tier} limits updated successfully`);
    setEditingLimit(null);
    setFormData(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaction Limits</h1>
          <p className="text-muted-foreground mt-1">Configure transaction limits by KYC tier</p>
        </div>
        <Button variant="accent" className="gap-2">
          <Save className="w-4 h-4" />
          Save All Changes
        </Button>
      </div>

      {/* Info Card */}
      <div className="card-glow bg-card rounded-xl p-4 border-l-4 border-orange-500">
        <h3 className="font-medium text-foreground">About Transaction Limits</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Transaction limits control the maximum amount users can transact based on their KYC verification level. 
          Higher tiers have higher limits as users have been more thoroughly verified.
        </p>
      </div>

      {/* Limits Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
              <TableHead className="text-muted-foreground">KYC Tier</TableHead>
              <TableHead className="text-muted-foreground">Daily Limit</TableHead>
              <TableHead className="text-muted-foreground">Per Transaction</TableHead>
              <TableHead className="text-muted-foreground">Crypto Withdrawal (Daily)</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {limits.map((limit) => (
              <TableRow key={limit.tier} className="border-border">
                <TableCell>
                  <Badge variant={limit.tierBadge}>{limit.tier}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{formatNaira(limit.dailyLimit)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{formatNaira(limit.perTransaction)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{formatNaira(limit.cryptoWithdrawal)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleEdit(limit)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLimit} onOpenChange={() => setEditingLimit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingLimit?.tier} Limits</DialogTitle>
            <DialogDescription>
              Update the transaction limits for this KYC tier.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Transaction Limit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) || 0 })}
                    className="pl-8 bg-surface-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perTransaction">Per Transaction Limit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="perTransaction"
                    type="number"
                    value={formData.perTransaction}
                    onChange={(e) => setFormData({ ...formData, perTransaction: parseInt(e.target.value) || 0 })}
                    className="pl-8 bg-surface-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cryptoWithdrawal">External Crypto Withdrawal Limit (Daily)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="cryptoWithdrawal"
                    type="number"
                    value={formData.cryptoWithdrawal}
                    onChange={(e) => setFormData({ ...formData, cryptoWithdrawal: parseInt(e.target.value) || 0 })}
                    className="pl-8 bg-surface-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLimit(null)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionLimits;
