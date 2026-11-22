import { History } from "lucide-react";
import type { ActivityEntry } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "./States";

export function ActivityList({ items, limit }: { items: ActivityEntry[]; limit?: number }) {
  const { t, fmtDate, fmtTime } = useI18n();
  const list = limit ? items.slice(0, limit) : items;
  if (!list.length) return <EmptyState />;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {list.map((a) => (
        <li key={a.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
          <History className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate font-medium">
            {t(`activity.${a.type}`)}
            {a.type === "role_change" && a.detail ? ` · ${t(`role.${a.detail as "admin" | "agent" | "user"}`)}` : ""}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {fmtDate(a.at)} · {fmtTime(a.at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
