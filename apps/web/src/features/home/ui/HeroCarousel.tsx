"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import type { ContentItem } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";
import { SLIDE_THEME } from "../lib/slideThemes";
import styles from "./HomePage.module.css";

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

  const slide = slides[activeIndex];
  const theme = SLIDE_THEME;
  const patternClass =
    theme.pattern === "classic"
      ? styles.slideClassic
      : theme.pattern === "tech"
        ? styles.slideTech
        : styles.slideFantasy;

  const watchHref =
    slide.type === "MOVIE" ? routes.watchMovie(slide.id) : routes.watchSeries(slide.id);
  const typeLabel = slide.type === "MOVIE" ? "Фильм" : "Сериал";

  return (
    <div className={styles.carouselWrapper}>
      <div
        className={`${styles.slide} ${patternClass}`}
        style={
          {
            "--slide-color": theme.color,
            "--shadow-color": theme.shadowColor
          } as React.CSSProperties
        }
      >
        {slide.bannerUrl ? (
          <img
            src={slide.bannerUrl}
            alt=""
            className={styles.slideBanner}
            loading="eager"
          />
        ) : null}

        <div
          className={styles.imageOverlay}
          style={{ background: theme.color }}
          aria-hidden
        />

        <div className={styles.slideContent}>
          <div className={styles.slideMeta}>
            <Star size={16} fill="#faad14" stroke="#faad14" />
            <span>{slide.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{typeLabel}</span>
          </div>
          <h3>{slide.title}</h3>
          <p>{slide.description}</p>
          <Link href={watchHref} className={styles.watchBtn}>
            Смотреть
            <ArrowRight size={18} />
          </Link>
        </div>

        {slide.posterUrl ? (
          <img
            src={slide.posterUrl}
            alt=""
            className={styles.slidePoster}
            loading="eager"
          />
        ) : null}
      </div>

      {slides.length > 1 ? (
        <ul className={styles.dots}>
          {slides.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
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
