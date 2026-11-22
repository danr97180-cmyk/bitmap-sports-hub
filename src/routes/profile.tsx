import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ActivityList } from "@/components/common/ActivityList";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader, SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUser, useSession, type DemoUser } from "@/lib/demo-auth";
import { LANGS, setLang, useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — BITMAP" },
      { name: "description", content: "Manage your BITMAP personal details, preferred language and account history." },
      { property: "og:title", content: "Your profile — BITMAP" },
      { property: "og:description", content: "Personal details and account history on BITMAP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAccess permission="view_user_dashboard">{(u) => <Profile user={u} />}</RequireAccess>,
});

function Profile({ user }: { user: DemoUser }) {
  const { t, dir, lang, fmtDate } = useI18n();
  const { activity } = useSession();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    country: user.country ?? "",
    language: user.language ?? lang,
  });
  const [nameError, setNameError] = useState(false);

  const save = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim().slice(0, 80);
    if (!name) return setNameError(true);
    setNameError(false);
    updateUser(user.id, {
      name,
      phone: form.phone.trim().slice(0, 30),
      country: form.country.trim().toUpperCase().slice(0, 2),
      language: form.language,
    });
    setLang(form.language);
    toast.success(t("profile.updated"));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} subtitle={user.email} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-surface p-5" noValidate>
          <SectionHeader title={t("profile.details")} className="mb-1" />
          <div className="space-y-1.5">
            <Label htmlFor="p-name">{t("auth.name")}</Label>
            <Input id="p-name" value={form.name} maxLength={80} aria-invalid={nameError} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-surface-2" />
            {nameError && <p className="text-xs text-live">{t("auth.err.name")}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-phone">{t("profile.phone")}</Label>
              <Input id="p-phone" type="tel" dir="ltr" maxLength={30} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="bg-surface-2" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-country">{t("profile.country")}</Label>
              <Input id="p-country" dir="ltr" maxLength={2} value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="bg-surface-2 uppercase" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profile.prefLang")}</Label>
            <Select value={form.language} onValueChange={(v) => setForm((f) => ({ ...f, language: v as Lang }))} dir={dir}>
              <SelectTrigger className="bg-surface-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="hero">
            {t("common.save")}
          </Button>
        </form>

        <div className="space-y-6">
          <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface text-sm">
            <div className="flex justify-between gap-3 px-4 py-3">
              <dt className="text-muted-foreground">{t("profile.role")}</dt>
              <dd className="font-semibold text-primary">{t(`role.${user.role}`)}</dd>
            </div>
            <div className="flex justify-between gap-3 px-4 py-3">
              <dt className="text-muted-foreground">{t("profile.memberSince")}</dt>
              <dd className="font-semibold">{fmtDate(user.createdAt)}</dd>
            </div>
          </dl>
          <section>
            <SectionHeader title={t("profile.history")} />
            <ActivityList items={activity.filter((a) => a.userId === user.id)} limit={15} />
          </section>
        </div>
      </div>
    </div>
  );
}
