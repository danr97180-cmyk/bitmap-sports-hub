import { Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** Original BITMAP mark: a 3×3 pixel grid with a lit diagonal. */
export function PixelMark({ className }: { className?: string }) {
  const lit = new Set([0, 4, 8, 2, 5]);
  return (
    <svg viewBox="0 0 30 30" className={cn("h-7 w-7", className)} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x={(i % 3) * 10 + 1}
          y={Math.floor(i / 3) * 10 + 1}
          width="8"
          height="8"
          rx="1.5"
          className={lit.has(i) ? (i === 4 ? "fill-gold" : "fill-primary") : "fill-surface-3"}
        />
      ))}
    </svg>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  const { brandName, logoDataUrl } = useSettings();
  return (
    <Link to="/" className={cn("flex min-w-0 items-center gap-2", className)} aria-label={brandName}>
      {logoDataUrl ? (
        <img src={logoDataUrl} alt={brandName} className="h-8 w-auto max-w-36 object-contain" />
      ) : (
        <>
          <PixelMark className="shrink-0" />
          <span dir="ltr" className="truncate font-pixel text-lg leading-none tracking-wider text-foreground">
            {brandName}
          </span>
        </>
      )}
    </Link>
  );
}
