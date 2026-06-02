import type { DocumentNode } from "graphql";

export interface TypedDocumentNode<
  TResult = { [key: string]: unknown },
  TVariables = Record<string, never>
> extends DocumentNode {
  __apiType?: (variables: TVariables) => TResult;
  __resultType?: TResult;
  __variableType?: TVariables;
}

export type ContentType = "MOVIE" | "SERIES";

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  rating: number;
  type: ContentType;
  posterUrl?: string | null;
};

export type LoginMutationVariables = {
  loginInput: {
    login: string;
    password: string;
  };
};

export type LoginMutation = {
  login: {
    accessToken: string;
    refreshToken: string;
  };
};

export type RegisterMutationVariables = {
  registerInput: {
    email: string;
    password: string;
    username: string;
    birthdate?: string | null;
  };
};

export type RegisterMutation = {
  register: {
    accessToken: string;
    refreshToken: string;
  };
};

export type GetRecentContentQueryVariables = {
  skip: number;
  take: number;
};

export type ContentSearchResult = {
  total: number;
  hasMore: number;
  items: ContentItem[];
};

export type GetRecentContentQuery = {
  getRecentContent: ContentSearchResult;
};

export type GetTrendingContentQueryVariables = GetRecentContentQueryVariables;

export type GetTrendingContentQuery = {
  getTrendingContent: ContentSearchResult;
};

export type SearchContentQueryVariables = {
  input: {
    query?: string;
    skip?: number;
    take?: number;
    contentType?: string;
    genre?: string;
    minRating?: number;
    maxRating?: number;
    sortBy?: string;
    sortOrder?: string;
  };
};

export type SearchContentQuery = {
  searchContent: ContentSearchResult;
};

export type FavoriteContentFields = {
  id: string;
  title: string;
  description: string;
  rating: number;
  posterUrl?: string | null;
  releaseDate: string;
};

export type MeQuery = {
  me: {
    id: string;
    email: string;
    username: string;
    roles: Array<{ slug: string }>;
    favorites: Array<{
      id: string;
      movie: FavoriteContentFields | null;
      series: FavoriteContentFields | null;
    }>;
  };
};

export type CreateFavoriteMutationVariables = {
  createFavoriteInput: {
    userId: string;
    movieId?: string;
    seriesId?: string;
  };
};

export type CreateFavoriteMutation = {
  createFavorite: {
    id: string;
    movie: { id: string; title: string } | null;
    series: { id: string; title: string } | null;
  };
};

export type RemoveFavoriteMutationVariables = {
  id: string;
};

export type RemoveFavoriteMutation = {
  removeFavorite: boolean;
};

export type MovieByIdQueryVariables = {
  id: string;
};

export type MovieByIdQuery = {
  movie: {
    id: string;
    title: string;
    description: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: number;
    posterUrl?: string | null;
    streamId?: string | null;
  };
};

export type SeriesEpisode = {
  id: string;
  title: string;
  season: number;
  episode: number;
  description: string;
  rating: number;
  releaseDate: string;
  streamId?: string | null;
};

export type SeriesByIdQueryVariables = {
  id: string;
};

export type SeriesByIdQuery = {
  series: {
    id: string;
    title: string;
    description: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: number;
    posterUrl?: string | null;
    episodes: SeriesEpisode[] | null;
  };
};

export type GetStreamInfoQueryVariables = {
  streamId: string;
};

export type VideoMeta = {
  id: string;
  displayName: string;
  bitrate: number;
  width: number;
  height: number;
  url: string;
  slug: string;
  streamId: string;
  isProcessed: boolean;
};

export type AudioMeta = {
  id: string;
  displayName: string;
  bitrate: number;
  url: string;
  slug: string;
  streamId: string;
  isDefault: boolean;
  isProcessed: boolean;
  orderNumer: number;
};

export type SubtitleMeta = {
  id: string;
  displayName: string;
  url: string;
  slug: string;
  streamId: string;
  orderNumer: number;
};

export type StreamInfo = {
  id: string;
  masterPlaylistUrl: string | null;
  videoMetas: VideoMeta[];
  audioMetas: AudioMeta[];
  subtitleMetas: SubtitleMeta[];
};

export type GetStreamInfoQuery = {
  getStreamInfo: StreamInfo;
};

export type GetStreamForContentQueryVariables = {
  contentId: string;
};

export type GetStreamForContentQuery = {
  getStreamForContent: StreamInfo;
};

export type GetStreamForMovieQueryVariables = {
  movieId: string;
};

export type GetStreamForMovieQuery = {
  getStreamForMovie: StreamInfo;
};

export type GetStreamForEpisodeQueryVariables = {
  episodeId: string;
};

export type GetStreamForEpisodeQuery = {
  getStreamForEpisode: StreamInfo;
};

export type PaginatedListItem = {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  rating: number;
  genre: string;
  director: string;
  posterUrl?: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  nextCursor?: string | null;
  prevCursor?: string | null;
};

export type DashboardMoviesQueryVariables = {
  first: number;
  cursor?: string | null;
  search?: string | null;
};

export type DashboardMovieItem = PaginatedListItem & {
  streamId?: string | null;
};

export type DashboardMoviesQuery = {
  movies: PaginatedResponse<DashboardMovieItem>;
};

export type DashboardSeriesListQueryVariables = DashboardMoviesQueryVariables;

export type DashboardSeriesListQuery = {
  seriesList: PaginatedResponse<PaginatedListItem>;
};

export type DashboardUsersQueryVariables = DashboardMoviesQueryVariables;

export type DashboardUserListItem = {
  id: string;
  username: string;
  email: string;
  birthdate?: string | null;
  createdAt: string;
  roles?: Array<{ slug: string; name: string }>;
};

export type DashboardUsersQuery = {
  users: PaginatedResponse<DashboardUserListItem>;
};

export type DashboardUserQueryVariables = { id: string };

export type DashboardUserQuery = {
  user: DashboardUserListItem;
};

export type CreateContentInputFields = {
  title: string;
  description: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: number;
};

export type CreateMovieMutationVariables = {
  createMovieInput: CreateContentInputFields;
};

export type CreateMovieMutation = {
  createMovie: { id: string; title: string };
};

export type CreateSeriesMutationVariables = {
  createSeriesInput: CreateContentInputFields;
};

export type CreateSeriesMutation = {
  createSeries: { id: string; title: string };
};

export type CreateUserMutationVariables = {
  createUserInput: {
    username: string;
    email: string;
    password: string;
    roleSlug?: string;
    birthdate?: string | null;
  };
};

export type CreateUserMutation = {
  createUser: { id: string; username: string; email: string };
};

export type UpdateMovieMutationVariables = {
  updateMovieInput: {
    id: string;
    title?: string;
    description?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    rating?: number;
  };
};

export type UpdateMovieMutation = { updateMovie: MovieByIdQuery["movie"] };

export type UpdateSeriesMutationVariables = {
  updateSeriesInput: UpdateMovieMutationVariables["updateMovieInput"];
};

export type UpdateSeriesMutation = {
  updateSeries: Omit<SeriesByIdQuery["series"], "episodes">;
};

export type UpdateUserMutationVariables = {
  updateUserInput: {
    id: string;
    username?: string;
    email?: string;
    password?: string;
    roleSlug?: string;
    birthdate?: string | null;
  };
};

export type UpdateUserMutation = {
  updateUser: DashboardUserListItem;
};

export type CreateStreamMutationVariables = {
  createStreamInput: { contentId: string };
};

export type CreateStreamMutation = {
  createStream: { id: string };
};

export type GenerateMasterMutationVariables = { streamId: string };

export type GenerateMasterMutation = { generateMaster: string };

export type UpdateVideoMetaMutationVariables = {
  updateVideoMetaInput: {
    id: string;
    displayName?: string;
    slug?: string;
  };
};

export type UpdateVideoMetaMutation = {
  updateVideoMeta: Pick<VideoMeta, "id" | "displayName" | "slug">;
};

export type UpdateAudioMetaMutationVariables = {
  updateAudioMetaInput: {
    id: string;
    displayName?: string;
    slug?: string;
    orderNumer?: number;
    isDefault?: boolean;
  };
};

export type UpdateAudioMetaMutation = {
  updateAudioMeta: Pick<
    AudioMeta,
    "id" | "displayName" | "slug" | "orderNumer" | "isDefault"
  >;
};

export type UpdateSubtitleMetaMutationVariables = {
  updateSubtitleMetaInput: {
    id: string;
    displayName?: string;
    slug?: string;
    orderNumer?: number;
  };
};

export type UpdateSubtitleMetaMutation = {
  updateSubtitleMeta: Pick<
    SubtitleMeta,
    "id" | "displayName" | "slug" | "orderNumer"
  >;
};

export type RemoveMovieMutationVariables = { id: string };
export type RemoveMovieMutation = { removeMovie: boolean };

export type RemoveSeriesMutationVariables = { id: string };
export type RemoveSeriesMutation = { removeSeries: boolean };

export type RemoveUserMutationVariables = { id: string };
export type RemoveUserMutation = { removeUser: boolean };

export type CreateEpisodeMutationVariables = {
  createEpisodeInput: {
    seriesId: string;
    title: string;
    description: string;
    releaseDate: string;
    rating: number;
    season: number;
    episode: number;
  };
};

export type CreateEpisodeMutation = {
  createEpisode: SeriesEpisode & { seriesId: string };
};

export type CreateEpisodesBulkMutationVariables = {
  createEpisodesBulkInput: {
    seriesId: string;
    season: number;
    count: number;
    startEpisode?: number;
    description: string;
    releaseDate: string;
    rating: number;
    titlePrefix?: string;
  };
};

export type CreateEpisodesBulkMutation = {
  createEpisodesBulk: SeriesEpisode[];
};

export type RemoveEpisodeMutationVariables = { id: string };
export type RemoveEpisodeMutation = { removeEpisode: boolean };

export type UpdateEpisodeMutationVariables = {
  updateEpisodeInput: {
    id: string;
    seriesId: string;
    title: string;
    description: string;
    releaseDate: string;
    rating: number;
    season: number;
    episode: number;
  };
};

export type UpdateEpisodeMutation = {
  updateEpisode: SeriesEpisode & { seriesId: string };
};

export type RemoveVideoMetaMutationVariables = { id: string };
export type RemoveVideoMetaMutation = { removeVideoMeta: boolean };

export type RemoveAudioMetaMutationVariables = { id: string };
export type RemoveAudioMetaMutation = { removeAudioMeta: boolean };

export type RemoveSubtitleMetaMutationVariables = { id: string };
export type RemoveSubtitleMetaMutation = { removeSubtitleMeta: boolean };

export type UploadVideoMutationVariables = {
  uploadVideoInput: {
    streamId: string;
    file: File;
  };
};

export type UploadVideoMutation = { uploadVideo: string };

export type UploadAudioMutationVariables = {
  uploadAudioInput: {
    streamId: string;
    file: File;
    slug: string;
    displayName: string;
    orderNumer: number;
    isDefault?: boolean;
  };
};

export type UploadAudioMutation = {
  uploadAudio: Pick<
    AudioMeta,
    "id" | "displayName" | "slug" | "orderNumer" | "isDefault"
  >;
};

export type UploadSubtitleMutationVariables = {
  uploadSubtitleInput: {
    streamId: string;
    file: File;
    slug: string;
    displayName: string;
    orderNumer: number;
  };
};

export type UploadSubtitleMutation = {
  uploadSubtitle: Pick<
    SubtitleMeta,
    "id" | "displayName" | "slug" | "orderNumer"
  >;
};
