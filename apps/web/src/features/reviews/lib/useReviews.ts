"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ContentType } from "@/shared/api/operation-types";
import {
  CREATE_REVIEW_MUTATION,
  MOVIE_REVIEWS_QUERY,
  REMOVE_REVIEW_MUTATION,
  SERIES_REVIEWS_QUERY,
  UPDATE_REVIEW_MUTATION
} from "@/shared/api/operations/reviews";
import { MOVIE_BY_ID_QUERY, SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import { useAuth } from "@/shared/auth/AuthContext";

type UseReviewsOptions = {
  contentId: string;
  type: ContentType;
};

export function useReviews({ contentId, type }: UseReviewsOptions) {
  const router = useRouter();
  const { isAuthenticated, user, canManageUsers } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const reviewsQuery = useQuery(
    type === "MOVIE" ? MOVIE_REVIEWS_QUERY : SERIES_REVIEWS_QUERY,
    {
      variables:
        type === "MOVIE"
          ? { movieId: contentId }
          : { seriesId: contentId },
      skip: !contentId
    }
  );

  const refetchQueries = [
    {
      query: type === "MOVIE" ? MOVIE_REVIEWS_QUERY : SERIES_REVIEWS_QUERY,
      variables:
        type === "MOVIE"
          ? { movieId: contentId }
          : { seriesId: contentId }
    },
    {
      query: type === "MOVIE" ? MOVIE_BY_ID_QUERY : SERIES_BY_ID_QUERY,
      variables: { id: contentId }
    }
  ];

  const [createReview, { loading: creating }] = useMutation(
    CREATE_REVIEW_MUTATION,
    { refetchQueries }
  );
  const [updateReview, { loading: updating }] = useMutation(
    UPDATE_REVIEW_MUTATION,
    { refetchQueries }
  );
  const [removeReview, { loading: removing }] = useMutation(
    REMOVE_REVIEW_MUTATION,
    { refetchQueries }
  );

  const reviews = useMemo(() => {
    const list =
      type === "MOVIE"
        ? (reviewsQuery.data?.movieReviews ?? [])
        : (reviewsQuery.data?.seriesReviews ?? []);

    if (!user?.id) {
      return list;
    }

    const mine = list.find(review => review.userId === user.id);
    if (!mine) {
      return list;
    }

    return [mine, ...list.filter(review => review.userId !== user.id)];
  }, [reviewsQuery.data, type, user?.id]);

  const myReview = useMemo(
    () => reviews.find(review => review.userId === user?.id) ?? null,
    [reviews, user?.id]
  );

  const submitReview = useCallback(
    async (content: string, rating: number, reviewId?: string) => {
      setFormError(null);

      if (!isAuthenticated || !user?.id) {
        router.push("/auth/login");
        return false;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        setFormError("Напишите текст рецензии");
        return false;
      }

      const targetId = reviewId ?? myReview?.id;

      try {
        if (targetId) {
          await updateReview({
            variables: {
              updateReviewInput: {
                id: targetId,
                userId: user.id,
                content: trimmed,
                rating
              }
            }
          });
          return true;
        }

        await createReview({
          variables: {
            createReviewInput: {
              userId: user.id,
              content: trimmed,
              rating,
              ...(type === "MOVIE"
                ? { movieId: contentId }
                : { seriesId: contentId })
            }
          }
        });
        return true;
      } catch {
        setFormError("Не удалось сохранить рецензию");
        return false;
      }
    },
    [
      isAuthenticated,
      user?.id,
      router,
      myReview,
      updateReview,
      createReview,
      type,
      contentId
    ]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      if (!user?.id) return false;

      setFormError(null);
      try {
        await removeReview({
          variables: { id: reviewId, userId: user.id }
        });
        return true;
      } catch {
        setFormError("Не удалось удалить рецензию");
        return false;
      }
    },
    [user?.id, removeReview]
  );

  return {
    reviews,
    myReview,
    loading: reviewsQuery.loading,
    submitting: creating || updating,
    removing,
    formError,
    submitReview,
    deleteReview,
    isAuthenticated,
    canManageUsers,
    userId: user?.id
  };
}
