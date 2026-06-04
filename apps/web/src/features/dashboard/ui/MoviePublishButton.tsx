"use client";

import { useMutation } from "@apollo/client/react";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  DASHBOARD_MOVIES_QUERY,
  UPDATE_MOVIE_MUTATION
} from "@/features/dashboard/api/dashboard";
import { MOVIE_BY_ID_QUERY } from "@/entities/content";
import { PublishToggleButton } from "./PublishToggleButton";

type MoviePublishButtonProps = {
  movieId: string;
  isPublished: boolean;
  onChanged?: () => void;
};

export function MoviePublishButton({
  movieId,
  isPublished,
  onChanged
}: MoviePublishButtonProps) {
  const [updateMovie, { loading }] = useMutation(UPDATE_MOVIE_MUTATION);

  return (
    <PublishToggleButton
      isPublished={isPublished}
      loading={loading}
      onClick={async () => {
        try {
          await updateMovie({
            variables: {
              updateMovieInput: { id: movieId, isPublished: !isPublished }
            },
            refetchQueries: [MOVIE_BY_ID_QUERY, DASHBOARD_MOVIES_QUERY]
          });
          onChanged?.();
        } catch (error) {
          window.alert(getApolloErrorMessage(error));
        }
      }}
    />
  );
}
