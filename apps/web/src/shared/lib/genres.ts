export const GENRE_VALUES = [
  "ANIME",
  "DRAMA",
  "COMEDY",
  "ACTION",
  "ADVENTURE",
  "SUPERNATURAL",
  "FANTASY",
  "THRILLER",
  "HORROR",
  "SCI_FI",
  "ROMANCE",
  "DOCUMENTARY"
] as const;

export type Genre = (typeof GENRE_VALUES)[number];

export const GENRE_LABELS: Record<Genre, string> = {
  ANIME: "Аниме",
  DRAMA: "Драма",
  COMEDY: "Комедия",
  ACTION: "Боевик",
  ADVENTURE: "Приключения",
  SUPERNATURAL: "Сверхъестественное",
  FANTASY: "Фэнтези",
  THRILLER: "Триллер",
  HORROR: "Ужасы",
  SCI_FI: "Фантастика",
  ROMANCE: "Романтика",
  DOCUMENTARY: "Документальный"
};

export function formatGenreLabel(genre: Genre): string {
  return GENRE_LABELS[genre] ?? genre;
}

export function formatGenres(genres: Genre[]): string {
  return genres.map(formatGenreLabel).join(", ");
}

export function primaryGenreLabel(genres?: Genre[] | null): string | null {
  if (!genres?.length) {
    return null;
  }

  return formatGenreLabel(genres[0]);
}
