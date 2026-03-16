import { useState } from "react";
import {
  Search, MoreHorizontal, Plus, Pencil, Pause, Play, ChevronDown,
  CreditCard, Clock, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CardRate {
  id: string;
  brand: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  status: "Active" | "Paused";
  lastUpdated: string;
}

const initialRates: CardRate[] = [
  { id: "1", brand: "iTunes",      buyRate: 1580, sellRate: 1520, spread: 60, status: "Active",  lastUpdated: "2m ago"          },
  { id: "2", brand: "Amazon",      buyRate: 1580, sellRate: 1510, spread: 64, status: "Paused",  lastUpdated: "10m ago"         },
  { id: "3", brand: "Steam",       buyRate: 1580, sellRate: 1521, spread: 62, status: "Active",  lastUpdated: "Jan 12, 10:30 AM"},
  { id: "4", brand: "Apple",       buyRate: 1580, sellRate: 1525, spread: 64, status: "Active",  lastUpdated: "Jan 12, 10:30 AM"},
  { id: "5", brand: "Google Play", buyRate: 1580, sellRate: 1523, spread: 60, status: "Paused",  lastUpdated: "Jan 12, 10:30 AM"},
  { id: "6", brand: "PlayStation", buyRate: 1580, sellRate: 1520, spread: 67, status: "Active",  lastUpdated: "Jan 12, 10:30 AM"},
];

const brandOptions = ["iTunes", "Amazon", "Steam", "Apple", "Google Play", "PlayStation", "eBay", "Vanilla", "Razer Gold"];

const fmt = (n: number) => `₦${n.toLocaleString()}`;

// ── Filter select ──────────────────────────────────────────────────────────
const Sel = ({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) => (
  <div className="relative">
    <select value={value} onChange={(e) => set(e.target.value)} className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none focus:border-orange-300 transition-all">
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
  </div>
);

export const GiftcardRates = () => {
  const [rates, setRates] = useState<CardRate[]>(initialRates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [ratesFilter, setRatesFilter] = useState("Rates");

  // Edit dialog
  const [editTarget, setEditTarget] = useState<CardRate | null>(null);
  const [editBrand, setEditBrand] = useState("");
  const [editBuy, setEditBuy] = useState("");
  const [editSell, setEditSell] = useState("");
  const [editImmediate, setEditImmediate] = useState(true);
  const [editSchedule, setEditSchedule] = useState(false);

  // Add new card dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newBrandSearch, setNewBrandSearch] = useState("");
  const [newBrandOpen, setNewBrandOpen] = useState(false);
  const [newBuy, setNewBuy] = useState("");
  const [newSell, setNewSell] = useState("");
  const [newImmediate, setNewImmediate] = useState(true);
  const [newSchedule, setNewSchedule] = useState(false);

  // Bulk edit dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRate, setBulkRate] = useState("");
  const [bulkImmediate, setBulkImmediate] = useState(true);
  const [bulkSchedule, setBulkSchedule] = useState(false);

  const openEdit = (r: CardRate) => {
    setEditTarget(r);
    setEditBrand(r.brand);
    setEditBuy(String(r.buyRate));
    setEditSell(String(r.sellRate));
    setEditImmediate(true);
    setEditSchedule(false);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    setRates((prev) => prev.map((r) => r.id === editTarget.id
      ? { ...r, brand: editBrand, buyRate: Number(editBuy), sellRate: Number(editSell), spread: Number(editBuy) - Number(editSell), lastUpdated: "Just now" }
      : r
    ));
    setEditTarget(null);
  };

  const quickPause = (id: string) => setRates((prev) => prev.map((r) => r.id === id ? { ...r, status: "Paused", lastUpdated: "Just now" } : r));
  const quickResume = (id: string) => setRates((prev) => prev.map((r) => r.id === id ? { ...r, status: "Active", lastUpdated: "Just now" } : r));

  const addCard = () => {
    if (!newBrand || !newBuy || !newSell) return;
    setRates((prev) => [...prev, {
      id: String(Date.now()), brand: newBrand,
      buyRate: Number(newBuy), sellRate: Number(newSell),
      spread: Number(newBuy) - Number(newSell),
      status: "Active", lastUpdated: "Just now",
    }]);
    setAddOpen(false);
    setNewBrand(""); setNewBuy(""); setNewSell(""); setNewBrandSearch("");
  };

  const filtered = rates.filter((r) => {
    const q = search.toLowerCase();
    const mQ = r.brand.toLowerCase().includes(q);
    const mS = statusFilter === "Status" || r.status === statusFilter;
    return mQ && mS;
  });

  const filteredBrands = brandOptions.filter((b) => b.toLowerCase().includes(newBrandSearch.toLowerCase()));

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Active Gift Cards", value: rates.filter(r => r.status === "Active").length, sub: "Cards currently available for trading", icon: CreditCard },
          { label: "Pending Changes", value: 3, sub: "Rates awaiting approval / scheduled", icon: AlertCircle },
          { label: "Last Updated", value: "Today 4:32 pm", sub: "Last rate modification timestamp", icon: Clock },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-[20px] font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20">
          <p className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Giftcard Rates</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by brand or rate...." className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400" />
            </div>
            <Sel value={statusFilter} set={setStatusFilter} opts={["Status", "Active", "Paused"]} />
            <Sel value={ratesFilter} set={setRatesFilter} opts={["Rates", "Highest Buy", "Lowest Buy", "Highest Sell"]} />
            <button onClick={() => setBulkOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#EFEFEF] dark:hover:bg-[#333] border border-gray-200/60 dark:border-gray-700/40 transition-all">
              <Pencil className="w-3.5 h-3.5" /> Bulk Rates Edit
            </button>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
              <Plus className="w-3.5 h-3.5" /> Add New Card
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Brand", "Buy Rate (per 1$)", "Sell Rate (per 1$)", "Spread", "Status", "Last updated", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors">
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-900 dark:text-white">{r.brand}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-900 dark:text-white">{fmt(r.buyRate)}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-900 dark:text-white">{fmt(r.sellRate)}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 dark:text-gray-300">{fmt(r.spread)}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border rounded-full text-[11px] font-semibold px-3 py-0.5 bg-transparent",
                      r.status === "Active" ? "border-green-500 text-green-600 dark:text-green-400" : "border-orange-400 text-orange-600 dark:text-orange-400"
                    )}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-gray-400">{r.lastUpdated}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-colors ml-auto">
                          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] p-1.5 shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(r)} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B]">
                          <Pencil className="w-3.5 h-3.5 text-gray-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
                        <DropdownMenuItem onClick={() => quickPause(r.id)} disabled={r.status === "Paused"} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40">
                          <Pause className="w-3.5 h-3.5 text-orange-500" /> Quick Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => quickResume(r.id)} disabled={r.status === "Active"} className="rounded-[10px] text-[12px] cursor-pointer gap-2 px-2 py-2 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] disabled:opacity-40">
                          <Play className="w-3.5 h-3.5 text-green-500" /> Quick Resume
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Rate Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Edit Rate</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Changes will affect new transactions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Card Brand</Label>
              <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Buy Rate", val: editBuy, set: setEditBuy },
                { label: "Sell Rate", val: editSell, set: setEditSell },
                { label: "Spread", val: editBuy && editSell ? String(Number(editBuy) - Number(editSell)) : "", set: () => {} },
              ].map(({ label, val, set }) => (
                <div key={label} className="space-y-1">
                  <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">₦ |</span>
                    <Input value={val} onChange={(e) => set(e.target.value)} readOnly={label === "Spread"} className="pl-10 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Effective Immediately</span>
                <Switch checked={editImmediate} onCheckedChange={setEditImmediate} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Schedule Change</span>
                <Switch checked={editSchedule} onCheckedChange={setEditSchedule} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
            </div>
            {editSchedule && (
              <Input placeholder="MM/DD/YY - MM/DD/YY" className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setEditTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button onClick={saveEdit} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">Save Changes</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Edit Dialog ── */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Bulk Rates Edit</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Update all rates by a percentage on all cards</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Enter rate</Label>
                <Input value={bulkRate} onChange={(e) => setBulkRate(e.target.value)} placeholder="+/-/%" className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Spread</Label>
                <Input placeholder="Auto" readOnly className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus-visible:ring-0 rounded-[10px] text-[12px] opacity-60" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Effective Immediately</span>
                <Switch checked={bulkImmediate} onCheckedChange={setBulkImmediate} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Schedule Change</span>
                <Switch checked={bulkSchedule} onCheckedChange={setBulkSchedule} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
            </div>
            {bulkSchedule && (
              <Input placeholder="MM/DD/YY - MM/DD/YY" className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setBulkOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all">Cancel</button>
            <button disabled={!bulkRate} onClick={() => setBulkOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed">Confirm Bulk Update</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add New Card Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Create New Card</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Add new giftcard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {/* Brand dropdown with search */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Card Brand</Label>
              <div className="relative">
                <button
                  onClick={() => setNewBrandOpen(!newBrandOpen)}
                  className="w-full flex items-center justify-between px-3 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px] text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
                >
                  <span className={newBrand ? "text-gray-900 dark:text-white" : "text-gray-400"}>{newBrand || "Select brand"}</span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", newBrandOpen && "rotate-180")} />
                </button>
                {newBrandOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1C1C1C] border border-gray-200/50 dark:border-gray-700/30 rounded-[14px] shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input value={newBrandSearch} onChange={(e) => setNewBrandSearch(e.target.value)} placeholder="Search for Brand" className="w-full pl-8 pr-3 py-2 text-[12px] bg-[#F5F5F5] dark:bg-[#2D2B2B] rounded-[10px] border-0 focus:outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400" />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto p-1.5 space-y-0.5">
                      {filteredBrands.map((b) => (
                        <button key={b} onClick={() => { setNewBrand(b); setNewBrandOpen(false); }} className="w-full text-left px-3 py-2.5 text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] rounded-[10px] transition-colors">
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Buy Rate", val: newBuy, set: setNewBuy },
                { label: "Sell Rate", val: newSell, set: setNewSell },
                { label: "Spread", val: newBuy && newSell ? String(Number(newBuy) - Number(newSell)) : "Auto", set: () => {} },
              ].map(({ label, val, set }) => (
                <div key={label} className="space-y-1">
                  <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                  <div className="relative">
                    {label !== "Spread" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">₦ |</span>}
                    <input value={val} onChange={(e) => set(e.target.value)} readOnly={label === "Spread"} placeholder={label === "Spread" ? "Auto" : ""} className={cn("w-full h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[10px] text-[12px] focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 transition-all", label !== "Spread" ? "pl-10 pr-3" : "px-3")} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Effective Immediately</span>
                <Switch checked={newImmediate} onCheckedChange={setNewImmediate} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Schedule Change</span>
                <Switch checked={newSchedule} onCheckedChange={setNewSchedule} className="data-[state=checked]:bg-green-500 scale-90" />
              </div>
            </div>
            {newSchedule && (
              <Input placeholder="MM/DD/YY - MM/DD/YY" className="h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[10px] text-[12px]" />
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setAddOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100/60 transition-all">Cancel</button>
            <button disabled={!newBrand || !newBuy || !newSell} onClick={addCard} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed">Create card</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scrollbar:hover { scrollbar-color: rgba(156,163,175,0.3) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.3); }
      `}</style>
    </div>
  );
};