import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { usePoints } from "@/lib/points-store";
import { ACCOUNT_NAV, MANAGEMENT_NAV } from "./nav";

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function useSignOut() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useI18n();
  return () => {
    signOut();
    qc.removeQueries({ queryKey: ["private"] });
    toast(t("auth.signedOut"));
    navigate({ to: "/auth", search: {}, replace: true });
  };
}

export function PointsBadge() {
  const { user } = useSession();
  const { balance } = usePoints(user?.id);
  const { fmtNumber, t } = useI18n();
  if (!user) return null;
  return (
    <Link
      to="/wallet"
      className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold transition-colors hover:bg-gold/20"
    >
      <Coins className="h-3.5 w-3.5" />
      <span>{fmtNumber(balance)}</span>
      <span className="sr-only">{t("common.pointsLong")}</span>
    </Link>
  );
}

export function UserMenu() {
  const { user } = useSession();
  const { t } = useI18n();
  const handleSignOut = useSignOut();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth" search={{}}>{t("nav.signIn")}</Link>
        </Button>
        <Button asChild variant="hero" size="sm">
          <Link to="/auth" search={{ mode: "register" }}>{t("nav.register")}</Link>
        </Button>
      </div>
    );
  }

  const items = [...ACCOUNT_NAV, ...MANAGEMENT_NAV].filter((i) => !i.permission || can(user.role, i.permission));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t("nav.account")}>
          <Avatar className="h-8 w-8 border border-primary/40">
            <AvatarFallback className="bg-surface-3 text-xs font-bold text-primary">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs font-normal text-muted-foreground">{t(`role.${user.role}`)}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.to + item.label} asChild>
            <Link to={item.to} className="gap-2">
              <item.icon className="h-4 w-4" />
              {t(item.label)}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-live focus:text-live">
          <LogOut className="h-4 w-4" />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

