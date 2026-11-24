import type { Match, MatchDetail, SportsProvider, StandingRow } from "./types";

/**
 * BITMAP's provider-neutral contract. Requests are sent to BITMAP's own server,
 * never directly to a paid upstream API. Keep upstream credentials server-side.
 * The server must authenticate, validate and normalize upstream responses.
 */
export function createHttpSportsProvider(basePath = "/api/sports", fetcher: typeof fetch = fetch): SportsProvider {
  const base = basePath.replace(/\/$/, "");

  async function request<T>(path: string, validate: (value: unknown) => value is T): Promise<T> {
    // An untrusted provider response must never reach the live scoreboard unchecked.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetcher(`${base}${path}`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Sports data unavailable (HTTP ${response.status})`);
      }
      // Keep the abort deadline active while reading the response body, too.
      const payload: unknown = await response.json();
      if (!validate(payload)) {
        throw new Error("Invalid sports data response");
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function isScore(value: unknown): value is [number, number] {
    return Array.isArray(value) && value.length === 2 &&
      value.every((n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= 0);
  }
  function isMatch(value: unknown): value is Match {
    if (!isRecord(value)) return false;
    return ["id", "leagueId", "homeId", "awayId", "kickoff"].every((key) => typeof value[key] === "string") &&
      ["live", "ht", "ft", "scheduled"].includes(String(value.status)) &&
      (value.score === null || isScore(value.score)) &&
      (value.minute === null || (Number.isInteger(value.minute) && Number(value.minute) >= 0)) &&
      Number.isInteger(value.round) && Number(value.round) >= 0 &&
      !Number.isNaN(Date.parse(String(value.kickoff))) &&
      typeof value.venue === "string" && typeof value.referee === "string" &&
      (value.status !== "live" || (value.score !== null && value.minute !== null)) &&
      (value.status !== "ft" || value.score !== null);
  }
  function isMatchDetail(value: unknown): value is MatchDetail | null {
    if (value === null) return true;
    if (!isMatch(value) || !isRecord(value)) return false;
    const stats = value.stats;
    return Array.isArray(value.events) && value.events.every((event: unknown) =>
      isRecord(event) && Number.isInteger(event.minute) && Number(event.minute) >= 0 &&
      ["goal", "penalty", "yellow", "red", "sub"].includes(String(event.type)) &&
      ["home", "away"].includes(String(event.side)) && typeof event.player === "string" && (event.detail === undefined || typeof event.detail === "string")
    ) && (stats === null || (isRecord(stats) &&
      ["possession", "shots", "shotsOnTarget", "corners", "fouls", "yellowCards", "offsides", "passAccuracy"].every(
        (key) => Array.isArray(stats[key]) && (stats[key] as unknown[]).length === 2 &&
          (stats[key] as unknown[]).every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
      )));
  }
  function isStanding(value: unknown): value is StandingRow {
    return isRecord(value) && typeof value.teamId === "string" &&
      ["played", "won", "drawn", "lost", "gf", "ga", "points"].every(
        (key) => Number.isInteger(value[key]) && Number(value[key]) >= 0
      ) && Number(value.won) + Number(value.drawn) + Number(value.lost) === Number(value.played) &&
      Number(value.gf) >= 0 && Number(value.ga) >= 0 &&
      Array.isArray(value.form) && value.form.every(
        (result: unknown) => ["W", "D", "L"].includes(String(result))
      );
  }
  function isArrayOf<T>(value: unknown, check: (item: unknown) => item is T): value is T[] {
    return Array.isArray(value) && value.every((item: unknown) => check(item));
  }

  function isValidCalendarDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  return {
    getFixtures(dateISO: string): Promise<Match[]> {
      if (!isValidCalendarDate(dateISO)) throw new Error("Invalid fixture date");
      return request<Match[]>(`/fixtures?date=${encodeURIComponent(dateISO)}`, (value): value is Match[] => isArrayOf(value, isMatch));
    },
    getMatch(id: string): Promise<MatchDetail | null> {
      if (!id.trim()) throw new Error("Missing match ID");
      return request<MatchDetail | null>(`/matches/${encodeURIComponent(id)}`, isMatchDetail);
    },
    getStandings(leagueId: string): Promise<StandingRow[]> {
      if (!leagueId.trim()) throw new Error("Missing league ID");
      return request<StandingRow[]>(`/standings/${encodeURIComponent(leagueId)}`, (value): value is StandingRow[] => isArrayOf(value, isStanding));
    },
  };
}
