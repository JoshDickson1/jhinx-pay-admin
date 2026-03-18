import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  changePassword,
  getSessions,
  logoutAllSessions,
  logoutSession,
} from "@/api/profile.api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useMe = () => {
  const { setAuth, token } = useAuthStore();

  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const data = await getMe();
      // Sync into store here — inside queryFn, not select
      // queryFn runs outside render so we use getState instead of hook
      if (data && token) {
        useAuthStore.getState().setAuth(token, {
  id: data.id ?? "",
  email: data.email ?? "",
  full_name: data.first_name && data.last_name        // ← this line
    ? `${data.first_name} ${data.last_name}`
    : data.first_name ?? data.last_name ?? data.full_name ?? "",
  first_name: data.first_name ?? null,
  last_name: data.last_name ?? null,
  phone: data.phone ?? null,
  avatar_url: data.avatar_url ?? null,
  role: data.role ?? "",
  is_active: data.is_active ?? true,
  last_login_at: data.last_login_at ?? null,
  created_at: data.created_at ?? "",
  updated_at: data.updated_at ?? "",
});
      }
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ["admin", "me"] });
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });
};

export const useUploadProfilePicture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: async () => {
      // Force a fresh fetch — don't just invalidate
      await qc.refetchQueries({ queryKey: ["admin", "me"] });
      toast.success("Profile picture updated");
    },
    onError: () => toast.error("Failed to upload picture"),
  });
};

export const useDeleteProfilePicture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProfilePicture,
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ["admin", "me"] });
      toast.success("Profile picture removed");
    },
    onError: () => toast.error("Failed to remove picture"),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      // FastAPI returns detail as array of validation errors or a plain string
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg ?? String(d)).join(", ")
        : typeof detail === "string"
        ? detail
        : "Check your current password and try again.";
      toast.error("Failed to change password", { description: msg });
    },
  });

export const useSessions = () =>
  useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: getSessions,
  });

export const useLogoutAllSessions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "sessions"] });
      toast.success("Logged out of all devices");
    },
  });
};

export const useLogoutSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "sessions"] });
      toast.success("Session terminated");
    },
  });
};