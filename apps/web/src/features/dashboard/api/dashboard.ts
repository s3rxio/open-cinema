import { gql } from "@apollo/client";
import type {
  CreateStreamMutation,
  CreateStreamMutationVariables,
  DashboardMoviesQuery,
  DashboardMoviesQueryVariables,
  DashboardSeriesListQuery,
  DashboardSeriesListQueryVariables,
  DashboardUserQuery,
  DashboardUserQueryVariables,
  DashboardUsersQuery,
  DashboardUsersQueryVariables,
  GenerateMasterMutation,
  GenerateMasterMutationVariables,
  TypedDocumentNode,
  UpdateAudioMetaMutation,
  UpdateAudioMetaMutationVariables,
  CreateMovieMutation,
  CreateMovieMutationVariables,
  CreateSeriesMutation,
  CreateSeriesMutationVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  UpdateMovieMutation,
  UpdateMovieMutationVariables,
  UpdateSeriesMutation,
  UpdateSeriesMutationVariables,
  UpdateSubtitleMetaMutation,
  UpdateSubtitleMetaMutationVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  UpdateVideoMetaMutation,
  UpdateVideoMetaMutationVariables,
  RemoveVideoMetaMutation,
  RemoveVideoMetaMutationVariables,
  RemoveAudioMetaMutation,
  RemoveAudioMetaMutationVariables,
  RemoveSubtitleMetaMutation,
  RemoveSubtitleMetaMutationVariables,
  RemoveMovieMutation,
  RemoveMovieMutationVariables,
  RemoveSeriesMutation,
  RemoveSeriesMutationVariables,
  RemoveUserMutation,
  RemoveUserMutationVariables,
  RemoveEpisodeMutation,
  RemoveEpisodeMutationVariables,
  RemoveEpisodesBulkMutation,
  RemoveEpisodesBulkMutationVariables,
  UnpublishEpisodesBulkMutation,
  UnpublishEpisodesBulkMutationVariables,
  CreateEpisodeMutation,
  CreateEpisodeMutationVariables,
  CreateEpisodesBulkMutation,
  CreateEpisodesBulkMutationVariables,
  UpdateEpisodeMutation,
  UpdateEpisodeMutationVariables,
  UploadAudioMutation,
  UploadAudioMutationVariables,
  UploadSubtitleMutation,
  UploadSubtitleMutationVariables,
  UploadVideoMutation,
  UploadVideoMutationVariables,
  UploadContentPosterMutation,
  UploadContentPosterMutationVariables,
  UploadContentBannerMutation,
  UploadContentBannerMutationVariables
} from "@/shared/api/operation-types";
import { MOVIE_BY_ID_QUERY, SERIES_BY_ID_QUERY } from "@/entities/content";
import { GET_STREAM_INFO_QUERY } from "@/entities/stream";

export { MOVIE_BY_ID_QUERY, SERIES_BY_ID_QUERY, GET_STREAM_INFO_QUERY };

export const DASHBOARD_MOVIES_QUERY = gql`
  query DashboardMovies(
    $first: Int!
    $cursor: String
    $search: String
    $includeUnpublished: Boolean
  ) {
    movies(
      first: $first
      cursor: $cursor
      search: $search
      includeUnpublished: $includeUnpublished
    ) {
      data {
        id
        title
        description
        releaseDate
        rating
        genres
        director
        posterUrl
        bannerUrl
        streamId
        isPublished
        createdAt
      }
      total
      nextCursor
      prevCursor
    }
  }
` as TypedDocumentNode<DashboardMoviesQuery, DashboardMoviesQueryVariables>;

export const DASHBOARD_SERIES_LIST_QUERY = gql`
  query DashboardSeriesList(
    $first: Int!
    $cursor: String
    $search: String
    $includeUnpublished: Boolean
  ) {
    seriesList(
      first: $first
      cursor: $cursor
      search: $search
      includeUnpublished: $includeUnpublished
    ) {
      data {
        id
        title
        description
        releaseDate
        rating
        genres
        director
        posterUrl
        bannerUrl
        isPublished
        createdAt
      }
      total
      nextCursor
      prevCursor
    }
  }
` as TypedDocumentNode<
  DashboardSeriesListQuery,
  DashboardSeriesListQueryVariables
>;

export const DASHBOARD_USERS_QUERY = gql`
  query DashboardUsers($first: Int!, $cursor: String, $search: String) {
    users(first: $first, cursor: $cursor, search: $search) {
      data {
        id
        username
        email
        birthdate
        createdAt
      }
      total
      nextCursor
      prevCursor
    }
  }
` as TypedDocumentNode<DashboardUsersQuery, DashboardUsersQueryVariables>;

export const DASHBOARD_USER_QUERY = gql`
  query DashboardUser($id: String!) {
    user(id: $id) {
      id
      username
      email
      birthdate
      createdAt
      roles {
        slug
        name
      }
    }
  }
` as TypedDocumentNode<DashboardUserQuery, DashboardUserQueryVariables>;

export const CREATE_MOVIE_MUTATION = gql`
  mutation CreateMovie($createMovieInput: CreateMovieInput!) {
    createMovie(createMovieInput: $createMovieInput) {
      id
      title
    }
  }
` as TypedDocumentNode<CreateMovieMutation, CreateMovieMutationVariables>;

export const CREATE_SERIES_MUTATION = gql`
  mutation CreateSeries($createSeriesInput: CreateSeriesInput!) {
    createSeries(createSeriesInput: $createSeriesInput) {
      id
      title
    }
  }
` as TypedDocumentNode<CreateSeriesMutation, CreateSeriesMutationVariables>;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      username
      email
    }
  }
` as TypedDocumentNode<CreateUserMutation, CreateUserMutationVariables>;

export const UPDATE_MOVIE_MUTATION = gql`
  mutation UpdateMovie($updateMovieInput: UpdateMovieInput!) {
    updateMovie(updateMovieInput: $updateMovieInput) {
      id
      title
      description
      director
      releaseDate
      rating
      genres
      posterUrl
      bannerUrl
      streamId
      isPublished
    }
  }
` as TypedDocumentNode<UpdateMovieMutation, UpdateMovieMutationVariables>;

export const UPDATE_SERIES_MUTATION = gql`
  mutation UpdateSeries($updateSeriesInput: UpdateSeriesInput!) {
    updateSeries(updateSeriesInput: $updateSeriesInput) {
      id
      title
      description
      director
      releaseDate
      rating
      genres
      posterUrl
      bannerUrl
      isPublished
    }
  }
` as TypedDocumentNode<UpdateSeriesMutation, UpdateSeriesMutationVariables>;

export const UPLOAD_CONTENT_POSTER_MUTATION = gql`
  mutation UploadContentPoster($input: UploadContentPosterInput!) {
    uploadContentPoster(input: $input) {
      id
      posterUrl
      bannerUrl
      type
    }
  }
` as TypedDocumentNode<
  UploadContentPosterMutation,
  UploadContentPosterMutationVariables
>;

export const UPLOAD_CONTENT_BANNER_MUTATION = gql`
  mutation UploadContentBanner($input: UploadContentBannerInput!) {
    uploadContentBanner(input: $input) {
      id
      posterUrl
      bannerUrl
      type
    }
  }
` as TypedDocumentNode<
  UploadContentBannerMutation,
  UploadContentBannerMutationVariables
>;

export const REMOVE_MOVIE_MUTATION = gql`
  mutation RemoveMovie($id: String!) {
    removeMovie(id: $id)
  }
` as TypedDocumentNode<RemoveMovieMutation, RemoveMovieMutationVariables>;

export const REMOVE_SERIES_MUTATION = gql`
  mutation RemoveSeries($id: String!) {
    removeSeries(id: $id)
  }
` as TypedDocumentNode<RemoveSeriesMutation, RemoveSeriesMutationVariables>;

export const REMOVE_USER_MUTATION = gql`
  mutation RemoveUser($id: String!) {
    removeUser(id: $id)
  }
` as TypedDocumentNode<RemoveUserMutation, RemoveUserMutationVariables>;

export const CREATE_EPISODE_MUTATION = gql`
  mutation CreateEpisode($createEpisodeInput: CreateEpisodeInput!) {
    createEpisode(createEpisodeInput: $createEpisodeInput) {
      id
      title
      season
      episode
      description
      rating
      releaseDate
      streamId
      seriesId
    }
  }
` as TypedDocumentNode<CreateEpisodeMutation, CreateEpisodeMutationVariables>;

export const CREATE_EPISODES_BULK_MUTATION = gql`
  mutation CreateEpisodesBulk(
    $createEpisodesBulkInput: CreateEpisodesBulkInput!
  ) {
    createEpisodesBulk(createEpisodesBulkInput: $createEpisodesBulkInput) {
      id
      title
      season
      episode
      description
      rating
      releaseDate
      streamId
    }
  }
` as TypedDocumentNode<
  CreateEpisodesBulkMutation,
  CreateEpisodesBulkMutationVariables
>;

export const REMOVE_EPISODE_MUTATION = gql`
  mutation RemoveEpisode($id: String!) {
    removeEpisode(id: $id)
  }
` as TypedDocumentNode<RemoveEpisodeMutation, RemoveEpisodeMutationVariables>;

export const UNPUBLISH_EPISODES_BULK_MUTATION = gql`
  mutation UnpublishEpisodesBulk($episodesBulkIdsInput: EpisodesBulkIdsInput!) {
    unpublishEpisodesBulk(episodesBulkIdsInput: $episodesBulkIdsInput)
  }
` as TypedDocumentNode<
  UnpublishEpisodesBulkMutation,
  UnpublishEpisodesBulkMutationVariables
>;

export const REMOVE_EPISODES_BULK_MUTATION = gql`
  mutation RemoveEpisodesBulk($episodesBulkIdsInput: EpisodesBulkIdsInput!) {
    removeEpisodesBulk(episodesBulkIdsInput: $episodesBulkIdsInput)
  }
` as TypedDocumentNode<
  RemoveEpisodesBulkMutation,
  RemoveEpisodesBulkMutationVariables
>;

export const UPDATE_EPISODE_MUTATION = gql`
  mutation UpdateEpisode($updateEpisodeInput: UpdateEpisodeInput!) {
    updateEpisode(updateEpisodeInput: $updateEpisodeInput) {
      id
      title
      season
      episode
      description
      rating
      releaseDate
      streamId
      seriesId
      isPublished
    }
  }
` as TypedDocumentNode<UpdateEpisodeMutation, UpdateEpisodeMutationVariables>;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      username
      email
      birthdate
    }
  }
` as TypedDocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;

export const CREATE_STREAM_MUTATION = gql`
  mutation CreateStream($createStreamInput: CreateStreamInput!) {
    createStream(createStreamInput: $createStreamInput) {
      id
    }
  }
` as TypedDocumentNode<CreateStreamMutation, CreateStreamMutationVariables>;

export const GENERATE_MASTER_MUTATION = gql`
  mutation GenerateMaster($streamId: String!) {
    generateMaster(streamId: $streamId)
  }
` as TypedDocumentNode<GenerateMasterMutation, GenerateMasterMutationVariables>;

export const UPDATE_VIDEO_META_MUTATION = gql`
  mutation UpdateVideoMeta($updateVideoMetaInput: UpdateVideoMetaInput!) {
    updateVideoMeta(updateVideoMetaInput: $updateVideoMetaInput) {
      id
      displayName
      slug
    }
  }
` as TypedDocumentNode<
  UpdateVideoMetaMutation,
  UpdateVideoMetaMutationVariables
>;

export const UPDATE_AUDIO_META_MUTATION = gql`
  mutation UpdateAudioMeta($updateAudioMetaInput: UpdateAudioMetaInput!) {
    updateAudioMeta(updateAudioMetaInput: $updateAudioMetaInput) {
      id
      displayName
      slug
      orderNumer
      isDefault
    }
  }
` as TypedDocumentNode<
  UpdateAudioMetaMutation,
  UpdateAudioMetaMutationVariables
>;

export const UPDATE_SUBTITLE_META_MUTATION = gql`
  mutation UpdateSubtitleMeta(
    $updateSubtitleMetaInput: UpdateSubtitleMetaInput!
  ) {
    updateSubtitleMeta(updateSubtitleMetaInput: $updateSubtitleMetaInput) {
      id
      displayName
      slug
      orderNumer
    }
  }
` as TypedDocumentNode<
  UpdateSubtitleMetaMutation,
  UpdateSubtitleMetaMutationVariables
>;

export const REMOVE_VIDEO_META_MUTATION = gql`
  mutation RemoveVideoMeta($id: String!) {
    removeVideoMeta(id: $id)
  }
` as TypedDocumentNode<
  RemoveVideoMetaMutation,
  RemoveVideoMetaMutationVariables
>;

export const REMOVE_AUDIO_META_MUTATION = gql`
  mutation RemoveAudioMeta($id: String!) {
    removeAudioMeta(id: $id)
  }
` as TypedDocumentNode<
  RemoveAudioMetaMutation,
  RemoveAudioMetaMutationVariables
>;

export const REMOVE_SUBTITLE_META_MUTATION = gql`
  mutation RemoveSubtitleMeta($id: String!) {
    removeSubtitleMeta(id: $id)
  }
` as TypedDocumentNode<
  RemoveSubtitleMetaMutation,
  RemoveSubtitleMetaMutationVariables
>;

export const UPLOAD_VIDEO_MUTATION = gql`
  mutation UploadVideo($uploadVideoInput: UploadVideoInput!) {
    uploadVideo(uploadVideoInput: $uploadVideoInput)
  }
` as TypedDocumentNode<UploadVideoMutation, UploadVideoMutationVariables>;

export const UPLOAD_AUDIO_MUTATION = gql`
  mutation UploadAudio($uploadAudioInput: UploadAudioInput!) {
    uploadAudio(uploadAudioInput: $uploadAudioInput) {
      id
      displayName
      slug
      orderNumer
      isDefault
    }
  }
` as TypedDocumentNode<UploadAudioMutation, UploadAudioMutationVariables>;

export const UPLOAD_SUBTITLE_MUTATION = gql`
  mutation UploadSubtitle($uploadSubtitleInput: UploadSubtitleInput!) {
    uploadSubtitle(uploadSubtitleInput: $uploadSubtitleInput) {
      id
      displayName
      slug
      orderNumer
    }
  }
` as TypedDocumentNode<UploadSubtitleMutation, UploadSubtitleMutationVariables>;
