"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import type { ContentItem } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";
import { cn } from "@open-cinema/ui";
import { SLIDE_THEME } from "../lib/slideThemes";

type HeroCarouselProps = {
  items: ContentItem[];
};

export function HeroCarousel({ items }: HeroCarouselProps) {
  const slides = items.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const theme = SLIDE_THEME;
  const patternClass =
    theme.pattern === "classic"
      ? "hero-slide-pattern-classic"
      : theme.pattern === "tech"
        ? "hero-slide-pattern-tech"
        : "hero-slide-pattern-fantasy";

  return (
    <div className="relative mb-0 overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--home-content)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] [transform:translateZ(0)]">
      <div className="relative h-[500px] max-md:h-auto max-md:min-h-[540px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const watchHref =
            slide.type === "MOVIE"
              ? routes.watchMovie(slide.id)
              : routes.watchSeries(slide.id);
          const typeLabel = slide.type === "MOVIE" ? "Фильм" : "Сериал";

          return (
            <div
              key={slide.id}
              className={cn(
                "hero-slide-pattern absolute inset-0 flex items-center justify-between overflow-hidden px-[10%] z-0 opacity-0 pointer-events-none transition-[opacity,transform] duration-700 ease-out-expo scale-[1.015] motion-reduce:transition-none motion-reduce:transform-none max-md:flex-col max-md:justify-center max-md:text-center max-md:min-h-[540px] max-md:px-6 max-md:pt-[60px] max-md:pb-20",
                patternClass,
                isActive && "opacity-100 z-[1] pointer-events-auto scale-100"
              )}
              style={
                {
                  "--slide-color": theme.color,
                  "--shadow-color": theme.shadowColor
                } as React.CSSProperties
              }
              aria-hidden={!isActive}
            >
              {slide.bannerUrl ? (
                <img
                  src={slide.bannerUrl}
                  alt=""
                  className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ) : null}

              <div
                className="pointer-events-none absolute right-[-5%] top-1/2 z-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full opacity-25 blur-[130px] transition-all duration-1000 ease-in-out max-md:left-1/2 max-md:right-auto max-md:h-80 max-md:w-80 max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:opacity-35 max-md:blur-[80px]"
                style={{ background: theme.color }}
                aria-hidden
              />

              <div className="z-10 flex max-w-[580px] flex-col max-md:max-w-full max-md:items-center">
                <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Star size={16} fill="#faad14" stroke="#faad14" />
                  <span>{slide.rating.toFixed(1)}</span>
                  <span>·</span>
                  <span>{typeLabel}</span>
                </div>
                <h3 className="m-0 mb-4 text-[clamp(32px,4.5vw,52px)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
                  {slide.title}
                </h3>
                <p className="m-0 mb-10 max-w-[90%] line-clamp-3 text-[clamp(16px,2vw,19px)] font-normal leading-[1.45] tracking-[-0.01em] text-muted-foreground max-md:max-w-full">
                  {slide.description}
                </p>
                <Link
                  href={watchHref}
                  className="inline-flex h-[58px] items-center justify-center gap-2 rounded-[18px] border-0 px-9 text-base font-semibold text-white no-underline transition-all duration-[400ms] ease-out-expo [transform:translateZ(0)] hover:-translate-y-0.5 hover:scale-[1.03] hover:opacity-95 active:scale-[0.98] active:translate-y-0 max-md:h-[54px] max-md:w-full"
                  style={{
                    background: "var(--slide-color)",
                    boxShadow: "0 16px 32px -8px var(--shadow-color)"
                  }}
                  tabIndex={isActive ? undefined : -1}
                >
                  Смотреть
                  <ArrowRight size={18} />
                </Link>
              </div>

              {slide.posterUrl ? (
                <img
                  src={slide.posterUrl}
                  alt=""
                  className="absolute right-[8%] top-1/2 z-[2] aspect-[2/3] w-[220px] -translate-y-1/2 rounded-2xl object-cover shadow-[0_24px_48px_rgba(0,0,0,0.35)] max-md:relative max-md:right-auto max-md:top-auto max-md:mt-6 max-md:w-40 max-md:translate-none"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {slides.length > 1 ? (
        <ul className="absolute bottom-[35px] left-[10%] z-20 m-0 flex list-none items-center gap-2 p-0 max-md:bottom-[25px] max-md:left-1/2 max-md:-translate-x-1/2">
          {slides.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "h-[5px] w-[5px] cursor-pointer rounded-[10px] border-0 bg-foreground p-0 opacity-15 transition-all duration-400 ease-out-expo",
                  index === activeIndex && "w-8 opacity-80"
                )}
                aria-label={`Слайд ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
