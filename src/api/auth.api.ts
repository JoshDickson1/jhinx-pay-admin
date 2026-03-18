import api from "./axiosInstance";

export const loginRequest = (payload: { email: string; password: string }) =>
  api.post("/admin/login", payload).then((r) => r.data);

export const logoutRequest = () =>
  api.post("/admin/logout");

export const getMe = () =>
  api.get("/admin/me").then((r) => r.data);