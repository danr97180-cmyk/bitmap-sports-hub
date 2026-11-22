import { createFileRoute } from "@tanstack/react-router";
import { Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader, SectionHeader } from "@/components/common/SectionHeader";
import { TxList } from "@/components/common/TxList";
import { Button } from "@/components/ui/button";
import type { DemoUser } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { DAILY_BONUS, hasClaimedDailyBonus } from "@/lib/points";
import { claimDailyBonus, usePoints } from "@/lib/points-store";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Virtual points — BITMAP" },
      { name: "description", content: "Your BITMAP virtual points balance, daily bonus and transaction history." },
      { property: "og:title", content: "Virtual points — BITMAP" },
      { property: "og:description", content: "Track virtual points. No cash value, no purchases, no withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAccess permission="view_user_dashboard">{(u) => <Wallet user={u} />}</RequireAccess>,
});

function Wallet({ user }: { user: DemoUser }) {
  const { t, fmtNumber } = useI18n();
  const { balance, mine, transactions } = usePoints(user.id);
  const claimed = hasClaimedDailyBonus(transactions, user.id, new Date());

  const claim = () => {
    if (claimed || !can(user.role, "claim_daily_bonus")) return;
    claimDailyBonus(user.id);
    toast.success(t("wallet.claimedToast", { n: DAILY_BONUS }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("wallet.title")} subtitle={t("wallet.disclaimer")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-pixel-grid relative overflow-hidden rounded-2xl border border-gold/30 bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("wallet.balance")}</p>
          <p className="mt-2 flex items-center gap-2 text-4xl font-extrabold text-gold">
            <Coins className="h-8 w-8" />
            <span className="tabular-nums">{fmtNumber(balance)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("common.pointsLong")}</p>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">{t("wallet.daily")}</p>
              <p className="text-sm text-muted-foreground">{t("wallet.dailyBody", { n: DAILY_BONUS })}</p>
            </div>
          </div>
          <Button variant="hero" onClick={claim} disabled={claimed}>
            {claimed ? t("wallet.claimed") : `${t("wallet.claim")} +${DAILY_BONUS}`}
          </Button>
        </div>
      </div>
      <section>
        <SectionHeader title={t("wallet.history")} />
        <TxList txs={mine} />
      </section>
    </div>
  );
}
