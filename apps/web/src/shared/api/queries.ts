import { gql } from "@apollo/client";

export const QUERIES = {
  // Auth
  login: gql`
    mutation Login($login: String!, $password: String!) {
      login(login: $login, password: $password) {
        token
        user {
          id
          email
          username
        }
      }
    }
  `,

  register: gql`
    mutation Register($email: String!, $password: String!, $username: String!) {
      register(email: $email, password: $password, username: $username) {
        token
        user {
          id
          email
          username
        }
      }
    }
  `,

  // Catalog
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

  // Favorites
  me: gql`
    query Me {
      me {
        id
        email
        username
        favorites {
          id
          contentId
          content {
            id
            title
            description
            rating
            type
            posterUrl
          }
        }
      }
    }
  `,

  toggleFavorite: gql`
    mutation ToggleFavorite($contentId: String!) {
      toggleFavorite(contentId: $contentId) {
        id
        contentId
        content {
          id
          title
        }
      }
    }
  `,

  // Movies/Series
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
        streamId
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
        seasons {
          season
          episodes {
            id
            title
            season
            episode
            releaseDate
            rating
            description
            streamId
          }
        }
      }
    }
  `,

  // Stream
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
          isDefault
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
          isDefault
        }
      }
    }
  `
} as const;
