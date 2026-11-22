import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameTile } from "@/components/games/GameTile";
import { PlayDialog } from "@/components/games/PlayDialog";
import { PageHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { GAMES, type Game, type GameCategory } from "@/lib/games";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Free-play games — BITMAP" },
      { name: "description", content: "Original BITMAP pixel mini-games. No stakes — play demo rounds to earn virtual points." },
      { property: "og:title", content: "Free-play games — BITMAP" },
      { property: "og:description", content: "Play original free mini-games and collect virtual points. No real money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

const CATS: GameCategory[] = ["sports", "arcade", "puzzle", "trivia"];

function GamesPage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<GameCategory | "all" | "popular">("all");
  const [game, setGame] = useState<Game | null>(null);
  const list = GAMES.filter((g) => (cat === "all" ? true : cat === "popular" ? g.popular : g.category === cat));

  return (
    <div>
      <PageHeader title={t("games.title")} subtitle={t("games.subtitle")} />
      <div className="scrollbar-none -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <Button variant="chip" size="sm" data-active={cat === "all"} onClick={() => setCat("all")}>
          {t("common.all")}
        </Button>
        <Button variant="chip" size="sm" data-active={cat === "popular"} onClick={() => setCat("popular")}>
          {t("common.popular")}
        </Button>
        {CATS.map((c) => (
          <Button key={c} variant="chip" size="sm" data-active={cat === c} onClick={() => setCat(c)}>
            {t(`games.cat.${c}`)}
          </Button>
        ))}
      </div>
      {list.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((g) => (
            <GameTile key={g.id} game={g} onPlay={setGame} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <p className="mt-5 text-xs text-muted-foreground">{t("wallet.disclaimer")}</p>
      <PlayDialog game={game} onClose={() => setGame(null)} />
    </div>
  );
}
