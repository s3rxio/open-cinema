"use client";

import { useQuery } from "@apollo/client/react";
import { Card, CardContent, Loader } from "@open-cinema/ui";
import { ContentCard } from "@/features/catalog/ui/ContentCard";
import { ME_QUERY } from "@/shared/api/operations/favorites";
import type { ContentItem, ContentType } from "@/shared/api/operation-types";
import { useAuth } from "@/shared/auth/AuthContext";
import Link from "next/link";

function favoriteToContentItem(fav: {
  id: string;
  movie: Omit<ContentItem, "type"> | null;
  series: Omit<ContentItem, "type"> | null;
}): (ContentItem & { favoriteId: string }) | null {
  if (fav.movie) {
    return { ...fav.movie, type: "MOVIE" as ContentType, favoriteId: fav.id };
  }
  if (fav.series) {
    return { ...fav.series, type: "SERIES" as ContentType, favoriteId: fav.id };
  }
  return null;
}

export function FavoritesList() {
  const { isAuthenticated } = useAuth();
  const meQuery = useQuery(ME_QUERY, { skip: !isAuthenticated });

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Войдите
            </Link>
            , чтобы сохранять закладки
          </p>
        </CardContent>
      </Card>
    );
  }

  if (meQuery.loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (meQuery.error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Ошибка загрузки закладок
          </p>
        </CardContent>
      </Card>
    );
  }

  const items =
    meQuery.data?.me?.favorites
      ?.map(favoriteToContentItem)
      .filter((item): item is ContentItem & { favoriteId: string } => !!item) ||
    [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Пока нет закладок. Нажмите на иконку закладки на карточке фильма или
            сериала.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <ContentCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          rating={item.rating}
          type={item.type}
          posterUrl={item.posterUrl ?? undefined}
        />
      ))}
    </div>
  );
}
