import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamBadge } from "@/components/common/TeamBadge";
import { LiveDot } from "@/components/common/SectionHeader";
import { useI18n } from "@/lib/i18n";
import { getTeam } from "@/lib/sports/catalog";
import type { Match } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

export function MatchStatus({ match }: { match: Match }) {
  const { t, fmtTime } = useI18n();
  if (match.status === "live")
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-live">
        <LiveDot /> {match.minute}'
      </span>
    );
  if (match.status === "ht") return <span className="text-xs font-bold text-gold">HT</span>;
  if (match.status === "ft") return <span className="text-xs font-semibold text-muted-foreground">{t("common.ft")}</span>;
  return <span className="text-xs font-semibold text-foreground/80">{fmtTime(match.kickoff)}</span>;
}

export function MatchRow({ match }: { match: Match }) {
  const { loc, dir } = useI18n();
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  const live = match.status === "live" || match.status === "ht";
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: match.id }}
      className={cn(
        "grid grid-cols-[3.25rem_minmax(0,1fr)_auto_1rem] items-center gap-3 border-b border-border px-3 py-3 transition-colors last:border-b-0 hover:bg-surface-2",
        live && "bg-live/5",
      )}
    >
      <div className="flex justify-center">
        <MatchStatus match={match} />
      </div>
      <div className="min-w-0 space-y-1.5">
        {[home, away].map((team, i) => (
          <div key={i} className="flex min-w-0 items-center gap-2">
            <TeamBadge teamId={team.id} size="sm" />
            <span className="truncate text-sm font-medium">{loc(team.name)}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-1.5 text-center">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn(
              "grid h-6 min-w-7 place-items-center rounded-md bg-surface-2 px-1.5 text-sm font-bold tabular-nums",
              live && "bg-live/15 text-live",
              match.status === "scheduled" && "text-muted-foreground",
            )}
          >
            {match.score ? match.score[i] : "–"}
          </span>
        ))}
      </div>
      <Chevron className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

/** Compact card for horizontal "Live now" rails. */
export function LiveMatchCard({ match }: { match: Match }) {
  const { loc } = useI18n();
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: match.id }}
      className="flex w-64 shrink-0 flex-col gap-3 rounded-xl border border-live/30 bg-surface-gradient p-3 transition-all hover:border-live/60"
    >
      <div className="flex items-center justify-between">
        <MatchStatus match={match} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">#{match.round}</span>
      </div>
      {[home, away].map((team, i) => (
        <div key={team.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <TeamBadge teamId={team.id} />
          <span className="truncate text-sm font-semibold">{loc(team.name)}</span>
          <span className="text-lg font-extrabold tabular-nums">{match.score?.[i] ?? 0}</span>
        </div>
      ))}
    </Link>
  );
}
