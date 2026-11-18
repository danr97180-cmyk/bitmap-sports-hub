import type { LocalizedText } from "../i18n/dictionaries";

export interface Team {
  id: string;
  name: LocalizedText;
  short: string;
  color: string; // oklch hue for the generated badge
}

export interface League {
  id: string;
  name: LocalizedText;
  country: LocalizedText;
  flag: string; // emoji flag
  teamIds: string[];
}

export type MatchStatus = "live" | "ht" | "ft" | "scheduled";

export type EventType = "goal" | "penalty" | "yellow" | "red" | "sub";

export interface MatchEvent {
  minute: number;
  type: EventType;
  side: "home" | "away";
  player: string;
  detail?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  offsides: [number, number];
  passAccuracy: [number, number];
}

export interface Match {
  id: string;
  leagueId: string;
  round: number;
  homeId: string;
  awayId: string;
  kickoff: string; // ISO
  status: MatchStatus;
  minute: number | null;
  score: [number, number] | null;
  venue: string;
  referee: string;
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  stats: MatchStats | null;
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

/** Contract every football data source implements (sample data now, licensed API later). */
export interface SportsProvider {
  getFixtures(dateISO: string): Promise<Match[]>;
  getMatch(id: string): Promise<MatchDetail | null>;
  getStandings(leagueId: string): Promise<StandingRow[]>;
}
