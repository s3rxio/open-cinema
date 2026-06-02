"use client";

import { Loader } from "@open-cinema/ui";
import { Button } from "@open-cinema/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { Input } from "@open-cinema/ui";
import { Label } from "@open-cinema/ui";
import { Textarea } from "@open-cinema/ui";
import type { ContentType } from "@/shared/api/operation-types";
import { useReviews } from "@/features/reviews/lib/useReviews";
import { useEffect, useState } from "react";

type ReviewsSectionProps = {
  contentId: string;
  type: ContentType;
};

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function ReviewsSection({ contentId, type }: ReviewsSectionProps) {
  const {
    reviews,
    myReview,
    loading,
    submitting,
    removing,
    formError,
    submitReview,
    deleteMyReview,
    isAuthenticated
  } = useReviews({ contentId, type });

  const [content, setContent] = useState("");
  const [rating, setRating] = useState("8");

  useEffect(() => {
    if (myReview) {
      setContent(myReview.content);
      setRating(String(myReview.rating));
    }
  }, [myReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(rating);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 10) {
      return;
    }
    await submitReview(content, parsed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рецензии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {myReview
                ? "Вы уже оставили рецензию — можно изменить или удалить её."
                : "Поделитесь мнением и поставьте оценку от 0 до 10."}
            </p>
            <div className="space-y-2">
              <Label htmlFor="review-rating">Ваша оценка</Label>
              <Input
                id="review-rating"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="max-w-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-content">Текст рецензии</Label>
              <Textarea
                id="review-content"
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Что понравилось или не понравилось?"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Сохранение…"
                  : myReview
                    ? "Обновить рецензию"
                    : "Опубликовать"}
              </Button>
              {myReview && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={removing}
                  onClick={() => void deleteMyReview()}
                >
                  {removing ? "Удаление…" : "Удалить"}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Войдите в аккаунт, чтобы оставить рецензию и оценку.
          </p>
        )}

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="font-semibold">
            Все рецензии ({reviews.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока нет рецензий — будьте первым.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map(review => (
                <li
                  key={review.id}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {review.user?.username ?? "Пользователь"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatReviewDate(review.createdAt)} · ⭐{" "}
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {review.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
