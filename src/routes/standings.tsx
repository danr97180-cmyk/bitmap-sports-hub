import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StandingsTable } from "@/components/sports/StandingsTable";
import { ErrorState } from "@/components/common/States";
import { PageHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { LEAGUES } from "@/lib/sports/catalog";
import { standingsQuery } from "@/lib/sports/queries";

export const Route = createFileRoute("/standings")({
  head: () => ({
    meta: [
      { title: "League standings — BITMAP" },
      { name: "description", content: "Football league tables with points, goal difference and recent form." },
      { property: "og:title", content: "League standings — BITMAP" },
      { property: "og:description", content: "Up-to-date football league tables and form guides." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StandingsPage,
});

function StandingsPage() {
  const { t, loc } = useI18n();
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id);
  const q = useQuery(standingsQuery(leagueId));
  return (
    <div>
      <PageHeader title={t("standings.title")} />
      <div className="scrollbar-none -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        {LEAGUES.map((l) => (
          <Button key={l.id} variant="chip" size="sm" data-active={leagueId === l.id} onClick={() => setLeagueId(l.id)}>
            <span aria-hidden="true">{l.flag}</span> {loc(l.name)}
          </Button>
        ))}
      </div>
      {q.isPending ? (
        <Skeleton className="h-80 w-full rounded-xl bg-surface-2" />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : (
        <StandingsTable rows={q.data} />
      )}
      <p className="mt-4 text-xs text-muted-foreground">{t("scores.sampleNote")}</p>
    </div>
  );
}
