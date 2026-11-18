import type { CSSProperties } from "react";
import { getTeam } from "@/lib/sports/catalog";
import { cn } from "@/lib/utils";

export function TeamBadge({ teamId, size = "md" }: { teamId: string; size?: "sm" | "md" | "lg" }) {
  const team = getTeam(teamId);
  const sizes = { sm: "h-6 w-6 text-[8px]", md: "h-8 w-8 text-[9px]", lg: "h-14 w-14 text-sm" };
  return (
    <span
      dir="ltr"
      style={{ "--team-h": team?.color ?? "140" } as CSSProperties}
      className={cn("team-badge grid shrink-0 place-items-center rounded-full font-bold tracking-tight", sizes[size])}
      aria-hidden="true"
    >
      {team?.short ?? "?"}
    </span>
  );
}
