import { Mail, MapPin, Clock, Smartphone, Monitor } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  lastSeen: string;
  device: "IOS" | "Android" | "Windows" | "Mac";
  location: string;
}

const admins: Admin[] = [
  {
    id: "1",
    name: "Vine Obed",
    email: "obedvine@gmail.com",
    role: "Operations Manager",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastSeen: "3h ago",
    device: "IOS",
    location: "Lagos, Nigeria",
  },
  {
    id: "2",
    name: "Benedita Josh",
    email: "benvyj@gmail.com",
    role: "Support Agent",
    avatar: "https://i.pravatar.cc/150?img=45",
    lastSeen: "3h ago",
    device: "IOS",
    location: "Abuja, Nigeria",
  },
  {
    id: "3",
    name: "Precious Chisom",
    email: "pcc09@gmail.com",
    role: "Compliance Officer",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastSeen: "3h ago",
    device: "Windows",
    location: "PH, Nigeria",
  },
  {
    id: "4",
    name: "Vine Obed",
    email: "obedvine@gmail.com",
    role: "Operations Manager",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastSeen: "3h ago",
    device: "IOS",
    location: "Lagos, Nigeria",
  },
];

const DeviceIcon = ({ device }: { device: Admin["device"] }) => {
  if (device === "IOS" || device === "Android") return <Smartphone className="w-3 h-3" />;
  return <Monitor className="w-3 h-3" />;
};

export const PendingActions = () => {
  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 flex flex-col h-full max-h-[470px] backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-gray-700/30 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Admin Logs</h3>
        <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-[#F8F8F8] dark:bg-[#252525] rounded-[20px] p-3.5 border border-transparent hover:border-orange-500/20 hover:bg-white dark:hover:bg-[#2D2D2D] transition-all duration-300 group"
            >
              {/* Top Section */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-orange-500/30 transition-all">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight truncate">
                    {admin.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">
                    {admin.email}
                  </p>
                </div>
              </div>

              {/* Role & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 px-2.5 py-0.5 bg-gray-200/50 dark:bg-white/10 rounded-md">
                  {admin.role}
                </span>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-y-2 border-t border-gray-100 dark:border-white/5 pt-3">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{admin.lastSeen}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 justify-end">
                  <DeviceIcon device={admin.device} />
                  <span className="text-[10px] font-medium">{admin.device}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 col-span-2">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-medium truncate">{admin.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};