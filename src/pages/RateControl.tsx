import { useState } from "react";
import { Save } from "lucide-react";
import { GiftcardRates } from "@/components/GiftcardRates";
import { TransactionLimitsTab } from "@/components/TransactionLimitsTab";
import { SupportedGamesTab } from "@/components/SupportedGamesTab";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tab = "giftcard" | "limits" | "games";

const tabs: { id: Tab; label: string }[] = [
  { id: "giftcard", label: "Giftcard Rates"      },
  { id: "limits",   label: "Transactions limits" },
  { id: "games",    label: "Supported Games"     },
];

const RateControl = () => {
  const [activeTab, setActiveTab] = useState<Tab>("giftcard");
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rates &amp; Controls</h1>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            Manage payout rates, transaction limits, and supported games
          </p>
        </div>
        <button
          onClick={() => setSaveOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/25 flex-shrink-0"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "giftcard" && <GiftcardRates />}
      {activeTab === "limits"   && <TransactionLimitsTab />}
      {activeTab === "games"    && <SupportedGamesTab />}

      {/* ── Save Changes Confirmation Dialog ── */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="bg-white dark:bg-[#1C1C1C] border-gray-200/50 dark:border-gray-700/30 rounded-[20px] shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-gray-900 dark:text-white">Save All Changes?</DialogTitle>
            <DialogDescription className="text-[12px] text-gray-500 dark:text-gray-400">
              This will apply all pending updates to rates, limits, and game configurations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setSaveOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-medium bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setSaveOpen(false)}
              className="flex-1 py-2 rounded-full text-[12px] font-semibold bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RateControl;