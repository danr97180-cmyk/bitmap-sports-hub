import { LEAGUES } from "./catalog";
import type { EventType, Match, MatchDetail, MatchEvent, MatchStats, SportsProvider, StandingRow } from "./types";

/**
 * Deterministic SAMPLE football data used until a licensed provider is connected.
 * Same date + league always yields the same fixtures.
 */

function rng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (r: () => number, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;

/** Picks a random item from a non-empty list. */
function pick<T>(r: () => number, list: readonly T[]): T {
  const item = list[int(r, 0, list.length - 1)];
  if (item === undefined) throw new Error("pick() needs a non-empty list");
  return item;
}

const VENUES = ["Crescent Arena", "Harbor Park", "Northfield Ground", "Cedar Stadium", "Olive Bowl", "Riverside Park"];
const REFEREES = ["A. Mansour", "D. Peretz", "M. Ortega", "S. Clarke", "K. Rahman", "Y. Golan"];
const PLAYERS = ["Haddad", "Silva", "Cohen", "Mendes", "Amari", "Novak", "Rossi", "Farah", "Levi", "Ortiz", "Kane", "Diallo"];

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const KICKOFFS: [number, number][] = [
  [13, 30],
  [17, 0],
  [19, 45],
];

function buildFixtures(dateISO: string, now = new Date()): Match[] {
  const day = new Date(`${dateISO}T00:00:00`);
  const todayKey = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
  const isToday = dateISO === todayKey;
  const isPast = !isToday && dateISO < todayKey;
  const matches: Match[] = [];

  for (const league of LEAGUES) {
    const r = rng(`${dateISO}:${league.id}`);
    const ids = [...league.teamIds].sort(() => r() - 0.5);
    const round = (Math.floor(day.getTime() / 86400000) % 30) + 1;

    for (let i = 0; i < 3; i++) {
      const homeId = ids[i * 2];
      const awayId = ids[i * 2 + 1];
      if (!homeId || !awayId) break;
      const [hh, mm] = KICKOFFS[i] ?? [12, 0];
      const kickoff = new Date(day);
      kickoff.setHours(hh, mm, 0, 0);

      let status: Match["status"] = "scheduled";
      let minute: number | null = null;
      if (isPast) status = "ft";
      if (isToday) {
        // Keep the demo lively: one live match per league, one finished, one upcoming.
        if (i === 0) status = "ft";
        if (i === 1) {
          status = "live";
          minute = ((now.getMinutes() + league.id.length * 7) % 90) + 1;
          if (minute === 46) status = "ht";
          kickoff.setTime(now.getTime() - minute * 60000);
        }
      }

      const final: [number, number] = [int(r, 0, 4), int(r, 0, 3)];
      let score: [number, number] | null = null;
      if (status === "ft") score = final;
      if (status === "live" || status === "ht") {
        const f = (minute ?? 0) / 90;
        score = [Math.round(final[0] * f), Math.round(final[1] * f)];
      }

      matches.push({
        id: `${dateISO}_${league.id}_${i}`,
        leagueId: league.id,
        round,
        homeId,
        awayId,
        kickoff: kickoff.toISOString(),
        status,
        minute,
        score,
        venue: pick(r, VENUES),
        referee: pick(r, REFEREES),
      });
    }
  }
  return matches;
}

function buildEvents(m: Match): MatchEvent[] {
  if (!m.score) return [];
  const r = rng(`ev:${m.id}`);
  const upto = m.status === "ft" ? 90 : (m.minute ?? 0);
  const events: MatchEvent[] = [];
  const addGoals = (n: number, side: "home" | "away") => {
    for (let i = 0; i < n; i++) {
      const type: EventType = r() < 0.15 ? "penalty" : "goal";
      events.push({ minute: int(r, 3, Math.max(4, upto)), type, side, player: pick(r, PLAYERS) });
    }
  };
  addGoals(m.score[0], "home");
  addGoals(m.score[1], "away");
  const cards = int(r, 1, 4);
  for (let i = 0; i < cards; i++) {
    events.push({
      minute: int(r, 10, Math.max(11, upto)),
      type: r() < 0.12 ? "red" : "yellow",
      side: r() < 0.5 ? "home" : "away",
      player: pick(r, PLAYERS),
    });
  }
  if (upto > 60) {
    for (let i = 0; i < 2; i++) {
      events.push({
        minute: int(r, 60, upto),
        type: "sub",
        side: i === 0 ? "home" : "away",
        player: pick(r, PLAYERS),
        detail: pick(r, PLAYERS),
      });
    }
  }
  return events.sort((a, b) => a.minute - b.minute);
}

function buildStats(m: Match, events: MatchEvent[]): MatchStats | null {
  if (!m.score) return null;
  const r = rng(`st:${m.id}`);
  const pos = int(r, 35, 65);
  const yc = (side: "home" | "away") => events.filter((e) => e.side === side && e.type === "yellow").length;
  const shotsH = int(r, 4, 18);
  const shotsA = int(r, 3, 16);
  return {
    possession: [pos, 100 - pos],
    shots: [shotsH, shotsA],
    shotsOnTarget: [Math.max(m.score[0], int(r, 1, Math.ceil(shotsH / 2))), Math.max(m.score[1], int(r, 1, Math.ceil(shotsA / 2)))],
    corners: [int(r, 0, 10), int(r, 0, 9)],
    fouls: [int(r, 5, 16), int(r, 5, 16)],
    yellowCards: [yc("home"), yc("away")],
    offsides: [int(r, 0, 5), int(r, 0, 5)],
    passAccuracy: [int(r, 72, 92), int(r, 70, 90)],
  };
}

function buildStandings(leagueId: string): StandingRow[] {
  const league = LEAGUES.find((l) => l.id === leagueId);
  if (!league) return [];
  const r = rng(`table:${leagueId}`);
  const rows = league.teamIds.map((teamId) => {
    const played = 12;
    const won = int(r, 2, 9);
    const drawn = int(r, 0, played - won);
    const lost = played - won - drawn;
    const gf = won * 2 + drawn + int(r, 0, 6);
    const ga = lost * 2 + drawn + int(r, 0, 5);
    const form = Array.from({ length: 5 }, () => {
      const x = r();
      return x < 0.45 ? "W" : x < 0.7 ? "D" : "L";
    }) as StandingRow["form"];
    return { teamId, played, won, drawn, lost, gf, ga, points: won * 3 + drawn, form };
  });
  return rows.sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const sampleProvider: SportsProvider = {
  async getFixtures(dateISO) {
    await delay(350);
    return buildFixtures(dateISO);
  },
  async getMatch(id) {
    await delay(300);
    const dateISO = id.slice(0, 10);
    const match = buildFixtures(dateISO).find((m) => m.id === id);
    if (!match) return null;
    const events = buildEvents(match);
    return { ...match, events, stats: buildStats(match, events) };
  },
  async getStandings(leagueId) {
    await delay(300);
    return buildStandings(leagueId);
  },
};

export const __test = { buildFixtures, buildStandings };
