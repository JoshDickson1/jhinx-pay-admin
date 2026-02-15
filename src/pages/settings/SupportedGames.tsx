import { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Gamepad2,
  RefreshCw,
  Upload
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

interface Game {
  id: string;
  name: string;
  currency: string;
  apiProvider: string;
  status: "active" | "disabled";
  lastSynced: string;
  region: string;
}

const initialGames: Game[] = [
  { id: "1", name: "COD Mobile", currency: "CP", apiProvider: "Reloadly", status: "active", lastSynced: "2 mins ago", region: "Global" },
  { id: "2", name: "PUBG Mobile", currency: "UC", apiProvider: "Reloadly", status: "active", lastSynced: "2 mins ago", region: "Global" },
  { id: "3", name: "Free Fire", currency: "Diamonds", apiProvider: "Reloadly", status: "disabled", lastSynced: "N/A", region: "Global" },
  { id: "4", name: "Mobile Legends", currency: "Diamonds", apiProvider: "Reloadly", status: "active", lastSynced: "5 mins ago", region: "Asia" },
  { id: "5", name: "Genshin Impact", currency: "Genesis Crystals", apiProvider: "Reloadly", status: "active", lastSynced: "3 mins ago", region: "Global" },
  { id: "6", name: "Roblox", currency: "Robux", apiProvider: "Reloadly", status: "active", lastSynced: "1 min ago", region: "Global" },
];

const SupportedGames = () => {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    currency: "",
    apiProvider: "Reloadly",
    region: "Global",
  });

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (game: Game) => {
    setGames(prev => 
      prev.map(g => g.id === game.id 
        ? { ...g, status: g.status === "active" ? "disabled" : "active", lastSynced: g.status === "disabled" ? "Just now" : "N/A" } 
        : g
      )
    );
    toast.success(`${game.name} has been ${game.status === "active" ? "disabled" : "enabled"}`);
  };

  const handleDelete = (game: Game) => {
    setGames(prev => prev.filter(g => g.id !== game.id));
    toast.success(`${game.name} has been removed`);
  };

  const handleAddGame = () => {
    const newGame: Game = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      currency: formData.currency,
      apiProvider: formData.apiProvider,
      status: "active",
      lastSynced: "Just now",
      region: formData.region,
    };
    setGames(prev => [...prev, newGame]);
    toast.success(`${formData.name} has been added`);
    setIsAddDialogOpen(false);
    setFormData({ name: "", currency: "", apiProvider: "Reloadly", region: "Global" });
  };

  const handleSync = (game: Game) => {
    setGames(prev => 
      prev.map(g => g.id === game.id ? { ...g, lastSynced: "Just now" } : g)
    );
    toast.success(`${game.name} synced successfully`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supported Games</h1>
          <p className="text-muted-foreground mt-1">Manage game recharge options</p>
        </div>
        <Button variant="accent" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Game
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{games.length}</p>
              <p className="text-sm text-muted-foreground">Total Games</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Power className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {games.filter(g => g.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="card-glow bg-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/10 flex items-center justify-center">
              <PowerOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {games.filter(g => g.status === "disabled").length}
              </p>
              <p className="text-sm text-muted-foreground">Disabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-1 border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-surface-1 border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Games Table */}
      <div className="card-glow bg-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-1 border-border hover:bg-surface-1">
              <TableHead className="text-muted-foreground">Game</TableHead>
              <TableHead className="text-muted-foreground">Currency</TableHead>
              <TableHead className="text-muted-foreground">API Provider</TableHead>
              <TableHead className="text-muted-foreground">Region</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Last Synced</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => (
              <TableRow key={game.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="font-medium text-foreground">{game.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border">{game.currency}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{game.apiProvider}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{game.region}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={game.status === "active" ? "success" : "secondary"}>
                    {game.status === "active" ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{game.lastSynced}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSync(game)}
                      disabled={game.status === "disabled"}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleToggleStatus(game)}
                    >
                      {game.status === "active" ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingGame(game)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(game)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Game Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Add a new game for recharge support.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Game Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fortnite"
                className="bg-surface-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency Name</Label>
              <Input
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="e.g., V-Bucks"
                className="bg-surface-1"
              />
            </div>
            <div className="space-y-2">
              <Label>API Provider</Label>
              <Select 
                value={formData.apiProvider} 
                onValueChange={(value) => setFormData({ ...formData, apiProvider: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reloadly">Reloadly</SelectItem>
                  <SelectItem value="RapidAPI">RapidAPI</SelectItem>
                  <SelectItem value="Custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supported Region</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger className="bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global">Global</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Americas">Americas</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Game Icon</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 1MB</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleAddGame} disabled={!formData.name || !formData.currency}>
              Add Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportedGames;
