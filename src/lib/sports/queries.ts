import { queryOptions } from "@tanstack/react-query";
import { sampleProvider } from "./sample-provider";
import type { SportsProvider } from "./types";

// Swap this for the licensed provider (via a server function) when it is connected.
const provider: SportsProvider = sampleProvider;

export const fixturesQuery = (dateISO: string) =>
  queryOptions({
    queryKey: ["fixtures", dateISO],
    queryFn: () => provider.getFixtures(dateISO),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

export const matchQuery = (id: string) =>
  queryOptions({
    queryKey: ["match", id],
    queryFn: () => provider.getMatch(id),
    refetchInterval: 30_000,
  });

export const standingsQuery = (leagueId: string) =>
  queryOptions({
    queryKey: ["standings", leagueId],
    queryFn: () => provider.getStandings(leagueId),
    staleTime: 5 * 60_000,
  });

/** Local-date key (YYYY-MM-DD) offset by `days` from today. */
export function dateKey(days = 0, base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days, 12);
  return d.toISOString().slice(0, 10);
}
