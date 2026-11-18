import { useEffect } from "react";
import { useSettings } from "@/lib/settings";

/** Applies admin-chosen brand hues to the design tokens. */
export function ThemeSync() {
  const { primaryHue, accentHue } = useSettings();
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--primary-h", String(primaryHue));
    root.setProperty("--gold-h", String(accentHue));
  }, [primaryHue, accentHue]);
  return null;
}
