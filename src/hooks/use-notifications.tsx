import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Notification {
  id: string;
  type: "error" | "warning" | "success" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "error",
    title: "High fraud risk detected",
    message: "User @scammer99 submitted 5 invalid cards",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    link: "/users",
  },
  {
    id: "2",
    type: "warning",
    title: "Unusual activity",
    message: "User @whale_trader made 15 transactions in 1 hour",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    link: "/transactions",
  },
  {
    id: "3",
    type: "success",
    title: "KYC pending",
    message: "3 new KYC submissions awaiting review",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    link: "/users/kyc-pending",
  },
  {
    id: "4",
    type: "info",
    title: "System update",
    message: "Platform maintenance scheduled for tonight 2AM",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
  {
    id: "5",
    type: "warning",
    title: "API rate limit warning",
    message: "Flutterwave API approaching rate limit",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
