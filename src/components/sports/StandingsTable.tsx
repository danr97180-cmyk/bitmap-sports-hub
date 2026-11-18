import { TeamBadge } from "@/components/common/TeamBadge";
import { useI18n } from "@/lib/i18n";
import { getTeam } from "@/lib/sports/catalog";
import type { StandingRow } from "@/lib/sports/types";
import { cn } from "@/lib/utils";

const FORM_STYLE = { W: "bg-success text-primary-foreground", D: "bg-surface-3 text-foreground", L: "bg-live text-live-foreground" };

export function StandingsTable({ rows, compact = false }: { rows: StandingRow[]; compact?: boolean }) {
  const { t, loc } = useI18n();
  const formLabel = { W: t("table.won"), D: t("table.drawn"), L: t("table.lost") };
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[20rem] text-sm">
        <thead className="bg-surface-2 text-xs text-muted-foreground">
          <tr>
            <th className="w-8 px-2 py-2.5 text-center font-semibold">{t("table.pos")}</th>
            <th className="px-2 py-2.5 text-start font-semibold">{t("table.team")}</th>
            <th className="px-1.5 py-2.5 text-center font-semibold">{t("table.played")}</th>
            {!compact && (
              <>
                <th className="hidden px-1.5 py-2.5 text-center font-semibold sm:table-cell">{t("table.won")}</th>
                <th className="hidden px-1.5 py-2.5 text-center font-semibold sm:table-cell">{t("table.drawn")}</th>
                <th className="hidden px-1.5 py-2.5 text-center font-semibold sm:table-cell">{t("table.lost")}</th>
              </>
            )}
            <th className="px-1.5 py-2.5 text-center font-semibold">{t("table.gd")}</th>
            <th className="px-2 py-2.5 text-center font-semibold text-foreground">{t("table.pts")}</th>
            {!compact && <th className="hidden px-2 py-2.5 text-center font-semibold md:table-cell">{t("table.form")}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const team = getTeam(r.teamId);
            const gd = r.gf - r.ga;
            return (
              <tr key={r.teamId} className="border-t border-border">
                <td className="px-2 py-2.5 text-center">
                  <span className={cn("inline-grid h-6 w-6 place-items-center rounded-md text-xs font-bold", i === 0 ? "bg-gold text-gold-foreground" : i < 3 ? "bg-primary/15 text-primary" : "text-muted-foreground")}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamBadge teamId={r.teamId} size="sm" />
                    <span className="truncate font-medium">{loc(team.name)}</span>
                  </div>
                </td>
                <td className="px-1.5 py-2.5 text-center tabular-nums text-muted-foreground">{r.played}</td>
                {!compact && (
                  <>
                    <td className="hidden px-1.5 py-2.5 text-center tabular-nums sm:table-cell">{r.won}</td>
                    <td className="hidden px-1.5 py-2.5 text-center tabular-nums sm:table-cell">{r.drawn}</td>
                    <td className="hidden px-1.5 py-2.5 text-center tabular-nums sm:table-cell">{r.lost}</td>
                  </>
                )}
                <td dir="ltr" className="px-1.5 py-2.5 text-center tabular-nums text-muted-foreground">{gd > 0 ? `+${gd}` : gd}</td>
                <td className="px-2 py-2.5 text-center font-extrabold tabular-nums">{r.points}</td>
                {!compact && (
                  <td className="hidden px-2 py-2.5 md:table-cell">
                    <div className="flex justify-center gap-1">
                      {r.form.map((f, k) => (
                        <span key={k} title={formLabel[f]} className={cn("grid h-5 w-5 place-items-center rounded text-[10px] font-bold", FORM_STYLE[f])}>
                          {formLabel[f].slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
