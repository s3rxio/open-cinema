import { gql } from "@apollo/client";

export { LOGIN_MUTATION, REGISTER_MUTATION } from "./operations/auth";

export {
  GET_RECENT_CONTENT_QUERY,
  GET_TRENDING_CONTENT_QUERY
} from "./operations/catalog";

export {
  ME_QUERY,
  CREATE_FAVORITE_MUTATION,
  REMOVE_FAVORITE_MUTATION
} from "./operations/favorites";

export { MOVIE_BY_ID_QUERY, SERIES_BY_ID_QUERY } from "./operations/content";

export { GET_STREAM_INFO_QUERY } from "./operations/stream";

export { SEARCH_CONTENT_QUERY } from "./operations/search";

export const QUERIES = {
  login: gql`
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        refreshToken
      }
    }
  `,

  register: gql`
    mutation Register($registerInput: RegisterInput!) {
      register(registerInput: $registerInput) {
        accessToken
        refreshToken
      }
    }
  `,

  getRecentContent: gql`
    query GetRecentContent($skip: Int!, $take: Int!) {
      getRecentContent(skip: $skip, take: $take) {
        total
        hasMore
        items {
          id
          title
          description
          releaseDate
          rating
          type
          posterUrl
        }
      }
    }
  `,

  getTrendingContent: gql`
    query GetTrendingContent($skip: Int!, $take: Int!) {
      getTrendingContent(skip: $skip, take: $take) {
        total
        hasMore
        items {
          id
          title
          description
          releaseDate
          rating
          type
          posterUrl
        }
      }
    }
  `,

  me: gql`
    query Me {
      me {
        id
        email
        username
        favorites {
          id
          movie {
            id
            title
            description
            rating
            posterUrl
            releaseDate
          }
          series {
            id
            title
            description
            rating
            posterUrl
            releaseDate
          }
        }
      }
    }
  `,

  createFavorite: gql`
    mutation CreateFavorite($createFavoriteInput: CreateFavoriteInput!) {
      createFavorite(createFavoriteInput: $createFavoriteInput) {
        id
      }
    }
  `,

  removeFavorite: gql`
    mutation RemoveFavorite($id: String!) {
      removeFavorite(id: $id)
    }
  `,

  movieById: gql`
    query MovieById($id: String!) {
      movie(id: $id) {
        id
        title
        description
        director
        genre
        releaseDate
        rating
        posterUrl
      }
    }
  `,

  seriesById: gql`
    query SeriesById($id: String!) {
      series(id: $id) {
        id
        title
        description
        director
        genre
        releaseDate
        rating
        posterUrl
        episodes {
          id
          title
          season
          episode
          description
          rating
        }
      }
    }
  `,

  getStreamInfo: gql`
    query GetStreamInfo($streamId: String!) {
      getStreamInfo(streamId: $streamId) {
        id
        masterPlaylistUrl
        videoMetas {
          id
          displayName
          bitrate
          width
          height
          url
          slug
          streamId
          isProcessed
        }
        audioMetas {
          id
          displayName
          bitrate
          url
          slug
          streamId
          isDefault
          isProcessed
          orderNumer
        }
        subtitleMetas {
          id
          displayName
          url
          slug
          streamId
          orderNumer
        }
      }
    }
  `,

  searchContent: gql`
    query SearchContent($input: SearchContentInput!) {
      searchContent(input: $input) {
        total
        hasMore
        items {
          id
          title
          description
          releaseDate
          rating
          type
          posterUrl
        }
      }
    }
  `
} as const;
