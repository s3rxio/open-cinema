"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { routes } from "@/shared/lib/routes";
import { Container } from "@/shared/ui/Container";
import { cn } from "@open-cinema/ui";

type MetaItem = { label: string; value: string };

type ContentDetailProps = {
  title: string;
  description: string;
  posterUrl?: string | null;
  releaseDate: string;
  meta: MetaItem[];
  watchHref: string;
  watchDisabled?: boolean;
  watchLabel?: string;
  sectionTitle?: string;
  children?: React.ReactNode;
};

const watchButtonClass =
  "inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function ContentDetail({
  title,
  description,
  posterUrl,
  releaseDate,
  meta,
  watchHref,
  watchDisabled,
  watchLabel = "Смотреть",
  sectionTitle = "Сезоны",
  children
}: ContentDetailProps) {
  return (
    <main className="space-y-8 py-8 max-md:space-y-6 max-md:py-4">
      <section>
        <Container>
          <Link
            href={routes.home}
            className="text-primary hover:underline inline-block"
          >
            ← Назад в каталог
          </Link>

          <div className="mt-8 grid gap-6 max-md:mt-4 max-md:gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-8">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет постера
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-bold max-md:text-2xl">{title}</h1>

              <p className="text-lg leading-relaxed text-muted-foreground max-md:text-base">
                {description}
              </p>

              {meta.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-sm max-md:gap-2">
                  {meta.map(item => (
                    <div key={item.label}>
                      <span className="font-semibold">{item.label}</span>
                      <p className="text-muted-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 pt-2 border-t border-border">
                <div>
                  <span className="font-semibold text-sm">Дата выпуска</span>
                  <p className="text-muted-foreground">{releaseDate}</p>
                </div>

                {watchDisabled ? (
                  <span
                    className={cn(
                      watchButtonClass,
                      "opacity-50 cursor-not-allowed"
                    )}
                    aria-disabled
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    {watchLabel}
                  </span>
                ) : (
                  <Link href={watchHref} className={watchButtonClass}>
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    {watchLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {children && (
        <section>
          <Container>
            <Card>
              <CardHeader>
                <CardTitle>{sectionTitle}</CardTitle>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </Container>
        </section>
      )}
    </main>
  );
}
