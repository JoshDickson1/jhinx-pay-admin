import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Activity, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { ActivityLogsTab } from "@/components/dashboard/ActivityLogsTab";
import { PreferencesTab } from "@/components/dashboard/PreferencesTab";

type Tab = "profile" | "activity" | "preferences";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "activity", label: "Activity Logs", icon: Activity },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];

const MyProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <div className="flex gap-3 items-start">
        {/* Sidebar Nav */}
        <div className="w-44 flex-shrink-0 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[16px] border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-2">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[12px] font-medium transition-all duration-200",
                  activeTab === id
                    ? "bg-gradient-to-r from-[#FFE6B0] to-[#FFD98A] text-gray-900 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  activeTab === id
                    ? "bg-white/60"
                    : "bg-[#F5F5F5] dark:bg-[#2D2B2B]"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "activity" && <ActivityLogsTab />}
          {activeTab === "preferences" && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;