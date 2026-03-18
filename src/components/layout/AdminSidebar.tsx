import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  // Users,
  ArrowLeftRight,
  Settings,
  // FileText,
  // Shield,
  UserCog,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  TicketCheck,
  Users2,
  MessageCircle,
  Ticket,
  Settings2,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  children?: { to: string; label: string; badge?: number }[];
}

const NavItem = ({ to, icon: Icon, label, badge, children }: NavItemProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeChild = children?.find((child) => location.pathname === child.to);
  const isParentActive = location.pathname === to;
  const hasChildren = children && children.length > 0;

  useEffect(() => {
    if (activeChild) {
      setIsOpen(true);
    }
  }, [activeChild]);

  if (hasChildren) {
    return (
      <div className="space-y-0.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-2.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300",
            isOpen 
              ? "bg-gradient-to-r from-[#FFE6B0] to-[#FFD98A] text-gray-900 shadow-sm" 
              : "bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737]"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen 
              ? "bg-white/50 shadow-sm" 
              : "bg-white/60 dark:bg-[#3A3737]"
          )}>
            <Icon className="w-[14px] h-[14px]" />
          </div>
          <span className="flex-1 text-left">{label}</span>
          {badge && (
            <Badge 
              variant="warning" 
              className="text-[9px] px-1.5 py-0 bg-orange-500/20 text-orange-700 dark:text-orange-400 border-0 rounded-full"
            >
              {badge}
            </Badge>
          )}
          {isOpen ? (
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
          )}
        </button>
        
        {isOpen && (
          <div className="ml-5 mt-0.5 space-y-0.5 relative pl-2.5">
            <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-orange-300/60 via-orange-300/40 to-transparent dark:from-orange-400/40 dark:via-orange-400/30" />
            
            {children.map((child) => {
              const isChildActive = location.pathname === child.to;
              return (
                <div key={child.to} className="relative">
                  {isChildActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[2px] rounded-full bg-gradient-to-r from-orange-400 to-orange-300 dark:from-orange-400/70 dark:to-orange-300/50" />
                  )}
                  
                  <NavLink
                    to={child.to}
                    className={cn(
                      "flex items-center gap-2 pl-5 pr-2.5 py-2 rounded-full text-[12px] transition-all duration-300 relative",
                      isChildActive
                        ? "bg-gradient-to-r from-[#FFE6B0] to-[#FFD98A] text-gray-900 font-medium shadow-sm ml-1"
                        : "text-gray-600 dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] hover:text-gray-900 dark:hover:text-gray-200 ml-1"
                    )}
                  >
                    <span className="flex-1">{child.label}</span>
                    {child.badge && (
                      <Badge 
                        variant="warning" 
                        className={cn(
                          "text-[9px] px-1.5 py-0 border-0 rounded-full",
                          isChildActive 
                            ? "bg-orange-500/30 text-orange-800 dark:text-orange-700" 
                            : "bg-gray-200/80 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                        )}
                      >
                        {child.badge}
                      </Badge>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-2.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300",
          isActive
            ? "bg-gradient-to-r from-[#FFE6B0] to-[#FFD98A] text-gray-900 shadow-sm"
            : "bg-[#F5F5F5] dark:bg-[#2D2B2B] text-gray-700 dark:text-gray-300 hover:bg-[#DFDFDF] dark:hover:bg-[#3A3737]"
        )
      }
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
        location.pathname === to
          ? "bg-white/50 shadow-sm"
          : "bg-white/60 dark:bg-[#3A3737]"
      )}>
        <Icon className="w-[14px] h-[14px] flex-shrink-0" />
      </div>
      <span className="flex-1">{label}</span>
      {badge && (
        <Badge 
          variant="warning" 
          className="text-[9px] px-1.5 py-0 bg-orange-500/20 text-orange-700 dark:text-orange-400 border-0 rounded-full"
        >
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation: NavItemProps[] = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Overview",
      children: [
        { to: "/", label: "Dashboard" },
        { to: "/system-health", label: "System Health" },
      ],
    },
    {
      to: "/users",
      icon: Users2,
      label: "Users",
    },
    {
      to: "/transactions",
      icon: ArrowLeftRight,
      label: "Transactions & Ops",
      children: [
        { to: "/transactions", label: "All Transactions" },
        { to: "/transactions/gift-cards", label: "Gift Card Queue", badge: 23 },
      ],
    },
    {
      to: "/support-tickets",
      icon: Ticket,
      label: "Support Tickets",
      badge: 8,
    },
    {
      to: "/rate-controls",
      icon: Settings2,
      label: "Rate Controls",
      badge: 8,
    },
    {
      to: "/analytics",
      icon: TrendingUp,
      label: "Analytics & Reports",
      badge: 8,
    },
    {
      to: "/settings",
      icon: Settings,
      label: "System Settings",
      children: [
        { to: "/settings/notifications", label: "System Notifications" },
        { to: "/settings/features", label: "Feature Controls" },
      ],
    },
    {
      to: "/admin-profiles",
      icon: UserCog,
      label: "Admin Profiles",
    },
    // {
    //   to: "/help-center",
    //   icon: HelpCircle,
    //   label: "Help Center",
    // },
  ];
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-2xl">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-50 via-zinc-200 to-zinc-100 dark:from-zinc-600 dark:via-zinc-500 dark:to-zinc-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <img 
              src="/square.svg" 
              alt="JP" 
              className="w-5 h-5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-white font-bold text-xs">JP</span>
          </div>
          <div>
            <h1 className="text-[13px] font-semibold text-gray-900 dark:text-white">JhinxPay</h1>
            <p className="text-[9px] text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto border-t border-gray-200/30 dark:border-gray-700/30">
        {/* User Profile */}
        <div className="px-3 py-3 bg-gradient-to-br from-orange-50/30 via-orange-50/20 to-transparent dark:from-orange-500/5 dark:via-orange-500/3 dark:to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 relative overflow-hidden">
              <img 
                src="/admin-avatar.jpg" 
                alt="SA" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-white text-xs font-semibold">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                Super Admin
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
                admin@jhinxpay.com
              </p>
            </div>
            <Badge 
              variant="accent" 
              className="text-[9px] px-2 py-0.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 dark:from-orange-500/20 dark:to-orange-500/10 dark:text-orange-400 border-0 rounded-full font-semibold shadow-sm"
            >
              Super
            </Badge>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-2.5 py-2.5">
          <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-full text-[12px] font-medium bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-500/10 dark:to-red-500/5 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-50 dark:hover:from-red-500/20 dark:hover:to-red-500/10 transition-all duration-300 group shadow-sm">
            <div className="w-6 h-6 rounded-full bg-red-100/80 dark:bg-red-500/20 flex items-center justify-center group-hover:bg-red-200/80 dark:group-hover:bg-red-500/30 transition-all duration-300">
              <LogOut className="w-[13px] h-[13px]" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        
        .custom-scrollbar:hover {
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        .dark .custom-scrollbar:hover {
          scrollbar-color: rgba(75, 85, 99, 0.4) transparent;
        }
        
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.6);
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-2xl border-b border-gray-200/30 dark:border-gray-700/30 z-40 flex items-center justify-between px-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-white font-bold text-xs">JP</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-[13px]">JhinxPay</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-[10px]"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
              <Bell className="w-[16px] h-[16px]" />
            </div>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full ring-2 ring-white dark:ring-[#1C1C1C]" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-[10px]"
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#F5F5F5] dark:bg-[#2D2B2B] flex items-center justify-center">
              {isMobileOpen ? (
                <X className="w-[16px] h-[16px]" />
              ) : (
                <Menu className="w-[16px] h-[16px]" />
              )}
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-10 w-64 z-50 transform transition-transform duration-300 shadow-2xl rounded-2xl",
          isMobileOpen ? "translate-x-2" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-3 left-3 bottom-3 w-56 rounded-[16px] shadow-2xl shadow-gray-300/20 dark:shadow-black/40 border border-gray-200/50 dark:border-gray-700/30 flex-col z-30 overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  );
};