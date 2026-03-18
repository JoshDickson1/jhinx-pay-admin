import api from "./axiosInstance";

export const getMe = () =>
  api.get("/admin/me").then((r) => r.data);

export const updateProfile = (payload: {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}) => api.patch("/admin/profile", payload).then((r) => r.data);

export const uploadProfilePicture = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/admin/profile/picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const deleteProfilePicture = () =>
  api.delete("/admin/profile/picture").then((r) => r.data);

export const changePassword = (payload: {
  current_password: string;
  new_password: string;
}) => api.post("/admin/security/change-password", payload).then((r) => r.data);

export const getSessions = () =>
  api.get("/admin/security/sessions").then((r) => r.data);

export const logoutAllSessions = () =>
  api.post("/admin/security/sessions/logout-all").then((r) => r.data);

export const logoutSession = (sessionId: string) =>
  api.post(`/admin/security/sessions/${sessionId}/logout`).then((r) => r.data);