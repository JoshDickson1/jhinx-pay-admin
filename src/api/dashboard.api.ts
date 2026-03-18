import api from "./axiosInstance";

export const getDashboardMetrics = () =>
  api.get("/admin/overview").then((r) => r.data);

export const getActivityFeed = () =>
  api.get("/admin/activity-feed").then((r) => r.data);

export const getRevenueBreakdown = () =>
  api.get("/admin/revenue-breakdown").then((r) => r.data);

export const getSystemHealth = () =>
  api.get("/admin/system-health").then((r) => r.data);

export const getAdminLogs = () =>
  api.get("/admin/admin-logs").then((r) => r.data);