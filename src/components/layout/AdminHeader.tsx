import { ChevronDown, Search, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "./ThemeToggle";
import Breadcrumbs from "./Breadcrumbs";

export const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Custom Styles */}
      <style>{`
        .search-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
        }
        
        .dark .search-input:focus {
          box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.15);
        }
      `}</style>

      <header className="hidden m-5 rounded-full bg-white/5 dark:bg-[#1C1C1C]/5 backdrop-blur-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 lg:flex h-[72px] border border-gray-200/50 dark:border-gray-700/30 sticky top-4 z-20 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <Breadcrumbs />
        </div>

        {/* Search */}
        <div className="relative w-96 mx-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
          <Input
            placeholder="Search users, transactions, tickets..."
            className="search-input pl-11 pr-12 h-11 bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-full border-transparent hover:border-gray-200 dark:hover:border-gray-700/50 focus:border-orange-300 dark:focus:border-orange-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-all duration-300"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-500 dark:text-gray-500 bg-white/80 dark:bg-[#3A3737] px-2 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
            <ThemeToggle />
          

          {/* Notifications */}
            <NotificationsDropdown />

          {/* Settings */}
          <Link 
            to="/settings" 
          >
            <div className="w-8 h-8 rounded-full bg-white/60 dark:bg-[#3A3737] flex items-center justify-center group-hover:bg-white dark:group-hover:bg-[#3A3737] transition-all duration-300">
              <Settings className="w-[18px] h-[18px] text-gray-700 dark:text-gray-300" />
            </div>
          </Link>

          {/* Profile Dropdown */}
          <div className="ml-2 bg-gradient-to-r from-[#FFE6B0]/30 via-[#FFD98A]/20 to-transparent dark:from-[#E7E7E7]/5 dark:to-[#E7E7E7]/5 pl-4 pr-2 py-1.5 rounded-full backdrop-blur-sm border border-orange-200/30 dark:border-orange-500/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-3 bg-transparent shadow-none border-none hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full ring-2 ring-orange-200/50 dark:ring-orange-500/30 overflow-hidden">
                        <img 
                          src="https://ca.slack-edge.com/T08BN2VF2GL-U0A25LVCYL9-11f7983440b6-512" 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">SA</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1C1C1C]"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col items-start">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                        Sarah Admin
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
                        sarah@jhinxpay.com
                      </span>
                    </div>

                    {/* Chevron */}
                    <div className="ml-1 w-7 h-7 bg-white/80 dark:bg-[#2D2B2B] rounded-full flex items-center justify-center">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-64 p-2 mt-2 rounded-[18px] mt-8 bg-white/5 dark:bg-[#1C1C1C]/5 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/30 shadow-xl"
              >
                {/* Profile Header */}
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-orange-200/50 dark:ring-orange-500/30">
                      <img 
                        src="https://ca.slack-edge.com/T08BN2VF2GL-U0A25LVCYL9-11f7983440b6-512" 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">SA</span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                        Sarah Admin
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        sarah@jhinxpay.com
                      </span>
                      <span className="text-[10px] mt-1 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full font-semibold inline-block w-fit">
                        Super Admin
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30 my-2" />
                
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="rounded-[12px] px-3 py-2.5 text-[13px] cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200"
                >
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate("/preferences")}
                  className="rounded-[12px] px-3 py-2.5 text-[13px] cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200"
                >
                  <span className="font-medium">Preferences</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate("/support/help-center")}
                  className="rounded-[12px] px-3 py-2.5 text-[13px] cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#2D2B2B] transition-all duration-200"
                >
                  <span className="font-medium">Keyboard Shortcuts</span>
                  <kbd className="ml-auto text-[10px] font-semibold text-gray-500 dark:text-gray-500 bg-white/80 dark:bg-[#3A3737] px-2 py-1 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                    ⌘K
                  </kbd>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/30 my-2" />
                
                <DropdownMenuItem 
                  className="rounded-[12px] px-3 py-2.5 text-[13px] cursor-pointer bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-500/10 dark:to-red-500/5 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-50 dark:hover:from-red-500/20 dark:hover:to-red-500/10 font-medium transition-all duration-200"
                  onClick={() => navigate("/login")}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};