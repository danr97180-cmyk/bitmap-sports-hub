import { useCallback, useEffect } from "react";
import { createPersistedStore, useStore } from "../persisted-store";
import { useSettings } from "../settings";
import { DEFAULT_LANG, DICTIONARIES, LANGS, type DictKey, type Lang, type LocalizedText } from "./dictionaries";

export * from "./dictionaries";

export const langStore = createPersistedStore<{ lang: Lang }>("bitmap.lang.v1", { lang: DEFAULT_LANG });

export function setLang(lang: Lang) {
  langStore.set({ lang });
}

export function dirFor(lang: Lang) {
  return LANGS.find((l) => l.code === lang)?.dir ?? "rtl";
}

const LOCALE: Record<Lang, string> = { ar: "ar-EG", he: "he-IL", en: "en-GB" };

export function useI18n() {
  const { lang } = useStore(langStore);
  const { translationOverrides } = useSettings();
  const dir = dirFor(lang);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      let s = translationOverrides[lang]?.[key] || DICTIONARIES[lang][key] || DICTIONARIES.en[key] || key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang, translationOverrides],
  );

  const loc = useCallback((text: LocalizedText) => text[lang] || text.en, [lang]);

  const fmtNumber = useCallback((n: number) => new Intl.NumberFormat(LOCALE[lang]).format(n), [lang]);
  const fmtDate = useCallback(
    (d: Date | string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
      new Intl.DateTimeFormat(LOCALE[lang], opts).format(typeof d === "string" ? new Date(d) : d),
    [lang],
  );
  const fmtTime = useCallback(
    (d: Date | string) =>
      new Intl.DateTimeFormat(LOCALE[lang], { hour: "2-digit", minute: "2-digit", hour12: false }).format(
        typeof d === "string" ? new Date(d) : d,
      ),
    [lang],
  );

  return { lang, dir, t, loc, setLang, fmtNumber, fmtDate, fmtTime };
}

/** Keeps <html lang/dir> in sync after hydration (SSR renders the default). */
export function HtmlLangSync() {
  const { lang, dir } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  return null;
}
