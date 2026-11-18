import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ErrorState({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center", className)}>
      <AlertTriangle className="h-8 w-8 text-live" />
      <div>
        <p className="font-semibold">{t("common.errorTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("common.errorBody")}</p>
      </div>
      {onRetry && (
        <Button variant="surface" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ message, className }: { message?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground", className)}>
      <Inbox className="h-7 w-7" />
      {message ?? t("common.noResults")}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div className="space-y-2" aria-busy="true" aria-label={t("common.loading")}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl bg-surface-2" />
      ))}
    </div>
  );
}
