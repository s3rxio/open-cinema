"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";
import { cn } from "@open-cinema/ui";
import { ContentCard } from "@/shared/ui/ContentCard";

type ContentRowProps = {
  title: string;
  titleIcon?: React.ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: ContentItem[];
  showCatalogLink?: boolean;
  catalogHref?: string;
};

export function ContentRow({
  title,
  titleIcon,
  viewAllHref,
  viewAllLabel = "Смотреть все",
  items,
  showCatalogLink = false,
  catalogHref = routes.catalog
}: ContentRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [items, updateScrollState]);

  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * 284,
      behavior: "smooth"
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="group relative mb-0">
      <div className="mb-6 flex items-center justify-between px-1 max-md:mb-4">
        <h2 className="m-0 flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.3px] text-foreground">
          {titleIcon ? (
            <span className="inline-flex shrink-0 text-[#ff9f0a]">
              {titleIcon}
            </span>
          ) : null}
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="group/link inline-flex items-center gap-1.5 rounded-[calc(var(--radius)-2px)] border border-primary/45 px-3.5 py-2 text-sm font-semibold text-primary no-underline transition-[color,background-color,border-color] duration-200 ease-in-out hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <span>{viewAllLabel}</span>
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-250 ease-out-expo group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        ) : null}
      </div>

      <div className="relative flex items-center">
        <button
          type="button"
          className={cn(
            "invisible absolute top-1/2 z-30 flex h-[46px] w-[46px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--home-content)] text-foreground opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-[filter:var(--home-blur)] transition-all duration-250 ease-out-expo enabled:visible group-hover:opacity-100 group-hover:enabled:border-white/15 hover:enabled:scale-105 hover:enabled:border-foreground hover:enabled:bg-foreground hover:enabled:text-background disabled:pointer-events-none disabled:!opacity-0 max-md:hidden",
            "-left-[23px]"
          )}
          disabled={!canPrev}
          aria-label="Назад"
          onClick={() => scroll(-1)}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={trackRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth py-2 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-md:py-1"
        >
          <div className="flex w-max">
            {items.map(item => (
              <div
                key={item.id}
                className="mr-6 shrink-0 basis-[260px] max-md:mr-3 max-md:basis-[185px]"
              >
                <ContentCard {...item} />
              </div>
            ))}
            {showCatalogLink ? (
              <div className="mr-6 shrink-0 basis-[260px] max-md:mr-3 max-md:basis-[185px]">
                <Link href={catalogHref} className="block h-full no-underline">
                  <div className="group/catalog flex h-full min-h-[380px] w-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-[var(--glass-border)] bg-white/[0.02] text-muted-foreground transition-all duration-300 ease-out-expo hover:border-white/40 hover:bg-white/[0.06] hover:text-foreground max-md:min-h-[290px] max-md:w-[185px]">
                    <ArrowRight
                      className="text-xl transition-transform duration-300 ease-out-expo group-hover/catalog:translate-x-1.5"
                      size={20}
                    />
                    <span className="text-[15px] font-medium tracking-[-0.1px]">
                      В каталог
                    </span>
                  </div>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={cn(
            "invisible absolute top-1/2 z-30 flex h-[46px] w-[46px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--home-content)] text-foreground opacity-0 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-[filter:var(--home-blur)] transition-all duration-250 ease-out-expo enabled:visible group-hover:opacity-100 group-hover:enabled:border-white/15 hover:enabled:scale-105 hover:enabled:border-foreground hover:enabled:bg-foreground hover:enabled:text-background disabled:pointer-events-none disabled:!opacity-0 max-md:hidden",
            "-right-[23px]"
          )}
          disabled={!canNext}
          aria-label="Вперёд"
          onClick={() => scroll(1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
