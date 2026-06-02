"use client";

import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardHeader, CardTitle, Loader } from "@open-cinema/ui";
import { ContentCard } from "@/features/catalog/ui/ContentCard";
import { QUERIES } from "@/shared/api/queries";

export function FavoritesList() {
  const { data, loading, error } = useQuery<any>(QUERIES.me);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Ошибка загрузки избранного
          </p>
        </CardContent>
      </Card>
    );
  }

  const favorites = data?.me?.favorites || [];

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            У вас ещё нет избранного. Добавьте фильм или сериал!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {favorites.map((fav: any) => {
        const content = fav.content;
        return (
          <ContentCard
            key={content.id}
            id={content.id}
            title={content.title}
            description={content.description}
            rating={content.rating}
            type={content.type}
            posterUrl={content.posterUrl}
          />
        );
      })}
    </div>
  );
}
