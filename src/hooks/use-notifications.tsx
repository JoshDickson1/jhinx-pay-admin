import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
  read: boolean;
  timestamp: Date;
  link?: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
  isLoading: false,
});

// Normalize backend notification type to our four types
const normalizeType = (type?: string): Notification["type"] => {
  const t = (type ?? "").toLowerCase();
  if (t.includes("error") || t.includes("fail") || t.includes("critical")) return "error";
  if (t.includes("warn") || t.includes("alert")) return "warning";
  if (t.includes("success") || t.includes("approved") || t.includes("completed")) return "success";
  return "info";
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => api.get("/admin/notifications").then((r) => r.data),
    refetchInterval: 60000, // refresh every 60s
  });

  const rawItems: any[] =
    data?.notifications ?? data?.items ?? data?.data ??
    (Array.isArray(data) ? data : []);

  const notifications: Notification[] = rawItems.map((item: any) => ({
    id: item.id ?? String(Math.random()),
    title: item.title ?? item.subject ?? "Notification",
    message: item.message ?? item.body ?? item.description ?? "",
    type: normalizeType(item.type ?? item.notification_type),
    read: item.is_read ?? item.read ?? false,
    timestamp: new Date(item.created_at ?? item.timestamp ?? Date.now()),
    link: item.link ?? item.action_url ?? undefined,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/admin/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post("/admin/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  // Remove is local-only since there's no delete endpoint in the API
  const removeNotification = (id: string) => {
    qc.setQueryData(["admin", "notifications"], (old: any) => {
      const items = old?.notifications ?? old?.items ?? old?.data ?? (Array.isArray(old) ? old : []);
      const filtered = items.filter((item: any) => item.id !== id);
      if (Array.isArray(old)) return filtered;
      if (old?.notifications) return { ...old, notifications: filtered };
      if (old?.items) return { ...old, items: filtered };
      if (old?.data) return { ...old, data: filtered };
      return filtered;
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead: (id) => markAsReadMutation.mutate(id),
        markAllAsRead: () => markAllAsReadMutation.mutate(),
        removeNotification,
        isLoading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);