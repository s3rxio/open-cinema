"use client";

import { useMutation } from "@apollo/client/react";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  DASHBOARD_SERIES_LIST_QUERY,
  UPDATE_SERIES_MUTATION
} from "@/features/dashboard/api/dashboard";
import {
  SERIES_BY_ID_QUERY,
  seriesByIdQueryVariables
} from "@/entities/content";
import { PublishToggleButton } from "./PublishToggleButton";

type SeriesPublishButtonProps = {
  seriesId: string;
  isPublished: boolean;
  onChanged?: () => void;
};

export function SeriesPublishButton({
  seriesId,
  isPublished,
  onChanged
}: SeriesPublishButtonProps) {
  const [updateSeries, { loading }] = useMutation(UPDATE_SERIES_MUTATION);

  return (
    <PublishToggleButton
      isPublished={isPublished}
      loading={loading}
      onClick={async () => {
        try {
          await updateSeries({
            variables: {
              updateSeriesInput: { id: seriesId, isPublished: !isPublished }
            },
            refetchQueries: [
              {
                query: SERIES_BY_ID_QUERY,
                variables: seriesByIdQueryVariables(seriesId, {
                  includeUnpublished: true
                })
              },
              DASHBOARD_SERIES_LIST_QUERY
            ]
          });
          onChanged?.();
        } catch (error) {
          window.alert(getApolloErrorMessage(error));
        }
      }}
    />
  );
}
