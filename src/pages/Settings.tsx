import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
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

interface Rate {
  brand: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  lastUpdated: string;
}

const rates: Rate[] = [
  { brand: "Amazon", buyRate: 1580, sellRate: 1520, spread: 60, lastUpdated: "Jan 13, 9:00 AM" },
  { brand: "iTunes", buyRate: 1580, sellRate: 1515, spread: 65, lastUpdated: "Jan 13, 9:00 AM" },
  { brand: "Google Play", buyRate: 1575, sellRate: 1510, spread: 65, lastUpdated: "Jan 12, 5:00 PM" },
  { brand: "Steam", buyRate: 1570, sellRate: 1505, spread: 65, lastUpdated: "Jan 12, 5:00 PM" },
  { brand: "Xbox", buyRate: 1565, sellRate: 1500, spread: 65, lastUpdated: "Jan 11, 2:00 PM" },
  { brand: "PlayStation", buyRate: 1565, sellRate: 1500, spread: 65, lastUpdated: "Jan 11, 2:00 PM" },
];

interface Limit {
  tier: string;
  dailyLimit: string;
  perTransaction: string;
}

const limits: Limit[] = [
  { tier: "Tier 0", dailyLimit: "₦0 (browse only)", perTransaction: "₦0" },
  { tier: "Tier 1", dailyLimit: "₦500,000", perTransaction: "₦200,000" },
  { tier: "Tier 2", dailyLimit: "₦1,000,000", perTransaction: "₦500,000" },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"rates" | "limits">("rates");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform rates and limits</p>
        </div>
        <Button variant="accent" className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("rates")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "rates" ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Gift Card Rates
          {activeTab === "rates" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("limits")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "limits" ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Transaction Limits
          {activeTab === "limits" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {activeTab === "rates" && (
        <div className="space-y-4">
          {/* Bulk Update */}
          <div className="card-glow bg-card rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Bulk Rate Update</h3>
              <p className="text-sm text-muted-foreground">Update all rates by a percentage</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="+/- %"
                className="w-24 bg-surface-1 border-border"
              />
              <Button variant="outline" className="border-border gap-2">
                <RefreshCw className="w-4 h-4" />
                Apply
              </Button>
            </div>
          </div>

          {/* Rates Table */}
          <div className="card-glow bg-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
                  <TableHead className="text-muted-foreground">Brand</TableHead>
                  <TableHead className="text-muted-foreground">Buy Rate (₦/$)</TableHead>
                  <TableHead className="text-muted-foreground">Sell Rate (₦/$)</TableHead>
                  <TableHead className="text-muted-foreground">Spread</TableHead>
                  <TableHead className="text-muted-foreground">Last Updated</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.brand} className="border-border">
                    <TableCell>
                      <Badge variant="outline" className="border-border">{rate.brand}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={rate.buyRate}
                        className="w-28 bg-surface-1 border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={rate.sellRate}
                        className="w-28 bg-surface-1 border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-orange-500 font-medium">₦{rate.spread}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{rate.lastUpdated}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "limits" && (
        <div className="card-glow bg-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
                <TableHead className="text-muted-foreground">KYC Tier</TableHead>
                <TableHead className="text-muted-foreground">Daily Limit</TableHead>
                <TableHead className="text-muted-foreground">Per Transaction</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limits.map((limit) => (
                <TableRow key={limit.tier} className="border-border">
                  <TableCell>
                    <Badge
                      variant={
                        limit.tier === "Tier 0" ? "tier0" :
                        limit.tier === "Tier 1" ? "tier1" : "tier2"
                      }
                    >
                      {limit.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{limit.dailyLimit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{limit.perTransaction}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Settings;
