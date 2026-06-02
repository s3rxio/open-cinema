export const routes = {
  home: "/",
  movie: (id: string) => `/movie/${id}`,
  series: (id: string) => `/series/${id}`,
  watchMovie: (id: string) => `/watch/movie/${id}`,
  watchSeries: (id: string, episodeId?: string) =>
    episodeId
      ? `/watch/series/${id}?episode=${episodeId}`
      : `/watch/series/${id}`
};
