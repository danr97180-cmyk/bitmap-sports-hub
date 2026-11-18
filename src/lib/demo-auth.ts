import { createPersistedStore, uid, useStore } from "./persisted-store";
import type { Role } from "./permissions";
import { pointsStore } from "./points-store";
import { WELCOME_BONUS } from "./points";
import type { Lang } from "./i18n/dictionaries";

/**
 * DEMO-ONLY account system kept in the browser. It is replaced by Lovable Cloud
 * authentication in the next phase; it stores no passwords.
 */
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  country?: string;
  language?: Lang;
  agentId?: string | null;
  status: "active" | "suspended";
  createdAt: string;
}

export type ActivityType = "register" | "sign_in" | "sign_out" | "profile_update" | "role_change";

export interface ActivityEntry {
  id: string;
  userId: string;
  type: ActivityType;
  at: string;
  detail?: string;
}

const seedDate = "2026-09-01T10:00:00.000Z";

export const SEED_USERS: DemoUser[] = [
  { id: "u_admin", name: "Lina Haddad", email: "admin@bitmap.demo", role: "admin", status: "active", createdAt: seedDate, country: "JO" },
  { id: "u_agent", name: "Omar Nassar", email: "agent@bitmap.demo", role: "agent", status: "active", createdAt: seedDate, country: "AE" },
  { id: "u_user", name: "Noa Levi", email: "user@bitmap.demo", role: "user", agentId: "u_agent", status: "active", createdAt: seedDate, country: "IL" },
  { id: "u_sami", name: "Sami Khoury", email: "sami@bitmap.demo", role: "user", agentId: "u_agent", status: "active", createdAt: "2026-10-04T09:00:00.000Z", country: "LB" },
  { id: "u_maya", name: "Maya Cohen", email: "maya@bitmap.demo", role: "user", agentId: "u_agent", status: "active", createdAt: "2026-10-19T09:00:00.000Z", country: "IL" },
  { id: "u_yousef", name: "Yousef Amin", email: "yousef@bitmap.demo", role: "user", agentId: null, status: "suspended", createdAt: "2026-11-02T09:00:00.000Z", country: "EG" },
];

interface AuthState {
  users: DemoUser[];
  sessionUserId: string | null;
  activity: ActivityEntry[];
}

export const authStore = createPersistedStore<AuthState>("bitmap.auth.v1", {
  users: SEED_USERS,
  sessionUserId: null,
  activity: [],
});

function log(userId: string, type: ActivityType, detail?: string) {
  authStore.set((s) => ({
    ...s,
    activity: [{ id: uid("act"), userId, type, at: new Date().toISOString(), detail }, ...s.activity].slice(0, 300),
  }));
}

export function getSessionUser(): DemoUser | null {
  const s = authStore.get();
  return s.users.find((u) => u.id === s.sessionUserId) ?? null;
}

export function useSession() {
  const s = useStore(authStore);
  const user = s.users.find((u) => u.id === s.sessionUserId) ?? null;
  return { user, users: s.users, activity: s.activity };
}

export type AuthError = "not_found" | "suspended" | "email_taken";

export function signIn(email: string): { user?: DemoUser; error?: AuthError } {
  const user = authStore.get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { error: "not_found" };
  if (user.status === "suspended") return { error: "suspended" };
  authStore.set((s) => ({ ...s, sessionUserId: user.id }));
  log(user.id, "sign_in");
  return { user };
}

export function signUp(input: { name: string; email: string }): { user?: DemoUser; error?: AuthError } {
  const email = input.email.trim().toLowerCase();
  if (authStore.get().users.some((u) => u.email.toLowerCase() === email)) return { error: "email_taken" };
  const user: DemoUser = {
    id: uid("u"),
    name: input.name.trim(),
    email,
    role: "user",
    agentId: "u_agent",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  authStore.set((s) => ({ ...s, users: [...s.users, user], sessionUserId: user.id }));
  log(user.id, "register");
  pointsStore.set((p) => ({
    ...p,
    transactions: [
      { id: uid("tx"), userId: user.id, amount: WELCOME_BONUS, type: "welcome", at: new Date().toISOString() },
      ...p.transactions,
    ],
  }));
  return { user };
}

export function signOut() {
  const id = authStore.get().sessionUserId;
  if (id) log(id, "sign_out");
  authStore.set((s) => ({ ...s, sessionUserId: null }));
}

export function updateUser(id: string, patch: Partial<Omit<DemoUser, "id" | "email" | "createdAt">>, type: ActivityType = "profile_update") {
  authStore.set((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  log(id, type, patch.role ? patch.role : undefined);
}
