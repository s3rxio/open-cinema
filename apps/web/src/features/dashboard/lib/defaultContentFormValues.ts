import { dateToIsoDate, toDateTimeIso } from "@open-cinema/ui";
import type { ContentFormValues } from "../ui/ContentEditForm";

export function defaultContentFormValues(): ContentFormValues {
  return {
    title: "",
    description: "",
    director: "",
    genres: [],
    releaseDate: dateToIsoDate(new Date()),
    rating: "0"
  };
}

export function contentFormToInput(values: ContentFormValues) {
  return {
    title: values.title,
    description: values.description,
    director: values.director,
    genres: values.genres,
    releaseDate: toDateTimeIso(values.releaseDate),
    rating: Number(values.rating)
  };
}
