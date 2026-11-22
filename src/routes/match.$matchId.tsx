import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { TeamBadge } from "@/components/common/TeamBadge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/States";
import { MatchStatus } from "@/components/sports/MatchRow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getLeague, getTeam } from "@/lib/sports/catalog";
import { matchQuery } from "@/lib/sports/queries";
import type { EventType, MatchDetail, MatchStats } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/match/$matchId")({
  loader: async ({ context, params }) => {
    const match = await context.queryClient.ensureQueryData(matchQuery(params.matchId));
    if (!match) throw notFound();
    const home = getTeam(match.homeId).name.en;
    const away = getTeam(match.awayId).name.en;
    return { title: `${home} vs ${away}` };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — BITMAP` : "Match — BITMAP";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData ? `${loaderData.title}: live score, events, statistics and match info.` : "Live match centre." },
        { property: "og:title", content: title },
        { property: "og:description", content: "Live score, events and statistics on BITMAP." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  pendingComponent: () => <ListSkeleton rows={4} />,
  errorComponent: ({ reset }) => <ErrorState onRetry={reset} />,
  notFoundComponent: MatchNotFound,
  component: MatchPage,
});

function MatchNotFound() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <EmptyState message={t("scores.matchNotFound")} />
      <Button asChild variant="surface">
        <Link to="/scores">{t("common.back")}</Link>
      </Button>
    </div>
  );
}

const EVENT_ICON: Record<EventType, string> = { goal: "⚽", penalty: "⚽", yellow: "🟨", red: "🟥", sub: "🔁" };
const STAT_KEYS: (keyof MatchStats)[] = ["possession", "shots", "shotsOnTarget", "corners", "fouls", "yellowCards", "offsides", "passAccuracy"];

function MatchPage() {
  const { matchId } = Route.useParams();
  const q = useSuspenseQuery(matchQuery(matchId));
  const { t, loc, dir } = useI18n();
  const m = q.data;
  if (!m) return <MatchNotFound />;
  const league = getLeague(m.leagueId);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/scores">
            <Back /> {t("common.back")}
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => q.refetch()} aria-label={t("common.retry")}>
          <RefreshCw className={cn(q.isFetching && "animate-spin")} />
        </Button>
      </div>

      <section className="bg-surface-gradient rounded-2xl border border-border p-4 shadow-card sm:p-6">
        <p className="mb-4 text-center text-xs text-muted-foreground">
          {league && (
            <>
              <span aria-hidden="true">{league.flag}</span> {loc(league.name)} ·{" "}
            </>
          )}
          {t("scores.round")} {m.round}
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <TeamSide teamId={m.homeId} />
          <div className="flex flex-col items-center gap-1.5">
            <span dir="ltr" className="text-4xl font-extrabold tabular-nums sm:text-5xl">
              {m.score ? `${m.score[0]} - ${m.score[1]}` : "– : –"}
            </span>
            <MatchStatus match={m} />
          </div>
          <TeamSide teamId={m.awayId} />
        </div>
      </section>

      <Tabs defaultValue="events" dir={dir}>
        <TabsList className="grid w-full grid-cols-3 bg-surface">
          <TabsTrigger value="events">{t("scores.events")}</TabsTrigger>
          <TabsTrigger value="stats">{t("scores.stats")}</TabsTrigger>
          <TabsTrigger value="info">{t("scores.info")}</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <Events match={m} />
        </TabsContent>
        <TabsContent value="stats">
          {m.stats ? <Stats stats={m.stats} /> : <EmptyState message={t("scores.noEvents")} />}
        </TabsContent>
        <TabsContent value="info">
          <Info match={m} />
        </TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">{t("scores.sampleNote")}</p>
    </div>
  );
}

function TeamSide({ teamId }: { teamId: string }) {
  const { loc } = useI18n();
  const team = getTeam(teamId);
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamBadge teamId={teamId} size="lg" />
      <span className="line-clamp-2 text-sm font-bold sm:text-base">{loc(team.name)}</span>
    </div>
  );
}

function Events({ match }: { match: MatchDetail }) {
  const { t } = useI18n();
  if (!match.events.length) return <EmptyState message={t("scores.noEvents")} />;
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {match.events.map((e, i) => (
        <li key={i} className={cn("flex items-center gap-3 px-3 py-2.5 text-sm", e.side === "away" && "flex-row-reverse text-end")}>
          <span className="w-9 shrink-0 text-center text-xs font-bold tabular-nums text-gold">{e.minute}'</span>
          <span aria-hidden="true">{EVENT_ICON[e.type]}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{e.player}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t(`event.${e.type}` as DictKey)}
              {e.detail ? ` · ${e.detail}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Stats({ stats }: { stats: MatchStats }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      {STAT_KEYS.map((k) => {
        const [h, a] = stats[k];
        const pct = h + a === 0 ? 50 : (h / (h + a)) * 100;
        const suffix = k === "possession" || k === "passAccuracy" ? "%" : "";
        return (
          <div key={k} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold tabular-nums">{h}{suffix}</span>
              <span className="text-xs text-muted-foreground">{t(`stat.${k}`)}</span>
              <span className="font-bold tabular-nums">{a}{suffix}</span>
            </div>
            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
              <span className="rounded-full bg-primary" style={{ width: `${pct}%` }} />
              <span className="flex-1 rounded-full bg-gold" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Info({ match }: { match: MatchDetail }) {
  const { t, loc, fmtDate, fmtTime } = useI18n();
  const league = getLeague(match.leagueId);
  const rows: [DictKey, string][] = [
    ["scores.kickoff", `${fmtDate(match.kickoff)} · ${fmtTime(match.kickoff)}`],
    ["scores.league", league ? loc(league.name) : "—"],
    ["scores.round", String(match.round)],
    ["scores.venue", match.venue],
    ["scores.referee", match.referee],
  ];
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 px-4 py-3 text-sm">
          <dt className="text-muted-foreground">{t(k)}</dt>
          <dd className="truncate font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
