import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/lib/demo-auth";
import type { Game } from "@/lib/games";
import { useI18n } from "@/lib/i18n";
import { GAME_REWARD_MAX, GAME_REWARD_MIN } from "@/lib/points";
import { addTransaction } from "@/lib/points-store";

export function PlayDialog({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { t, loc, dir } = useI18n();
  const { user } = useSession();
  const [playing, setPlaying] = useState(false);
  const [reward, setReward] = useState<number | null>(null);

  const play = () => {
    if (!user || !game) return;
    setPlaying(true);
    setReward(null);
    window.setTimeout(() => {
      const n = GAME_REWARD_MIN + Math.floor(Math.random() * (GAME_REWARD_MAX - GAME_REWARD_MIN + 1));
      addTransaction({ userId: user.id, amount: n, type: "game_reward", note: game.name.en });
      setReward(n);
      setPlaying(false);
      toast.success(t("games.reward", { n }));
    }, 1200);
  };

  return (
    <Dialog open={!!game} onOpenChange={(o) => { if (!o) { onClose(); setReward(null); } }}>
      <DialogContent dir={dir} className="max-w-sm overflow-hidden border-border bg-surface p-0">
        {game && (
          <>
            <img src={game.image} alt="" className="aspect-video w-full object-cover" />
            <div className="space-y-4 p-5">
              <DialogHeader className="text-start sm:text-start">
                <DialogTitle className="text-xl">{loc(game.name)}</DialogTitle>
                <DialogDescription>{t("games.subtitle")}</DialogDescription>
              </DialogHeader>
              {reward !== null && (
                <div className="flex animate-pixel-in items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm font-semibold text-gold">
                  <Sparkles className="h-4 w-4" /> {t("games.reward", { n: reward })}
                </div>
              )}
              {user ? (
                <Button variant="hero" size="xl" className="w-full" onClick={play} disabled={playing}>
                  {playing ? t("common.loading") : t("games.playRound")}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("games.signInToEarn")}</p>
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/auth" search={{}}>{t("nav.signIn")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
