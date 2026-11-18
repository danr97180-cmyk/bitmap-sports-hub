import { createPersistedStore, uid, useStore } from "./persisted-store";
import { DAILY_BONUS, getBalance, type PointsTx, type TxType } from "./points";

const d = (iso: string) => new Date(iso).toISOString();

const SEED_TX: PointsTx[] = [
  { id: "tx_s1", userId: "u_user", amount: 1000, type: "welcome", at: d("2026-09-01T10:00:00Z") },
  { id: "tx_s2", userId: "u_user", amount: 100, type: "daily_bonus", at: d("2026-11-15T08:00:00Z") },
  { id: "tx_s3", userId: "u_user", amount: 35, type: "game_reward", note: "Penalty Pixel", at: d("2026-11-16T19:20:00Z") },
  { id: "tx_s4", userId: "u_user", amount: 500, type: "agent_grant", byUserId: "u_agent", note: "Weekly challenge", at: d("2026-11-17T12:00:00Z") },
  { id: "tx_s5", userId: "u_sami", amount: 1000, type: "welcome", at: d("2026-10-04T09:00:00Z") },
  { id: "tx_s6", userId: "u_maya", amount: 1000, type: "welcome", at: d("2026-10-19T09:00:00Z") },
  { id: "tx_s7", userId: "u_agent", amount: 1000, type: "welcome", at: d("2026-09-01T10:00:00Z") },
  { id: "tx_s8", userId: "u_admin", amount: 1000, type: "welcome", at: d("2026-09-01T10:00:00Z") },
  { id: "tx_s9", userId: "u_yousef", amount: 1000, type: "welcome", at: d("2026-11-02T09:00:00Z") },
];

interface PointsState {
  transactions: PointsTx[];
}

export const pointsStore = createPersistedStore<PointsState>("bitmap.points.v1", { transactions: SEED_TX });

export function usePoints(userId: string | null | undefined) {
  const { transactions } = useStore(pointsStore);
  const mine = userId ? transactions.filter((t) => t.userId === userId) : [];
  return { transactions, mine, balance: userId ? getBalance(transactions, userId) : 0 };
}

export function addTransaction(tx: { userId: string; amount: number; type: TxType; note?: string; byUserId?: string }) {
  const full: PointsTx = { ...tx, id: uid("tx"), at: new Date().toISOString() };
  pointsStore.set((s) => ({ ...s, transactions: [full, ...s.transactions] }));
  return full;
}

export function claimDailyBonus(userId: string) {
  return addTransaction({ userId, amount: DAILY_BONUS, type: "daily_bonus" });
}
