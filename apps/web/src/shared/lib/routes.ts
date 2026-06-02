export const routes = {
  home: "/",
  dashboard: "/dashboard",
  dashboardMovies: "/dashboard/movies",
  dashboardSeries: "/dashboard/series",
  dashboardUsers: "/dashboard/users",
  dashboardMovieCreate: "/dashboard/movies/new",
  dashboardSeriesCreate: "/dashboard/series/new",
  dashboardUserCreate: "/dashboard/users/new",
  dashboardMovieEdit: (id: string) => `/dashboard/movies/${id}`,
  dashboardSeriesEdit: (id: string) => `/dashboard/series/${id}`,
  dashboardUserEdit: (id: string) => `/dashboard/users/${id}`,
  movie: (id: string) => `/movie/${id}`,
  series: (id: string) => `/series/${id}`,
  watchMovie: (id: string) => `/watch/movie/${id}`,
  watchSeries: (id: string, episodeId?: string) =>
    episodeId
      ? `/watch/series/${id}?episode=${episodeId}`
      : `/watch/series/${id}`
};
