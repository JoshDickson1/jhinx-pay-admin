import api from "./axiosInstance";

// Admin users
export const listAdminUsers = (params?: object) =>
  api.get("/admin/users", { params });

export const createAdminUser = (payload: object) =>
  api.post("/admin/users", payload);

export const updateAdminRole = (adminId: string, role: string) =>
  api.patch(`/admin/users/${adminId}/role`, { role });

export const updateAdminStatus = (adminId: string, status: string) =>
  api.patch(`/admin/users/${adminId}/status`, { status });

// App users
export const getUserStats = () =>
  api.get("/admin/users/stats");

export const flagUser = (userId: string) =>
  api.post(`/admin/users/${userId}/flag`);

export const unflagUser = (userId: string) =>
  api.post(`/admin/users/${userId}/unflag`);

export const updateUserStatus = (userId: string, status: string) =>
  api.post(`/admin/users/${userId}/status`, { status });

// Roles
export const getRoles = () =>
  api.get("/admin/roles");

export const getMyPermissions = () =>
  api.get("/admin/me/permissions");

// Notifications
export const getNotifications = () =>
  api.get("/admin/notifications");

export const markNotificationRead = (id: string) =>
  api.post(`/admin/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.post("/admin/notifications/read-all");

// Sessions
export const getSessions = () =>
  api.get("/admin/security/sessions");

export const logoutAllSessions = () =>
  api.post("/admin/security/sessions/logout-all");

export const logoutSession = (sessionId: string) =>
  api.post(`/admin/security/sessions/${sessionId}/logout`);

export const changePassword = (payload: { current_password: string; new_password: string }) =>
  api.post("/admin/security/change-password", payload);