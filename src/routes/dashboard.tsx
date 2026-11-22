import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Gamepad2, Radio, Table2, User } from "lucide-react";
import { ActivityList } from "@/components/common/ActivityList";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader, SectionHeader } from "@/components/common/SectionHeader";
import { TxList } from "@/components/common/TxList";
import { useSession, type DemoUser } from "@/lib/demo-auth";
import { useI18n, type DictKey } from "@/lib/i18n";
import { usePoints } from "@/lib/points-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — BITMAP" },
      { name: "description", content: "Your BITMAP points, recent activity and shortcuts in one place." },
      { property: "og:title", content: "My dashboard — BITMAP" },
      { property: "og:description", content: "Points, activity and shortcuts for BITMAP members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAccess permission="view_user_dashboard">{(u) => <Dashboard user={u} />}</RequireAccess>,
});

const SHORTCUTS = [
  { to: "/scores", label: "nav.scores", icon: Radio },
  { to: "/standings", label: "nav.standings", icon: Table2 },
  { to: "/games", label: "nav.games", icon: Gamepad2 },
  { to: "/profile", label: "nav.profile", icon: User },
] as const satisfies readonly { to: string; label: DictKey; icon: typeof Radio }[];

function Dashboard({ user }: { user: DemoUser }) {
  const { t, fmtNumber } = useI18n();
  const { balance, mine } = usePoints(user.id);
  const { activity } = useSession();

  return (
    <div className="space-y-6">
      <PageHeader title={t("dash.welcome", { name: user.name.split(" ")[0] ?? user.name })} subtitle={t("dash.userSub")} />
      <Link to="/wallet" className="bg-pixel-grid flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-surface p-5 transition-colors hover:border-gold/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("wallet.balance")}</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-gold">{fmtNumber(balance)}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-gold-foreground shadow-gold">
          <Coins className="h-6 w-6" />
        </span>
      </Link>

      <section>
        <SectionHeader title={t("dash.quick")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHORTCUTS.map((s) => (
            <Link key={s.to} to={s.to} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary">
              <s.icon className="h-6 w-6 text-primary" />
              {t(s.label)}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader
            title={t("wallet.history")}
            action={
              <Link to="/wallet" className="text-xs font-semibold text-primary hover:underline">
                {t("common.viewAll")}
              </Link>
            }
          />
          <TxList txs={mine} limit={5} />
        </section>
        <section>
          <SectionHeader title={t("dash.recent")} />
          <ActivityList items={activity.filter((a) => a.userId === user.id)} limit={5} />
        </section>
      </div>
    </div>
  );
}
