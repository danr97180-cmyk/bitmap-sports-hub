import { Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Game } from "@/lib/games";

export function GameTile({ game, onPlay }: { game: Game; onPlay: (g: Game) => void }) {
  const { loc, t } = useI18n();
  return (
    <button
      onClick={() => onPlay(game)}
      className="group relative block w-full overflow-hidden rounded-xl border border-border bg-surface text-start shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img src={game.image} alt="" loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="bg-tile-scrim absolute inset-0" />
      <span className="absolute start-2 top-2 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
        {game.isNew ? t("common.new") : t("games.free")}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{loc(game.name)}</p>
          <p className="text-[11px] text-muted-foreground">{t(`games.cat.${game.category}`)}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground opacity-90 transition-transform group-hover:scale-110">
          <Play className="h-4 w-4 fill-current rtl:-scale-x-100" />
        </span>
      </div>
    </button>
  );
}
