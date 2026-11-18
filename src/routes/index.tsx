import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Coins, Radio } from "lucide-react";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { LiveMatchCard } from "@/components/sports/MatchRow";
import { StandingsTable } from "@/components/sports/StandingsTable";
import { GameTile } from "@/components/games/GameTile";
import { PlayDialog } from "@/components/games/PlayDialog";
import { EmptyState, ErrorState } from "@/components/common/States";
import { LiveDot, SectionHeader } from "@/components/common/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { GAMES, type Game } from "@/lib/games";
import { LEAGUES } from "@/lib/sports/catalog";
import { dateKey, fixturesQuery, standingsQuery } from "@/lib/sports/queries";
import { useSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BITMAP — Live football scores & free-play games" },
      { name: "description", content: "Follow live football scores, match events and league tables, and play original free games for virtual points." },
      { property: "og:title", content: "BITMAP — Live football scores & free-play games" },
      { property: "og:description", content: "Live scores, standings and original free-play games. Virtual points only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function LiveRail() {
  const { t } = useI18n();
  const q = useQuery(fixturesQuery(dateKey(0)));
  const live = (q.data ?? []).filter((m) => m.status === "live" || m.status === "ht");
  return (
    <section>
      <SectionHeader
        title={t("home.liveNow")}
        icon={<LiveDot />}
        action={
          <Link to="/scores" className="text-xs font-semibold text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        }
      />
      {q.isPending ? (
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-64 shrink-0 rounded-xl bg-surface-2" />
          ))}
        </div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : live.length === 0 ? (
        <EmptyState message={t("home.noLive")} />
      ) : (
        <div className="scrollbar-none -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          {live.map((m) => (
            <LiveMatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function TablePreview() {
  const { t, loc } = useI18n();
  const league = LEAGUES[0];
  const q = useQuery(standingsQuery(league.id));
  return (
    <section>
      <SectionHeader
        title={`${t("home.topTable")} · ${loc(league.name)}`}
        action={
          <Link to="/standings" className="text-xs font-semibold text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        }
      />
      {q.isPending ? (
        <Skeleton className="h-64 w-full rounded-xl bg-surface-2" />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : (
        <StandingsTable rows={q.data.slice(0, 5)} compact />
      )}
    </section>
  );
}

function Index() {
  const { t } = useI18n();
  const { user } = useSession();
  const [game, setGame] = useState<Game | null>(null);

  return (
    <div className="space-y-8">
      <BannerCarousel />

      <section>
        <SectionHeader title={t("home.categories")} />
        <CategoryGrid />
      </section>

      <LiveRail />

      <section>
        <SectionHeader
          title={t("home.featuredGames")}
          action={
            <Link to="/games" className="text-xs font-semibold text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GAMES.slice(0, 4).map((g) => (
            <GameTile key={g.id} game={g} onPlay={setGame} />
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TablePreview />
        <section className="bg-pixel-grid relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-gold/30 bg-surface p-5">
          <div className="space-y-2">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-gold-foreground shadow-gold">
              <Coins className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-extrabold">{t("home.pointsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.pointsBody")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="gold">
              {user ? <Link to="/wallet">{t("nav.wallet")}</Link> : <Link to="/auth" search={{ mode: "register" }}>{t("home.pointsCta")}</Link>}
            </Button>
            <Button asChild variant="surface">
              <Link to="/scores">
                <Radio /> {t("home.heroCta")}
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <PlayDialog game={game} onClose={() => setGame(null)} />
    </div>
  );
}
