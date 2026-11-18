import { Home, Radio, Table2, Gamepad2, Coins, User, LayoutDashboard, Briefcase, ShieldCheck, type LucideIcon } from "lucide-react";
import type { DictKey } from "@/lib/i18n";
import type { Permission } from "@/lib/permissions";

export interface NavItem {
  to: "/" | "/scores" | "/standings" | "/games" | "/wallet" | "/profile" | "/dashboard" | "/agent" | "/admin";
  label: DictKey;
  icon: LucideIcon;
  permission?: Permission;
  exact?: boolean;
}

export const MAIN_TABS: NavItem[] = [
  { to: "/", label: "nav.home", icon: Home, exact: true },
  { to: "/scores", label: "nav.scores", icon: Radio },
  { to: "/standings", label: "nav.standings", icon: Table2 },
  { to: "/games", label: "nav.games", icon: Gamepad2 },
  { to: "/wallet", label: "nav.wallet", icon: Coins },
];

export const ACCOUNT_NAV: NavItem[] = [
  { to: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard, permission: "view_user_dashboard" },
  { to: "/wallet", label: "nav.wallet", icon: Coins, permission: "view_user_dashboard" },
  { to: "/profile", label: "nav.profile", icon: User, permission: "view_user_dashboard" },
];

export const MANAGEMENT_NAV: NavItem[] = [
  { to: "/agent", label: "nav.agent", icon: Briefcase, permission: "view_agent_dashboard" },
  { to: "/admin", label: "nav.admin", icon: ShieldCheck, permission: "view_admin_dashboard" },
];
