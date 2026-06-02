"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { routes } from "@/shared/lib/routes";
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
  children?: React.ReactNode;
};

const watchButtonClass =
  "inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function ContentDetail({
  title,
  description,
  posterUrl,
  releaseDate,
  meta,
  watchHref,
  watchDisabled,
  watchLabel = "Смотреть",
  children
}: ContentDetailProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link href={routes.home} className="text-primary hover:underline inline-block">
        ← Назад в каталог
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
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
          <h1 className="text-3xl font-bold">{title}</h1>

          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>

          {meta.length > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                className={cn(watchButtonClass, "opacity-50 cursor-not-allowed")}
                aria-disabled
              >
                {watchLabel}
              </span>
            ) : (
              <Link href={watchHref} className={watchButtonClass}>
                {watchLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {children && (
        <Card>
          <CardHeader>
            <CardTitle>Эпизоды</CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      )}
    </main>
  );
}
