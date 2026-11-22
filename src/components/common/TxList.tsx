import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PointsTx } from "@/lib/points";
import { cn } from "@/lib/utils";
import { EmptyState } from "./States";

export function TxList({ txs, limit }: { txs: PointsTx[]; limit?: number }) {
  const { t, fmtNumber, fmtDate, fmtTime } = useI18n();
  const list = limit ? txs.slice(0, limit) : txs;
  if (!list.length) return <EmptyState />;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {list.map((tx) => {
        const plus = tx.amount >= 0;
        const Icon = plus ? ArrowDownLeft : ArrowUpRight;
        return (
          <li key={tx.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
            <span className={cn("grid h-8 w-8 place-items-center rounded-lg", plus ? "bg-primary/15 text-primary" : "bg-live/15 text-live")}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{t(`tx.${tx.type}`)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {fmtDate(tx.at)} · {fmtTime(tx.at)}
                {tx.note ? ` · ${tx.note}` : ""}
              </p>
            </div>
            <span dir="ltr" className={cn("text-sm font-bold tabular-nums", plus ? "text-primary" : "text-live")}>
              {plus ? "+" : ""}
              {fmtNumber(tx.amount)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
