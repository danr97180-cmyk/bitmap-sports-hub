import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";
import { PixelMark } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEED_USERS, signIn, signUp, type AuthError } from "@/lib/demo-auth";
import { useI18n, type DictKey } from "@/lib/i18n";
import { homeForRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface AuthSearch {
  mode?: "register";
  redirect?: string;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const out: AuthSearch = {};
    if (search["mode"] === "register") out.mode = "register";
    // Only same-site paths, never an external URL.
    const r = search["redirect"];
    if (typeof r === "string" && r.startsWith("/") && !r.startsWith("//")) out.redirect = r;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Sign in or register — BITMAP" },
      { name: "description", content: "Sign in to BITMAP or create a free account to collect virtual points." },
      { property: "og:title", content: "Sign in or register — BITMAP" },
      { property: "og:description", content: "Create a free BITMAP account. Virtual points only, no real money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const isRegister = mode === "register";
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "form", DictKey>>>({});

  const finish = (user: { name: string; role: Parameters<typeof homeForRole>[0] }) => {
    toast.success(t("auth.welcome", { name: user.name }));
    if (redirect) navigate({ href: redirect, replace: true });
    else navigate({ to: homeForRole(user.role), replace: true });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (isRegister && !form.name.trim()) next.name = "auth.err.name";
    if (!emailSchema.safeParse(form.email).success) next.email = "auth.err.email";
    if (form.password.length < 8) next.password = "auth.err.password";
    if (isRegister && form.password !== form.confirm) next.confirm = "auth.err.match";
    setErrors(next);
    if (Object.keys(next).length) return;

    const res = isRegister ? signUp({ name: form.name.slice(0, 80), email: form.email }) : signIn(form.email);
    if (res.error) return setErrors({ form: `auth.err.${res.error satisfies AuthError}` });
    if (res.user) finish(res.user);
  };

  const quick = (email: string) => {
    const res = signIn(email);
    if (res.error) return setErrors({ form: `auth.err.${res.error}` });
    if (res.user) finish(res.user);
  };

  const field = (key: keyof typeof form, label: DictKey, type = "text", autoComplete?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`auth-${key}`}>{t(label)}</Label>
      <Input
        id={`auth-${key}`}
        type={type}
        dir={type === "email" ? "ltr" : dir}
        autoComplete={autoComplete}
        value={form[key]}
        maxLength={key === "name" ? 80 : 255}
        aria-invalid={!!errors[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-11 bg-surface-2"
      />
      {errors[key] && <p className="text-xs text-live">{t(errors[key])}</p>}
    </div>
  );

  return (
    <div className="mx-auto grid max-w-md gap-5 py-4">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <PixelMark className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-extrabold">{t(isRegister ? "auth.registerTitle" : "auth.signInTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("auth.subtitle")}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg border border-border bg-surface-2 p-1">
          {(["signin", "register"] as const).map((m) => {
            const active = (m === "register") === isRegister;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setErrors({});
                  navigate({ to: "/auth", search: m === "register" ? { mode: "register", ...(redirect ? { redirect } : {}) } : redirect ? { redirect } : {}, replace: true });
                }}
                className={cn("rounded-md py-2 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {t(m === "register" ? "nav.register" : "nav.signIn")}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {isRegister && field("name", "auth.name", "text", "name")}
          {field("email", "auth.email", "email", "email")}
          {field("password", "auth.password", "password", isRegister ? "new-password" : "current-password")}
          {isRegister && field("confirm", "auth.confirm", "password", "new-password")}
          {errors.form && (
            <p role="alert" className="rounded-lg border border-live/40 bg-live/10 p-2.5 text-sm text-live">
              {t(errors.form)}
            </p>
          )}
          <Button type="submit" variant="hero" size="xl" className="w-full">
            {isRegister ? <UserPlus /> : <LogIn />}
            {t(isRegister ? "auth.submitRegister" : "auth.submitSignIn")}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold">{t("auth.quick")}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {SEED_USERS.filter((u) => ["u_admin", "u_agent", "u_user"].includes(u.id)).map((u) => (
            <Button key={u.id} variant="surface" className="h-auto flex-col items-start gap-0.5 py-2.5" onClick={() => quick(u.email)}>
              <span className="text-xs font-bold text-primary">{t(`role.${u.role}`)}</span>
              <span className="w-full truncate text-start text-[11px] font-normal text-muted-foreground" dir="ltr">
                {u.email}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
