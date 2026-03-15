import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-gray-100">
      <div className="">
        <AdminSidebar />
      </div>
      <div className="lg:ml-64">
        <AdminHeader />
        <main className="p-6 lg:p-7 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};