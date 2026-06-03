"use client";

import { useQuery } from "@apollo/client/react";
import { Card, CardContent, Loader } from "@open-cinema/ui";
import { ContentCard, CONTENT_CARD_GRID_CLASS } from "@/shared/ui/ContentCard";
import { ME_QUERY } from "@/shared/api/operations/favorites";
import type { ContentItem, ContentType } from "@/shared/api/operation-types";
import { useAuth } from "@/shared/auth/AuthContext";
import Link from "next/link";

function favoriteToContentItem(fav: {
  id: string;
  movie: {
    id: string;
    title: string;
    description: string;
    rating: number;
    posterUrl?: string | null;
    releaseDate: string;
  } | null;
  series: {
    id: string;
    title: string;
    description: string;
    rating: number;
    posterUrl?: string | null;
    releaseDate: string;
  } | null;
}): ContentItem | null {
  if (fav.movie) {
    return {
      ...fav.movie,
      type: "MOVIE" as ContentType,
      genres: []
    };
  }
  if (fav.series) {
    return {
      ...fav.series,
      type: "SERIES" as ContentType,
      genres: []
    };
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
      .filter((item): item is ContentItem => !!item) ?? [];

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
    <div className={CONTENT_CARD_GRID_CLASS}>
      {items.map(item => (
        <ContentCard key={item.id} {...item} fluid />
      ))}
    </div>
  );
}
