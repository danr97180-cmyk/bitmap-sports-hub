import type { Role } from "./permissions";

/** Virtual demo points only — no cash value, no purchase, no withdrawal. */
export const WELCOME_BONUS = 1000;
export const DAILY_BONUS = 100;
export const AGENT_MAX_GRANT = 5000;
export const GAME_REWARD_MIN = 10;
export const GAME_REWARD_MAX = 50;

export type TxType = "welcome" | "daily_bonus" | "game_reward" | "agent_grant" | "admin_adjustment";

export interface PointsTx {
  id: string;
  userId: string;
  amount: number;
  type: TxType;
  note?: string;
  byUserId?: string;
  at: string; // ISO
}

export function getBalance(txs: PointsTx[], userId: string): number {
  return txs.reduce((sum, tx) => (tx.userId === userId ? sum + tx.amount : sum), 0);
}

export function hasClaimedDailyBonus(txs: PointsTx[], userId: string, now: Date): boolean {
  const day = now.toISOString().slice(0, 10);
  return txs.some(
    (tx) => tx.userId === userId && tx.type === "daily_bonus" && tx.at.slice(0, 10) === day,
  );
}

export type GrantError =
  | "not_allowed"
  | "not_own_user"
  | "invalid_amount"
  | "over_limit"
  | "negative_balance";

export interface GrantInput {
  actor: { id: string; role: Role };
  target: { id: string; agentId?: string | null };
  amount: number;
  currentBalance: number;
}

/** Returns null when the grant is allowed, otherwise the reason it is refused. */
export function validateGrant({ actor, target, amount, currentBalance }: GrantInput): GrantError | null {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount === 0) return "invalid_amount";
  if (actor.role === "user") return "not_allowed";
  if (actor.role === "agent") {
    if (target.agentId !== actor.id) return "not_own_user";
    if (amount < 0) return "invalid_amount";
    if (amount > AGENT_MAX_GRANT) return "over_limit";
    return null;
  }
  // admin: may add or remove, but never below zero
  if (currentBalance + amount < 0) return "negative_balance";
  return null;
}
