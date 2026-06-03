"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";
import { ContentCard } from "@/shared/ui/ContentCard";
import styles from "./HomePage.module.css";

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
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {titleIcon ? <span className={styles.titleIcon}>{titleIcon}</span> : null}
          {title}
        </h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className={styles.viewAllBtn}>
            <span>{viewAllLabel}</span>
            <ArrowUpRight className={styles.viewAllIcon} aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className={styles.viewportWrapper}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnPrev}`}
          disabled={!canPrev}
          aria-label="Назад"
          onClick={() => scroll(-1)}
        >
          <ChevronLeft size={20} />
        </button>

        <div ref={trackRef} className={styles.track}>
          <div className={styles.trackInner}>
            {items.map(item => (
              <div key={item.id} className={styles.slideItem}>
                <ContentCard {...item} />
              </div>
            ))}
            {showCatalogLink ? (
              <div className={styles.slideItem}>
                <Link href={catalogHref} className={styles.catalogLink}>
                  <div className={styles.catalogCard}>
                    <ArrowRight className={styles.catalogIcon} size={20} />
                    <span>В каталог</span>
                  </div>
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnNext}`}
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
