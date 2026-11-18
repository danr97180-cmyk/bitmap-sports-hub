import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import stadium from "@/assets/banner-stadium.jpg";
import arcade from "@/assets/banner-arcade.jpg";
import rewards from "@/assets/banner-rewards.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSettings, type BannerImage } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const BANNER_IMAGES: Record<BannerImage, string> = { stadium, arcade, rewards };

export function BannerCarousel() {
  const { banners } = useSettings();
  const { loc, dir, t } = useI18n();
  const visible = banners.filter((b) => b.enabled);
  const [ref, api] = useEmblaCarousel({ loop: true, direction: dir });
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => api && setIndex(api.selectedScrollSnap()), [api]);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    const id = window.setInterval(() => api.scrollNext(), 6000);
    return () => {
      api.off("select", onSelect);
      window.clearInterval(id);
    };
  }, [api, onSelect]);

  useEffect(() => {
    api?.reInit({ direction: dir, loop: true });
  }, [api, dir, visible.length]);

  if (!visible.length) return null;

  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border shadow-card" aria-roledescription="carousel">
      <div ref={ref} className="overflow-hidden">
        <div className="flex">
          {visible.map((b, i) => (
            <div key={b.id} className="relative min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={BANNER_IMAGES[b.image]}
                alt=""
                width={1600}
                height={640}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-[16/9] w-full object-cover sm:aspect-[5/2]"
              />
              <div className="bg-banner-scrim absolute inset-0" />
              <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4 sm:justify-center sm:p-8">
                <h2 className="max-w-[16ch] text-2xl font-extrabold leading-tight sm:text-4xl">{loc(b.title)}</h2>
                <p className="max-w-sm text-sm text-foreground/80 sm:text-base">{loc(b.subtitle)}</p>
                <Button asChild variant="hero" size="sm" className="mt-1 w-fit">
                  <Link to={b.to}>{t("common.viewAll")}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {visible.length > 1 && (
        <>
          <button onClick={() => api?.scrollPrev()} className="absolute start-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-overlay p-1.5 text-foreground/80 hover:text-primary sm:block" aria-label="Previous">
            <Prev className="h-5 w-5" />
          </button>
          <button onClick={() => api?.scrollNext()} className="absolute end-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-overlay p-1.5 text-foreground/80 hover:text-primary sm:block" aria-label="Next">
            <Next className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 end-4 flex gap-1.5">
            {visible.map((b, i) => (
              <button
                key={b.id}
                onClick={() => api?.scrollTo(i)}
                aria-label={`${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/40")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
