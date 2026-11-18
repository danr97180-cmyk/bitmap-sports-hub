import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "@/lib/demo-auth";
import { LANGS, setLang, useI18n } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { ACCOUNT_NAV, MAIN_TABS, MANAGEMENT_NAV, type NavItem } from "./nav";
import { useSignOut } from "./UserMenu";

function NavGroup({ title, items, onNavigate }: { title: string; items: NavItem[]; onNavigate?: () => void }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.map((item) => (
        <Link
          key={item.to + item.label}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.exact }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">{t(item.label)}</span>
        </Link>
      ))}
    </div>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useSession();
  const { t, lang } = useI18n();
  const handleSignOut = useSignOut();
  const allowed = (items: NavItem[]) => items.filter((i) => !i.permission || can(user?.role, i.permission));

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-3">
      <NavGroup title={t("nav.explore")} items={MAIN_TABS.filter((i) => i.to !== "/wallet")} onNavigate={onNavigate} />
      {user && <NavGroup title={t("nav.account")} items={allowed(ACCOUNT_NAV)} onNavigate={onNavigate} />}
      {user && <NavGroup title={t("nav.management")} items={allowed(MANAGEMENT_NAV)} onNavigate={onNavigate} />}

      <div className="space-y-2">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("common.language")}</p>
        <div className="grid grid-cols-3 gap-1.5 px-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                l.code === lang ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        {user ? (
          <button onClick={() => { onNavigate?.(); handleSignOut(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-live hover:bg-sidebar-accent">
            <LogOut className="h-[18px] w-[18px]" />
            {t("nav.signOut")}
          </button>
        ) : (
          <Link to="/auth" search={{}} onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-sidebar-accent">
            <LogIn className="h-[18px] w-[18px]" />
            {t("nav.signIn")}
          </Link>
        )}
        <p className="px-3 text-[11px] leading-relaxed text-muted-foreground">{t("common.demoNotice")}</p>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="sticky top-[var(--header-h)] hidden h-[calc(100dvh-var(--header-h))] w-60 shrink-0 border-e border-sidebar-border bg-sidebar lg:block">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { dir, t } = useI18n();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-[82%] max-w-xs border-sidebar-border bg-sidebar p-0" dir={dir}>
        <SheetHeader className="border-b border-sidebar-border p-4">
          <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
          <BrandLogo />
        </SheetHeader>
        <SidebarBody onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
