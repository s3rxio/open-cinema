"use client";

import { Loader } from "@open-cinema/ui";
import { Button } from "@open-cinema/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@open-cinema/ui";
import { Label } from "@open-cinema/ui";
import { Textarea } from "@open-cinema/ui";
import { cn } from "@open-cinema/ui";
import type { ContentType } from "@/shared/api/operation-types";
import { useReviews } from "@/features/reviews/lib/useReviews";
import { StarRating } from "@/features/reviews/ui/StarRating";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type ReviewsSectionProps = {
  contentId: string;
  type: ContentType;
};

type ReviewListItem = {
  id: string;
  content: string;
  rating: number;
  userId: string;
  createdAt: string;
  user?: { id: string; username?: string | null } | null;
};

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

type ReviewFormProps = {
  initialContent?: string;
  initialRating?: number;
  submitting: boolean;
  onSubmit: (content: string, rating: number) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel: string;
};

function ReviewForm({
  initialContent = "",
  initialRating = 8,
  submitting,
  onSubmit,
  onCancel,
  submitLabel
}: ReviewFormProps) {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setContent(initialContent);
    setRating(initialRating);
  }, [initialContent, initialRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(content, rating);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label>Ваша оценка</Label>
        <StarRating value={rating} onChange={setRating} />
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
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Сохранение…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

type ReviewItemProps = {
  review: ReviewListItem;
  isOwn: boolean;
  isAdmin: boolean;
  submitting: boolean;
  removing: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (content: string, rating: number) => Promise<boolean>;
  onDelete: () => void;
};

function ReviewItem({
  review,
  isOwn,
  isAdmin,
  submitting,
  removing,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete
}: ReviewItemProps) {
  const canDelete = isOwn || isAdmin;
  const showAdminDelete = isAdmin && !isOwn;

  return (
    <li
      className={cn(
        "rounded-lg border p-4 space-y-3",
        isOwn ? "border-primary/40 bg-primary/5" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">
              {review.user?.username ?? "Пользователь"}
            </span>
            {isOwn && (
              <span className="text-xs rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                Ваша рецензия
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StarRating value={review.rating} readOnly size="sm" />
            <span>{formatReviewDate(review.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isOwn && !isEditing && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Редактировать рецензию"
              onClick={onStartEdit}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && !isEditing && (
            <Button
              type="button"
              variant="destructiveOutline"
              size="icon"
              aria-label={
                showAdminDelete
                  ? "Удалить рецензию (админ)"
                  : "Удалить рецензию"
              }
              disabled={removing}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <ReviewForm
          initialContent={review.content}
          initialRating={review.rating}
          submitting={submitting}
          submitLabel="Сохранить"
          onSubmit={onSubmitEdit}
          onCancel={onCancelEdit}
        />
      ) : (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {review.content}
        </p>
      )}
    </li>
  );
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
    deleteReview,
    isAuthenticated,
    canManageUsers,
    userId
  } = useReviews({ contentId, type });

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (
      editingReviewId &&
      !reviews.some(review => review.id === editingReviewId)
    ) {
      setEditingReviewId(null);
    }
  }, [editingReviewId, reviews]);

  const handleCreate = async (content: string, rating: number) => {
    const saved = await submitReview(content, rating);
    return saved;
  };

  const handleUpdate = async (
    reviewId: string,
    content: string,
    rating: number
  ) => {
    const saved = await submitReview(content, rating, reviewId);
    if (saved) {
      setEditingReviewId(null);
    }
    return saved;
  };

  const handleDelete = async (reviewId: string) => {
    const deleted = await deleteReview(reviewId);
    if (deleted && editingReviewId === reviewId) {
      setEditingReviewId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рецензии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {isAuthenticated && !myReview ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Поделитесь мнением и поставьте оценку.
            </p>
            <ReviewForm
              submitting={submitting}
              submitLabel="Опубликовать"
              onSubmit={handleCreate}
            />
          </div>
        ) : !isAuthenticated ? (
          <p className="text-sm text-muted-foreground">
            Войдите в аккаунт, чтобы оставить рецензию и оценку.
          </p>
        ) : null}

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="font-semibold">Все рецензии ({reviews.length})</h3>
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
                <ReviewItem
                  key={review.id}
                  review={review}
                  isOwn={review.userId === userId}
                  isAdmin={canManageUsers}
                  submitting={submitting}
                  removing={removing}
                  isEditing={editingReviewId === review.id}
                  onStartEdit={() => setEditingReviewId(review.id)}
                  onCancelEdit={() => setEditingReviewId(null)}
                  onSubmitEdit={(content, rating) =>
                    handleUpdate(review.id, content, rating)
                  }
                  onDelete={() => void handleDelete(review.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
