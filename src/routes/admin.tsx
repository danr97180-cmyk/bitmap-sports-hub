import { useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Briefcase, Coins, Radio, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader, SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/States";
import { BANNER_IMAGES } from "@/components/home/BannerCarousel";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUser, useSession, type DemoUser } from "@/lib/demo-auth";
import { DICTIONARIES, DICT_KEYS, useI18n, type DictKey } from "@/lib/i18n";
import { can, ROLES, type Role } from "@/lib/permissions";
import { getBalance, validateGrant } from "@/lib/points";
import { addTransaction, usePoints } from "@/lib/points-store";
import { APP_LINKS, DEFAULT_SETTINGS, settingsStore, updateSettings, useSettings, type AppLink, type SiteSettings } from "@/lib/settings";
import { dateKey, fixturesQuery } from "@/lib/sports/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — BITMAP" },
      { name: "description", content: "BITMAP platform settings, members, branding, banners and translations." },
      { property: "og:title", content: "Admin panel — BITMAP" },
      { property: "og:description", content: "Administration tools for the BITMAP platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAccess permission="view_admin_dashboard">{(u) => <AdminPanel admin={u} />}</RequireAccess>,
});

const LINK_LABEL: Record<AppLink, DictKey> = {
  "/": "nav.home",
  "/scores": "nav.scores",
  "/standings": "nav.standings",
  "/games": "nav.games",
  "/wallet": "nav.wallet",
  "/auth": "nav.signIn",
};

function AdminPanel({ admin }: { admin: DemoUser }) {
  const { t, dir } = useI18n();
  const tabs = [
    ["overview", "admin.tab.overview"],
    ["users", "admin.tab.users"],
    ["branding", "admin.tab.branding"],
    ["banners", "admin.tab.banners"],
    ["categories", "admin.tab.categories"],
    ["translations", "admin.tab.translations"],
  ] as const;
  return (
    <div>
      <PageHeader title={t("admin.title")} subtitle={t("admin.sub")} />
      <Tabs defaultValue="overview" dir={dir}>
        <TabsList className="scrollbar-none mb-4 flex h-auto w-full justify-start overflow-x-auto bg-surface p-1">
          {tabs.map(([v, k]) => (
            <TabsTrigger key={v} value={v} className="shrink-0">
              {t(k)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="users"><UsersTab admin={admin} /></TabsContent>
        <TabsContent value="branding">{can(admin.role, "manage_settings") && <BrandingTab />}</TabsContent>
        <TabsContent value="banners">{can(admin.role, "manage_settings") && <BannersTab />}</TabsContent>
        <TabsContent value="categories">{can(admin.role, "manage_settings") && <CategoriesTab />}</TabsContent>
        <TabsContent value="translations">{can(admin.role, "manage_translations") && <TranslationsTab />}</TabsContent>
      </Tabs>
    </div>
  );
}

function Overview() {
  const { t, fmtNumber } = useI18n();
  const { users } = useSession();
  const { transactions } = usePoints(null);
  const fixtures = useQuery(fixturesQuery(dateKey(0)));
  const live = (fixtures.data ?? []).filter((m) => m.status === "live" || m.status === "ht").length;
  const issued = transactions.reduce((s, tx) => (tx.amount > 0 ? s + tx.amount : s), 0);
  const cards = [
    { label: "admin.totalUsers", value: users.filter((u) => u.role === "user").length, icon: Users },
    { label: "admin.agents", value: users.filter((u) => u.role === "agent").length, icon: Briefcase },
    { label: "admin.pointsIssued", value: issued, icon: Coins },
    { label: "admin.liveMatches", value: fixtures.isPending ? null : live, icon: Radio },
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-surface p-4">
          <c.icon className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-extrabold tabular-nums">{c.value === null ? "…" : fmtNumber(c.value)}</p>
          <p className="text-xs text-muted-foreground">{t(c.label)}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTab({ admin }: { admin: DemoUser }) {
  const { t, fmtNumber, dir } = useI18n();
  const { users } = useSession();
  const { transactions } = usePoints(null);
  const [adjust, setAdjust] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const list = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(query.trim().toLowerCase()));

  const doAdjust = (u: DemoUser) => {
    const n = Number(adjust[u.id] ?? "");
    const err = validateGrant({ actor: { id: admin.id, role: admin.role }, target: u, amount: n, currentBalance: getBalance(transactions, u.id) });
    if (err) return toast.error(t(`grant.err.${err}`));
    addTransaction({ userId: u.id, amount: n, type: "admin_adjustment", byUserId: admin.id });
    setAdjust((a) => ({ ...a, [u.id]: "" }));
    toast.success(t("common.saved"));
  };

  return (
    <div className="space-y-3">
      <Input placeholder={t("common.search")} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm bg-surface" />
      <p className="text-xs text-muted-foreground">{t("admin.adjustHint")}</p>
      {!list.length && <EmptyState />}
      <ul className="space-y-2">
        {list.map((u) => (
          <li key={u.id} className="grid gap-3 rounded-xl border border-border bg-surface p-3 md:grid-cols-[minmax(0,1fr)_9rem_auto_minmax(0,14rem)] md:items-center">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">{u.email}</p>
              <p className="text-xs font-bold text-gold tabular-nums">{fmtNumber(getBalance(transactions, u.id))} {t("common.points")}</p>
            </div>
            <Select
              value={u.role}
              dir={dir}
              disabled={u.id === admin.id || !can(admin.role, "change_roles")}
              onValueChange={(v) => {
                updateUser(u.id, { role: v as Role }, "role_change");
                toast.success(t("common.saved"));
              }}
            >
              <SelectTrigger className="bg-surface-2" aria-label={t("admin.changeRole")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{t(`role.${r}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-xs">
              <Switch
                checked={u.status === "active"}
                disabled={u.id === admin.id || !can(admin.role, "manage_users")}
                onCheckedChange={(on) => updateUser(u.id, { status: on ? "active" : "suspended" })}
              />
              <span className={u.status === "active" ? "text-primary" : "text-live"}>{t(u.status === "active" ? "common.active" : "common.suspended")}</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                dir="ltr"
                inputMode="numeric"
                placeholder="±100"
                aria-label={t("admin.adjust")}
                value={adjust[u.id] ?? ""}
                onChange={(e) => setAdjust((a) => ({ ...a, [u.id]: e.target.value }))}
                className="bg-surface-2"
              />
              <Button variant="surface" size="sm" className="h-9" onClick={() => doAdjust(u)} disabled={!can(admin.role, "adjust_points")}>
                {t("common.save")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandingTab() {
  const { t } = useI18n();
  const s = useSettings();
  const [name, setName] = useState(s.brandName);

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 200 * 1024) return toast.error(t("admin.logoTooBig"));
    if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(file.type)) return toast.error(t("common.errorTitle"));
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateSettings({ logoDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <div className="space-y-5 rounded-xl border border-border bg-surface p-4">
        <div className="space-y-1.5">
          <Label htmlFor="b-name">{t("admin.brandName")}</Label>
          <div className="flex gap-2">
            <Input id="b-name" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-2" />
            <Button
              variant="hero"
              onClick={() => {
                updateSettings({ brandName: name.trim().slice(0, 24) || DEFAULT_SETTINGS.brandName });
                toast.success(t("admin.settingsSaved"));
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-logo">{t("admin.logo")}</Label>
          <Input id="b-logo" type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={onLogo} className="bg-surface-2" />
          <p className="text-xs text-muted-foreground">{t("admin.logoHint")}</p>
          {s.logoDataUrl && (
            <Button variant="surface" size="sm" onClick={() => updateSettings({ logoDataUrl: null })}>
              {t("admin.removeLogo")}
            </Button>
          )}
        </div>
        <HueSlider label="admin.primaryColor" value={s.primaryHue} onChange={(v) => updateSettings({ primaryHue: v })} />
        <HueSlider label="admin.accentColor" value={s.accentHue} onChange={(v) => updateSettings({ accentHue: v })} />
        <Button
          variant="surface"
          onClick={() => {
            settingsStore.reset();
            setName(DEFAULT_SETTINGS.brandName);
            toast.success(t("admin.settingsSaved"));
          }}
        >
          <RotateCcw /> {t("admin.resetAll")}
        </Button>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold">{t("admin.preview")}</p>
        <div className="rounded-lg border border-border bg-background p-3">
          <BrandLogo />
        </div>
        <div className="flex gap-2">
          <Button variant="hero" size="sm">{t("nav.signIn")}</Button>
          <Button variant="gold" size="sm">{t("wallet.claim")}</Button>
        </div>
      </div>
    </div>
  );
}

function HueSlider({ label, value, onChange }: { label: DictKey; value: number; onChange: (v: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{t(label)}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{value}°</span>
      </div>
      <Slider dir="ltr" min={0} max={360} step={1} value={[value]} onValueChange={(v) => onChange(v[0] ?? value)} />
    </div>
  );
}

function move<T>(list: T[], i: number, delta: number): T[] {
  const j = i + delta;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  const a = next[i];
  const b = next[j];
  if (a === undefined || b === undefined) return list;
  next[i] = b;
  next[j] = a;
  return next;
}

function LinkSelect({ value, onChange }: { value: AppLink; onChange: (v: AppLink) => void }) {
  const { t, dir } = useI18n();
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AppLink)} dir={dir}>
      <SelectTrigger className="bg-surface-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APP_LINKS.map((l) => (
          <SelectItem key={l} value={l}>{t(LINK_LABEL[l])}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OrderButtons({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={onUp} aria-label={t("common.moveUp")}><ArrowUp /></Button>
      <Button variant="ghost" size="icon" onClick={onDown} aria-label={t("common.moveDown")}><ArrowDown /></Button>
    </div>
  );
}

function BannersTab() {
  const { t, lang } = useI18n();
  const { banners } = useSettings();
  const patch = (id: string, p: Partial<SiteSettings["banners"][number]>) =>
    updateSettings((s) => ({ banners: s.banners.map((b) => (b.id === id ? { ...b, ...p } : b)) }));
  return (
    <ul className="space-y-3">
      {banners.map((b, i) => (
        <li key={b.id} className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <img src={BANNER_IMAGES[b.image]} alt="" className={cn("aspect-video w-full rounded-lg object-cover", !b.enabled && "opacity-40")} />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={b.enabled} onCheckedChange={(on) => patch(b.id, { enabled: on })} /> {t("common.enabled")}
              </label>
              <OrderButtons
                onUp={() => updateSettings((s) => ({ banners: move(s.banners, i, -1) }))}
                onDown={() => updateSettings((s) => ({ banners: move(s.banners, i, 1) }))}
              />
            </div>
            <Input aria-label={t("admin.bannerTitle")} placeholder={t("admin.bannerTitle")} maxLength={60} value={b.title[lang]} onChange={(e) => patch(b.id, { title: { ...b.title, [lang]: e.target.value } })} className="bg-surface-2" />
            <Input aria-label={t("admin.bannerSubtitle")} placeholder={t("admin.bannerSubtitle")} maxLength={120} value={b.subtitle[lang]} onChange={(e) => patch(b.id, { subtitle: { ...b.subtitle, [lang]: e.target.value } })} className="bg-surface-2" />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("admin.bannerLink")}</Label>
              <LinkSelect value={b.to} onChange={(to) => patch(b.id, { to })} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CategoriesTab() {
  const { t, lang } = useI18n();
  const { categories } = useSettings();
  const patch = (id: string, p: Partial<SiteSettings["categories"][number]>) =>
    updateSettings((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  return (
    <ul className="space-y-2">
      {categories.map((c, i) => (
        <li key={c.id} className="grid items-center gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[auto_minmax(0,1fr)_12rem_auto]">
          <Switch checked={c.enabled} onCheckedChange={(on) => patch(c.id, { enabled: on })} aria-label={t("common.enabled")} />
          <Input aria-label={t("admin.categoryLabel")} maxLength={30} value={c.label[lang]} onChange={(e) => patch(c.id, { label: { ...c.label, [lang]: e.target.value } })} className="bg-surface-2" />
          <LinkSelect value={c.to} onChange={(to) => patch(c.id, { to })} />
          <OrderButtons
            onUp={() => updateSettings((s) => ({ categories: move(s.categories, i, -1) }))}
            onDown={() => updateSettings((s) => ({ categories: move(s.categories, i, 1) }))}
          />
        </li>
      ))}
    </ul>
  );
}

function TranslationsTab() {
  const { t, lang } = useI18n();
  const { translationOverrides } = useSettings();
  const [query, setQuery] = useState("");
  const keys = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICT_KEYS.filter((k) => !q || k.includes(q) || DICTIONARIES[lang][k].toLowerCase().includes(q)).slice(0, 60);
  }, [query, lang]);
  const setOverride = (key: DictKey, value: string) =>
    updateSettings((s) => ({
      translationOverrides: { ...s.translationOverrides, [lang]: { ...s.translationOverrides[lang], [key]: value.slice(0, 300) } },
    }));
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("admin.translationsHint")}</p>
      <Input placeholder={t("admin.searchKeys")} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm bg-surface" />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {keys.map((k) => (
          <li key={k} className="grid gap-1.5 p-3 md:grid-cols-[14rem_minmax(0,1fr)] md:items-center">
            <code dir="ltr" className="truncate text-[11px] text-muted-foreground">{k}</code>
            <Input
              aria-label={k}
              placeholder={DICTIONARIES[lang][k]}
              value={translationOverrides[lang]?.[k] ?? ""}
              onChange={(e) => setOverride(k, e.target.value)}
              className="bg-surface-2"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
