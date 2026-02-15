import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ThemeProvider } from "@/hooks/use-theme";
import { NotificationsProvider } from "@/hooks/use-notifications";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Users from "@/pages/Users";
import UserDetail from "@/pages/UserDetail";
import Transactions from "@/pages/Transactions";
import GiftCardApprovals from "@/pages/GiftCardApprovals";
import GiftCardReview from "@/pages/GiftCardReview";
import Settings from "@/pages/Settings";
import TransactionLimits from "@/pages/settings/TransactionLimits";
import SupportedGames from "@/pages/settings/SupportedGames";
import SystemNotifications from "@/pages/settings/SystemNotifications";
import FeatureControls from "@/pages/settings/FeatureControls";
import AuditLog from "@/pages/AuditLog";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Support from "@/pages/Support";
import HelpCenter from "@/pages/HelpCenter";
import Reports from "@/pages/Reports";
import AdminProfiles from "@/pages/AdminProfiles";
import MyProfile from "@/pages/MyProfile";
import Preferences from "@/pages/Preferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <NotificationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/users/kyc-pending" element={<Users />} />
                      <Route path="/users/:id" element={<UserDetail />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/transactions/gift-cards" element={<GiftCardApprovals />} />
                      <Route path="/transactions/gift-cards/:id" element={<GiftCardReview />} />
                      <Route path="/transactions/crypto" element={<Transactions />} />
                      <Route path="/transactions/games" element={<Transactions />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/support/help-center" element={<HelpCenter />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/rates" element={<Settings />} />
                      <Route path="/settings/limits" element={<TransactionLimits />} />
                      <Route path="/settings/games" element={<SupportedGames />} />
                      <Route path="/settings/notifications" element={<SystemNotifications />} />
                      <Route path="/settings/features" element={<FeatureControls />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/reports/export" element={<Reports />} />
                      <Route path="/audit-log" element={<AuditLog />} />
                      <Route path="/admin-profiles" element={<AdminProfiles />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route path="/preferences" element={<Preferences />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AdminLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
