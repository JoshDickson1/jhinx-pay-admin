import { ChevronDown, Search, Settings, Slash, SlashIcon, User } from "lucide-react";
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
    <header className="hidden m-5 rounded-full bg-white/50 dark:bg-zinc-900/70 backdrop-blur-sm shadow-md lg:flex h-20 border border-border backdrop-blur-sm sticky top-4 z-20 items-center justify-between px-6">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
        <Input
          placeholder="Search users, transactions, tickets..."
          className="pl-10 bg-surface-1 rounded-full border-border focus:border-gray-100 dark:focus:border-gray-700 dark:bg-zinc-800 dark:border-zinc-700"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          /
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsDropdown />

        <Link to="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors">
          <Settings className="w-5 h-5 text-black dark:text-white" />
        </Link>

        {/* Profile */}
        <div className="bg-[#FFF7E6] dark:bg-zinc-800 p-1 rounded-full">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-transparent shadow-none border-none hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="w-8 h-8 rounded-full bg-primary/15 -m-3 mr-3 flex items-center justify-center">
                <img src="https://ca.slack-edge.com/T08BN2VF2GL-U0A25LVCYL9-11f7983440b6-512" alt="Avatar" className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex flex-col items-start -m-3 mr-3">
                <span className="hidden md:inline text-md font-bold text-black dark:text-white">Sarah Admin</span>
                <span className="hidden md:inline text-xs font-semibold text-muted-foreground">sarah@jhinxpay.com</span>
              </div>
              <div className="ml-1 bg-gray-50 dark:bg-zinc-700 p-1 rounded-full">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 px-3 mt-8 rounded-2xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-border">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Sarah Admin</span>
                <span className="text-xs text-muted-foreground font-normal">
                  sarahadmin@jhinxpay.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/preferences")}>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/support/help-center")}>
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => navigate("/login")}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
