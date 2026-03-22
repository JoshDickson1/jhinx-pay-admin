import { useAuthStore } from "@/store/authStore";

// ─── Role hierarchy ───────────────────────────────────────────────────────────
const ROLES = ["staff", "admin", "superadmin"] as const;
type Role = typeof ROLES[number];

const roleLevel = (role: string): number => {
  const idx = ROLES.indexOf(role as Role);
  return idx === -1 ? 0 : idx;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const usePermissions = () => {
  const { admin } = useAuthStore();
  const role = admin?.role ?? "staff";
  const level = roleLevel(role);

  return {
    // ── Role checks ──────────────────────────────────────────────────────────
    role,
    isSuperAdmin: role === "superadmin",
    isAdmin: role === "admin" || role === "superadmin",
    isStaff: role === "staff",

    // ── Page access ──────────────────────────────────────────────────────────
    canAccessAdminProfiles: role === "superadmin",
    canAccessSettings: role === "superadmin" || role === "admin",
    canAccessReports: role === "superadmin" || role === "admin",
    canAccessAuditLog: role === "superadmin" || role === "admin",
    canAccessRateControls: role === "superadmin",
    canAccessAnalytics: role === "superadmin" || role === "admin",

    // ── Action permissions ────────────────────────────────────────────────────
    canManageAdmins: role === "superadmin",
    canSuspendAdmins: role === "superadmin",
    canDeleteAdmins: role === "superadmin",
    canChangeAdminRoles: role === "superadmin",
    canConfigurePermissions: role === "superadmin",

    canManageUsers: role === "superadmin" || role === "admin",
    canFlagUsers: role === "superadmin" || role === "admin",
    canBanUsers: role === "superadmin" || role === "admin",
    canFreezeUsers: role === "superadmin" || role === "admin",

    canManageTransactions: role === "superadmin" || role === "admin",
    canRefundTransactions: role === "superadmin" || role === "admin",
    canFlagTransactions: role === "superadmin" || role === "admin",

    canApproveGiftCards: role === "superadmin" || role === "admin" || role === "staff",
    canRejectGiftCards: role === "superadmin" || role === "admin" || role === "staff",

    canManageSupport: true, // all roles
    canReplySupport: true,  // all roles

    canManageFeatures: role === "superadmin",
    canSendNotifications: role === "superadmin" || role === "admin",

    // ── Utility ───────────────────────────────────────────────────────────────
    hasMinRole: (minRole: Role) => level >= roleLevel(minRole),
    canEditAdmin: (targetRole: string) => {
      // superadmin can edit anyone except other superadmins via the list
      // superadmin accounts are managed via their own profile page only
      if (role !== "superadmin") return false;
      return targetRole !== "superadmin";
    },
  };
};