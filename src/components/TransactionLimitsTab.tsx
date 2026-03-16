import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface TierLimit {
  id: string;
  tier: string;
  dailyLimit: number;
  singleLimit: number;
  cryptoWithdrawal: number;
}

const initialLimits: TierLimit[] = [
  { id: "1", tier: "Tier 1", dailyLimit: 0,         singleLimit: 0,       cryptoWithdrawal: 0       },
  { id: "2", tier: "Tier 2", dailyLimit: 500000,     singleLimit: 200000,  cryptoWithdrawal: 200000  },
  { id: "3", tier: "Tier 3", dailyLimit: 1000000,    singleLimit: 500000,  cryptoWithdrawal: 500000  },
];

const fmt = (n: number) => n === 0 ? "₦0.00" : `₦${n.toLocaleString()}`;

export const TransactionLimitsTab = () => {
  const [limits, setLimits] = useState<TierLimit[]>(initialLimits);
  const [editTarget, setEditTarget] = useState<TierLimit | null>(null);
  const [editDaily, setEditDaily] = useState("");
  const [editSingle, setEditSingle] = useState("");
  const [editCrypto, setEditCrypto] = useState("");

  const openEdit = (t: TierLimit) => {
    setEditTarget(t);
    setEditDaily(String(t.dailyLimit));
    setEditSingle(String(t.singleLimit));
    setEditCrypto(String(t.cryptoWithdrawal));
  };

  const saveEdit = () => {
    if (!editTarget) return;
    setLimits((prev) => prev.map((t) =>
      t.id === editTarget.id
        ? { ...t, dailyLimit: Number(editDaily), singleLimit: Number(editSingle), cryptoWithdrawal: Number(editCrypto) }
        : t
    ));
    setEditTarget(null);
  };

  return (
    <div className="space-y-3">
      {/* Table card */}
      <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-700/20">
          <p className="text-[13px] font-bold text-gray-900 dark:text-white">Transactions Limits</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5]/60 dark:bg-[#2D2B2B]/60">
                {["KYC Tier", "Daily Limit", "Single transaction limit", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-gray-700/20">
              {limits.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F5F5]/40 dark:hover:bg-[#2D2B2B]/40 transition-colors">
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-900 dark:text-white">{t.tier}</td>
                  <td className="px-4 py-4 text-center text-[13px] font-semibold text-gray-900 dark:text-white">{fmt(t.dailyLimit)}</td>
                  <td className="px-4 py-4 text-center text-[13px] font-semibold text-gray-900 dark:text-white">{fmt(t.singleLimit)}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => openEdit(t)}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Tier Limit Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">
              {editTarget?.tier}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              Edit tier limit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {[
              { label: "Daily Transaction Limit", val: editDaily, set: setEditDaily },
              { label: "Single Transaction Limit", val: editSingle, set: setEditSingle },
              { label: "External Crypto Withdrawal Limit (Daily)", val: editCrypto, set: setEditCrypto },
            ].map(({ label, val, set }) => (
              <div key={label} className="space-y-1">
                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-500">₦</span>
                  <Input
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    type="number"
                    className="pl-7 h-10 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 border-transparent focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 rounded-[12px] text-[13px]"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setEditTarget(null)} className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#FFF8E7] dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100/60 transition-all">Cancel</button>
            <button onClick={saveEdit} className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};