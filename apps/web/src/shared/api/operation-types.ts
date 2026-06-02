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
