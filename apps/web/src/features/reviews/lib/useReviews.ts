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
  const { isAuthenticated, user } = useAuth();
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
    if (type === "MOVIE") {
      return reviewsQuery.data?.movieReviews ?? [];
    }
    return reviewsQuery.data?.seriesReviews ?? [];
  }, [reviewsQuery.data, type]);

  const myReview = useMemo(
    () => reviews.find(review => review.userId === user?.id) ?? null,
    [reviews, user?.id]
  );

  const submitReview = useCallback(
    async (content: string, rating: number) => {
      setFormError(null);

      if (!isAuthenticated || !user?.id) {
        router.push("/auth/login");
        return;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        setFormError("Напишите текст рецензии");
        return;
      }

      try {
        if (myReview) {
          await updateReview({
            variables: {
              updateReviewInput: {
                id: myReview.id,
                userId: user.id,
                content: trimmed,
                rating
              }
            }
          });
          return;
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
      } catch {
        setFormError("Не удалось сохранить рецензию");
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

  const deleteMyReview = useCallback(async () => {
    if (!myReview || !user?.id) return;

    setFormError(null);
    try {
      await removeReview({
        variables: { id: myReview.id, userId: user.id }
      });
    } catch {
      setFormError("Не удалось удалить рецензию");
    }
  }, [myReview, user?.id, removeReview]);

  return {
    reviews,
    myReview,
    loading: reviewsQuery.loading,
    submitting: creating || updating,
    removing,
    formError,
    submitReview,
    deleteMyReview,
    isAuthenticated
  };
}
