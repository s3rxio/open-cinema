"use client";

import { useMutation } from "@apollo/client/react";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { UPDATE_EPISODE_MUTATION } from "@/shared/api/operations/dashboard";
import { SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import { PublishToggleButton } from "./PublishToggleButton";

type EpisodePublishButtonProps = {
  episodeId: string;
  isPublished: boolean;
  onChanged?: () => void;
};

export function EpisodePublishButton({
  episodeId,
  isPublished,
  onChanged
}: EpisodePublishButtonProps) {
  const [updateEpisode, { loading }] = useMutation(UPDATE_EPISODE_MUTATION);

  return (
    <PublishToggleButton
      isPublished={isPublished}
      loading={loading}
      onClick={async () => {
        try {
          await updateEpisode({
            variables: {
              updateEpisodeInput: { id: episodeId, isPublished: !isPublished }
            },
            refetchQueries: [SERIES_BY_ID_QUERY]
          });
          onChanged?.();
        } catch (error) {
          window.alert(getApolloErrorMessage(error));
        }
      }}
    />
  );
}
