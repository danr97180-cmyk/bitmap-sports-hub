import { Link } from "@tanstack/react-router";
import { Brain, CircleDot, Gamepad2, Gift, Puzzle, Table2, Trophy, Zap, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings, type CategoryIcon } from "@/lib/settings";

export const CATEGORY_ICONS: Record<CategoryIcon, LucideIcon> = {
  football: CircleDot,
  trophy: Trophy,
  table: Table2,
  gamepad: Gamepad2,
  puzzle: Puzzle,
  brain: Brain,
  gift: Gift,
  zap: Zap,
};

export function CategoryGrid() {
  const { categories } = useSettings();
  const { loc } = useI18n();
  const visible = categories.filter((c) => c.enabled);
  return (
    <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0">
      {visible.map((c) => {
        const Icon = CATEGORY_ICONS[c.icon];
        return (
          <Link
            key={c.id}
            to={c.to}
            className="group flex w-[5.5rem] shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-surface-gradient px-2 py-3 text-center transition-all hover:border-primary/50 hover:shadow-glow sm:w-auto"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </span>
            <span className="line-clamp-2 text-xs font-semibold">{loc(c.label)}</span>
          </Link>
        );
      })}
    </div>
  );
}
