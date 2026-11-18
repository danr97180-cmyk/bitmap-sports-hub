import { createPersistedStore, useStore } from "./persisted-store";
import type { DictKey, Lang, LocalizedText } from "./i18n/dictionaries";

export type BannerImage = "stadium" | "arcade" | "rewards";
export type AppLink = "/" | "/scores" | "/standings" | "/games" | "/wallet" | "/auth";
export const APP_LINKS: AppLink[] = ["/", "/scores", "/standings", "/games", "/wallet", "/auth"];

export interface Banner {
  id: string;
  image: BannerImage;
  title: LocalizedText;
  subtitle: LocalizedText;
  to: AppLink;
  enabled: boolean;
}

export type CategoryIcon = "football" | "trophy" | "table" | "gamepad" | "puzzle" | "brain" | "gift" | "zap";

export interface Category {
  id: string;
  icon: CategoryIcon;
  label: LocalizedText;
  to: AppLink;
  enabled: boolean;
}

export interface SiteSettings {
  brandName: string;
  logoDataUrl: string | null;
  primaryHue: number;
  accentHue: number;
  banners: Banner[];
  categories: Category[];
  translationOverrides: Record<Lang, Partial<Record<DictKey, string>>>;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "BITMAP",
  logoDataUrl: null,
  primaryHue: 130,
  accentHue: 80,
  banners: [
    {
      id: "b_live",
      image: "stadium",
      to: "/scores",
      enabled: true,
      title: { en: "Every goal, live", ar: "كل هدف، مباشرة", he: "כל שער, בשידור חי" },
      subtitle: {
        en: "Scores, events and tables from the top leagues.",
        ar: "نتائج وأحداث وجداول أقوى الدوريات.",
        he: "תוצאות, אירועים וטבלאות מהליגות המובילות.",
      },
    },
    {
      id: "b_games",
      image: "arcade",
      to: "/games",
      enabled: true,
      title: { en: "Play. No stakes.", ar: "العب. بلا رهانات.", he: "משחקים. בלי סיכון." },
      subtitle: {
        en: "Original pixel mini-games, free forever.",
        ar: "ألعاب بكسل مصغّرة وأصلية، مجانية دائمًا.",
        he: "מיני-משחקי פיקסל מקוריים, בחינם תמיד.",
      },
    },
    {
      id: "b_points",
      image: "rewards",
      to: "/wallet",
      enabled: true,
      title: { en: "Daily virtual points", ar: "نقاط افتراضية يومية", he: "נקודות וירטואליות יומיות" },
      subtitle: {
        en: "Claim your bonus and track every transaction.",
        ar: "احصل على مكافأتك وتابع كل معاملة.",
        he: "קבלו בונוס ועקבו אחרי כל תנועה.",
      },
    },
  ],
  categories: [
    { id: "c_live", icon: "football", to: "/scores", enabled: true, label: { en: "Live scores", ar: "مباشر", he: "תוצאות חיות" } },
    { id: "c_tables", icon: "table", to: "/standings", enabled: true, label: { en: "Tables", ar: "الترتيب", he: "טבלאות" } },
    { id: "c_games", icon: "gamepad", to: "/games", enabled: true, label: { en: "Arcade", ar: "أركيد", he: "ארקייד" } },
    { id: "c_trivia", icon: "brain", to: "/games", enabled: true, label: { en: "Trivia", ar: "معلومات", he: "טריוויה" } },
    { id: "c_puzzle", icon: "puzzle", to: "/games", enabled: true, label: { en: "Puzzles", ar: "ألغاز", he: "פאזלים" } },
    { id: "c_points", icon: "gift", to: "/wallet", enabled: true, label: { en: "Daily bonus", ar: "مكافأة يومية", he: "בונוס יומי" } },
  ],
  translationOverrides: { en: {}, ar: {}, he: {} },
};

export const settingsStore = createPersistedStore<SiteSettings>("bitmap.settings.v1", DEFAULT_SETTINGS);

export function useSettings() {
  return useStore(settingsStore);
}

export function updateSettings(patch: Partial<SiteSettings> | ((s: SiteSettings) => Partial<SiteSettings>)) {
  settingsStore.set((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
}
