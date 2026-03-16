import { useState, useRef } from "react";
import { Search, Plus, Pencil, ChevronDown, TrendingUp, Gamepad2, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  name: string;
  currency: string;
  minRecharge: number;
  provider: string;
  lastSynced: string;
  region: string;
  active: boolean;
  image?: string;
}

const initialGames: Game[] = [
  { id: "1", name: "COD Mobile",         currency: "CP",      minRecharge: 3500, provider: "Reloadly", lastSynced: "2 mins ago", region: "Global", active: true  },
  { id: "2", name: "Dream League Soccer", currency: "UC",      minRecharge: 1500, provider: "Reloadly", lastSynced: "N/A",        region: "Global", active: false },
  { id: "3", name: "Fortnite",            currency: "Diamond", minRecharge: 2500, provider: "Reloadly", lastSynced: "2 mins ago", region: "Global", active: true  },
  { id: "4", name: "Gran Turismo",        currency: "CP",      minRecharge: 950,  provider: "Reloadly", lastSynced: "2 mins ago", region: "Global", active: true  },
  { id: "5", name: "Mobile Legends",      currency: "CP",      minRecharge: 1400, provider: "Reloadly", lastSynced: "N/A",        region: "Global", active: false },
  { id: "6", name: "PUBG Mobile",         currency: "CP",      minRecharge: 1700, provider: "Reloadly", lastSynced: "2 mins ago", region: "Global", active: true  },
];

const currencies = ["CP", "UC", "Diamond", "Gold", "Gems", "Tokens"];
const providers  = ["Reloadly", "DirectTopUp", "GameFuel", "Other"];
const regions    = ["Global", "Africa", "Nigeria", "Europe", "North America", "Asia"];

const fmt = (n: number) => `₦ ${n.toLocaleString()}`;

const Sel = ({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) => (
  <div className="relative">
    <select value={value} onChange={(e) => set(e.target.value)} className="w-full appearance-none pl-3 pr-8 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border border-gray-200/50 dark:border-gray-700/30 rounded-[12px] text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-300 dark:focus:border-orange-500/30 cursor-pointer">
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
  </div>
);

export const SupportedGamesTab = () => {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Add game dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("CP");
  const [newMin, setNewMin] = useState("");
  const [newProvider, setNewProvider] = useState("Reloadly");
  const [newRegion, setNewRegion] = useState("Global");
  const [newImage, setNewImage] = useState<string | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);

  // Edit game dialog
  const [editTarget, setEditTarget] = useState<Game | null>(null);
  const [editName, setEditName] = useState("");
  const [editCurrency, setEditCurrency] = useState("CP");
  const [editMin, setEditMin] = useState("");
  const [editProvider, setEditProvider] = useState("Reloadly");
  const [editRegion, setEditRegion] = useState("Global");
  const [editActive, setEditActive] = useState(true);
  const [editImage, setEditImage] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const openEdit = (g: Game) => {
    setEditTarget(g);
    setEditName(g.name);
    setEditCurrency(g.currency);
    setEditMin(String(g.minRecharge));
    setEditProvider(g.provider);
    setEditRegion(g.region);
    setEditActive(g.active);
    setEditImage(g.image ?? null);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    setGames((prev) => prev.map((g) =>
      g.id === editTarget.id
        ? { ...g, name: editName, currency: editCurrency, minRecharge: Number(editMin), provider: editProvider, region: editRegion, active: editActive, image: editImage ?? g.image }
        : g
    ));
    setEditTarget(null);
  };

  const addGame = () => {
    if (!newName || !newMin) return;
    setGames((prev) => [...prev, {
      id: String(Date.now()), name: newName, currency: newCurrency,
      minRecharge: Number(newMin), provider: newProvider,
      lastSynced: "Just now", region: newRegion, active: true,
      image: newImage ?? undefined,
    }]);
    setAddOpen(false);
    setNewName(""); setNewMin(""); setNewImage(null);
  };

  const toggleActive = (id: string) => setGames((prev) => prev.map((g) => g.id === id ? { ...g, active: !g.active } : g));

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const filtered = games.filter((g) => {
    const mQ = g.name.toLowerCase().includes(search.toLowerCase());
    const mS = statusFilter === "All Status" || (statusFilter === "Active" ? g.active : !g.active);
    return mQ && mS;
  });

  return (
    <div className="space-y-3">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Games",          value: games.filter(g => g.active).length,  sub: "Games currently available for recharge",  icon: Gamepad2   },
          { label: "Disabled Game",         value: games.filter(g => !g.active).length, sub: "Currently unavailable for recharge",       icon: XCircle    },
          { label: "Total Recharges Today", value: "2,431",                              sub: "Game top-ups processed today",             icon: TrendingUp },
          { label: "Most Popular Game",     value: "PUBG Mobile",                        sub: "Highest transaction volume today",         icon: TrendingUp },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] p-4 border border-gray-200/50 dark:border-gray-700/30 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
              <div className="w-7 h-7 rounded-full bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-[18px] font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20">
          <p className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Supported Games</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search game...." className="pl-8 h-9 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 text-[12px] placeholder:text-gray-400" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-7 h-9 bg-white dark:bg-[#1C1C1C] border border-gray-200/60 dark:border-gray-700/40 rounded-full text-[12px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] focus:outline-none transition-all">
                {["All Status", "Active", "Disabled"].map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">
              <Plus className="w-3.5 h-3.5" /> Add New Game
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["Games", "Currency", "Min Recharge", "API Provider", "Last Synced", "Region", "Status", "Quick Toggle", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors">
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">{g.name}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 dark:text-gray-300">{g.currency}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 dark:text-gray-300">{fmt(g.minRecharge)}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 dark:text-gray-300">{g.provider}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500 dark:text-gray-400">{g.lastSynced}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-700 dark:text-gray-300">{g.region}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border rounded-full text-[11px] font-semibold px-3 py-0.5 bg-transparent",
                      g.active ? "border-green-500 text-green-600 dark:text-green-400" : "border-orange-400 text-orange-600 dark:text-orange-400"
                    )}>{g.active ? "Active" : "Disabled"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={g.active} onCheckedChange={() => toggleActive(g.id)} className="data-[state=checked]:bg-green-500 scale-90" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(g)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add New Game Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Add New Game</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Add a new game to the supported list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Game Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Need for speed" className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Select Currency</Label>
                <Sel value={newCurrency} set={setNewCurrency} opts={currencies} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Min Recharge</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">₦</span>
                  <Input value={newMin} onChange={(e) => setNewMin(e.target.value)} type="number" className="pl-7 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">API Provider</Label>
              <Sel value={newProvider} set={setNewProvider} opts={providers} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Supported Region</Label>
              <Sel value={newRegion} set={setNewRegion} opts={regions} />
            </div>
            {/* Image upload */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Game Icon</Label>
              <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, setNewImage)} />
              {newImage ? (
                <div className="relative rounded-[12px] overflow-hidden h-24 cursor-pointer" onClick={() => addFileRef.current?.click()}>
                  <img src={newImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Change game icon</span>
                  </div>
                </div>
              ) : (
                <button onClick={() => addFileRef.current?.click()} className="w-full h-20 rounded-[12px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-[12px] text-gray-400 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-500 transition-all">
                  <Plus className="w-4 h-4" /> Upload game icon
                </button>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setAddOpen(false)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100/60 transition-all">Cancel</button>
            <button disabled={!newName || !newMin} onClick={addGame} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed">Add Game</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Game Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Edit Game</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">Update game settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Game Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Select Currency</Label>
                <Sel value={editCurrency} set={setEditCurrency} opts={currencies} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Min Recharge</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">₦</span>
                  <Input value={editMin} onChange={(e) => setEditMin(e.target.value)} type="number" className="pl-7 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">API Provider</Label>
              <Sel value={editProvider} set={setEditProvider} opts={providers} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Supported Region</Label>
              <Sel value={editRegion} set={setEditRegion} opts={regions} />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Status</span>
              <Switch checked={editActive} onCheckedChange={setEditActive} className="data-[state=checked]:bg-green-500 scale-90" />
            </div>
            {/* Image */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Game Icon</Label>
              <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, setEditImage)} />
              {editImage ? (
                <div className="relative rounded-[12px] overflow-hidden h-28 cursor-pointer" onClick={() => editFileRef.current?.click()}>
                  <img src={editImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Change game icon</span>
                  </div>
                </div>
              ) : (
                <button onClick={() => editFileRef.current?.click()} className="w-full h-20 rounded-[12px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-[12px] text-gray-400 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-500 transition-all">
                  <Plus className="w-4 h-4" /> Upload game icon
                </button>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setEditTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100/60 transition-all">Cancel</button>
            <button onClick={saveEdit} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">Add Game</button>
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