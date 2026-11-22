import type { ReactNode } from "react";
import { Link, Navigate, useHydrated, useRouterState } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, type DemoUser } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { can, type Permission } from "@/lib/permissions";
import { ListSkeleton } from "./States";

/**
 * Client-side gate for demo accounts (stored in the browser). The server render has no
 * session, so we show a skeleton until hydration, then redirect or render.
 */
export function RequireAccess({ permission, children }: { permission: Permission; children: (user: DemoUser) => ReactNode }) {
  const hydrated = useHydrated();
  const { user } = useSession();
  const { t } = useI18n();
  const href = useRouterState({ select: (s) => s.location.href });

  if (!hydrated) return <ListSkeleton rows={4} />;
  if (!user) return <Navigate to="/auth" search={{ redirect: href }} replace />;
  if (!can(user.role, permission)) {
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
        <ShieldOff className="h-9 w-9 text-live" />
        <h1 className="text-lg font-bold">{t("forbidden.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("forbidden.body")}</p>
        <Button asChild variant="surface">
          <Link to="/">{t("notFound.home")}</Link>
        </Button>
      </div>
    );
  }
  return <>{children(user)}</>;
}
