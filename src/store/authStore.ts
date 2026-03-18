import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin) => {
        localStorage.setItem("jhinx_token", token);
        set({ token, admin, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("jhinx_token");
        set({ token: null, admin: null, isAuthenticated: false });
      },
    }),
    { name: "jhinx_auth" }
  )
);