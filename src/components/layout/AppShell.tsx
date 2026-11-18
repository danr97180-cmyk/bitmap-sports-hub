import { useState, type CSSProperties, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Home, Radio, Gamepad2, Coins, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { BrandLogo } from "./BrandLogo";
import { DesktopSidebar, MobileSidebar } from "./AppSidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MAIN_TABS } from "./nav";
import { PointsBadge, UserMenu } from "./UserMenu";

function Header({ onMenu }: { onMenu: () => void }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onMenu} className="shrink-0 lg:hidden" aria-label={t("nav.menu")}>
            <Menu className="!size-5" />
          </Button>
          <BrandLogo />
          <span className="ms-1 hidden rounded-sm border border-gold/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gold sm:inline">
            {t("common.demoBadge")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <PointsBadge />
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
      <MainTabs />
    </header>
  );
}

function MainTabs() {
  const { t } = useI18n();
  return (
    <nav className="scrollbar-none flex overflow-x-auto border-t border-border bg-surface" aria-label={t("nav.explore")}>
      {MAIN_TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          activeOptions={{ exact: tab.exact }}
          className="relative flex shrink-0 items-center gap-2 border-e border-border px-4 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground data-[status=active]:text-gold after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-gold after:opacity-0 after:transition-opacity data-[status=active]:after:opacity-100"
        >
          <tab.icon className="h-4 w-4" />
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}

function BottomNav() {
  const { t } = useI18n();
  const { user } = useSession();
  const items = [
    { to: "/", label: t("nav.home"), icon: Home, exact: true },
    { to: "/scores", label: t("nav.scores"), icon: Radio },
    { to: "/games", label: t("nav.games"), icon: Gamepad2 },
    { to: "/wallet", label: t("nav.wallet"), icon: Coins },
    { to: user ? "/dashboard" : "/auth", label: user ? t("nav.account") : t("nav.signIn"), icon: User },
  ] as const;
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden" aria-label={t("nav.menu")}>
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            className="group flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <span className="grid h-7 w-12 place-items-center rounded-full transition-colors group-data-[status=active]:bg-primary/15">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="max-w-full truncate px-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-10 border-t border-border bg-surface px-4 py-6 text-xs text-muted-foreground">
      <div className="mx-auto max-w-6xl space-y-3">
        <BrandLogo />
        <p className="max-w-xl leading-relaxed">{t("footer.noMoney")}</p>
        <p>© 2026 BITMAP. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dir } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname === "/auth";

  return (
    <div dir={dir} className="min-h-dvh bg-background" style={{ "--header-h": "6.25rem" } as CSSProperties}>
      <Header onMenu={() => setMenuOpen(true)} />
      <MobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
      <div className="flex">
        {!bare && <DesktopSidebar />}
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">{children}</main>
          <Footer />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
