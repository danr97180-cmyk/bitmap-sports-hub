import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeSync } from "@/components/common/ThemeSync";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANG, HtmlLangSync, dirFor, useI18n } from "@/lib/i18n";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-pixel text-7xl text-primary">404</p>
        <h1 className="mt-4 text-xl font-semibold">{t("notFound.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFound.body")}</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/">{t("notFound.home")}</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">{t("common.errorTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.errorBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            variant="hero"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            {t("common.retry")}
          </Button>
          <Button asChild variant="surface">
            <a href="/">{t("notFound.home")}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0d110e" },
      { title: "BITMAP — Live football & free-play games" },
      { name: "description", content: "BITMAP: live football scores, standings and original free-play games with virtual points. No real money." },
      { name: "author", content: "BITMAP" },
      { property: "og:title", content: "BITMAP — Live football & free-play games" },
      { property: "og:description", content: "Live scores, league tables and free-play games with virtual points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Silkscreen:wght@400;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANG} dir={dirFor(DEFAULT_LANG)} className="bg-background" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { dir } = useI18n();

  return (
    <QueryClientProvider client={queryClient}>
      <HtmlLangSync />
      <ThemeSync />
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster position="top-center" dir={dir} richColors={false} />
    </QueryClientProvider>
  );
}
