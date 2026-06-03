import type { ContentFormValues } from "../ui/ContentEditForm";

export function defaultContentFormValues(): ContentFormValues {
  return {
    title: "",
    description: "",
    director: "",
    genres: [],
    releaseDate: new Date().toISOString().slice(0, 10),
    rating: "0"
  };
}

export function contentFormToInput(values: ContentFormValues) {
  return {
    title: values.title,
    description: values.description,
    director: values.director,
    genres: values.genres,
    releaseDate: new Date(values.releaseDate).toISOString(),
    rating: Number(values.rating)
  };
}
