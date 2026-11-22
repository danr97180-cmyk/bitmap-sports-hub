import { createFileRoute } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { MatchRow } from "@/components/sports/MatchRow";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/States";
import { PageHeader } from "@/components/common/SectionHeader";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LEAGUES } from "@/lib/sports/catalog";
import { dateKey, fixturesQuery } from "@/lib/sports/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scores")({
  head: () => ({
    meta: [
      { title: "Live football scores — BITMAP" },
      { name: "description", content: "Today's football fixtures and live scores across the Premier League, La Liga, Saudi Pro League and Israeli Premier League." },
      { property: "og:title", content: "Live football scores — BITMAP" },
      { property: "og:description", content: "Fixtures, live scores and results, updated every 30 seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScoresPage,
});

const OFFSETS = [-1, 0, 1, 2, 3];

function ScoresPage() {
  const { t, loc, fmtDate } = useI18n();
  const [offset, setOffset] = useState(0);
  const [league, setLeague] = useState<string>("all");
  const key = dateKey(offset);
  const q = useQuery(fixturesQuery(key));
  const counts = useQueries({ queries: OFFSETS.map((o) => fixturesQuery(dateKey(o))) });

  const label = (o: number) =>
    o === 0 ? t("common.today") : o === 1 ? t("common.tomorrow") : o === -1 ? t("common.yesterday") : fmtDate(dateKey(o), { day: "2-digit", month: "2-digit" });

  const matches = (q.data ?? []).filter((m) => league === "all" || m.leagueId === league);
  const leagues = LEAGUES.filter((l) => matches.some((m) => m.leagueId === l.id));

  return (
    <div>
      <PageHeader title={t("scores.title")} />

      {/* Date tabs */}
      <div className="-mx-3 mb-3 grid grid-cols-5 border-y border-border bg-surface sm:mx-0 sm:rounded-xl sm:border">
        {OFFSETS.map((o, i) => (
          <button
            key={o}
            onClick={() => setOffset(o)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-1 py-2.5 text-xs font-semibold transition-colors",
              i > 0 && "border-s border-border",
              o === offset ? "text-gold" : "text-foreground/75 hover:text-foreground",
            )}
          >
            <span className="truncate">{label(o)}</span>
            <span className="text-[10px] text-muted-foreground">({counts[i]?.data?.length ?? "·"})</span>
            {o === offset && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-gold" />}
          </button>
        ))}
      </div>

      {/* League filter */}
      <div className="scrollbar-none -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <Button variant="chip" size="sm" data-active={league === "all"} onClick={() => setLeague("all")}>
          {t("scores.allLeagues")}
        </Button>
        {LEAGUES.map((l) => (
          <Button key={l.id} variant="chip" size="sm" data-active={league === l.id} onClick={() => setLeague(l.id)}>
            <span aria-hidden="true">{l.flag}</span> {loc(l.name)}
          </Button>
        ))}
      </div>

      {q.isPending ? (
        <ListSkeleton rows={6} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : leagues.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {leagues.map((l) => {
            const list = matches.filter((m) => m.leagueId === l.id);
            return (
              <Collapsible key={l.id} defaultOpen className="overflow-hidden rounded-xl border border-border bg-surface">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 bg-surface-2 px-3 py-2.5 text-start">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden="true">{l.flag}</span>
                    <span className="truncate text-sm font-bold">{loc(l.name)}</span>
                    <span className="text-xs text-muted-foreground">· {loc(l.country)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {list.length} {t("scores.matches")}
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {list.map((m) => (
                    <MatchRow key={m.id} match={m} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("scores.sampleNote")}
      </p>
    </div>
  );
}
