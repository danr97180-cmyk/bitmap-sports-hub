export type Role = "admin" | "agent" | "user";

export const ROLES: Role[] = ["admin", "agent", "user"];

export type Permission =
  | "view_user_dashboard"
  | "view_agent_dashboard"
  | "view_admin_dashboard"
  | "claim_daily_bonus"
  | "grant_points"
  | "adjust_points"
  | "manage_users"
  | "change_roles"
  | "manage_settings"
  | "manage_translations";

const MATRIX: Record<Role, Permission[]> = {
  user: ["view_user_dashboard", "claim_daily_bonus"],
  agent: ["view_user_dashboard", "claim_daily_bonus", "view_agent_dashboard", "grant_points"],
  admin: [
    "view_user_dashboard",
    "claim_daily_bonus",
    "view_agent_dashboard",
    "view_admin_dashboard",
    "grant_points",
    "adjust_points",
    "manage_users",
    "change_roles",
    "manage_settings",
    "manage_translations",
  ],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role].includes(permission);
}

/** Home dashboard for each role after sign-in. */
export function homeForRole(role: Role): "/admin" | "/agent" | "/dashboard" {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/agent";
  return "/dashboard";
}
