import { registerEnumType } from "@nestjs/graphql";

export enum Genre {
  ANIME = "ANIME",
  DRAMA = "DRAMA",
  COMEDY = "COMEDY",
  ACTION = "ACTION",
  ADVENTURE = "ADVENTURE",
  SUPERNATURAL = "SUPERNATURAL",
  FANTASY = "FANTASY",
  THRILLER = "THRILLER",
  HORROR = "HORROR",
  SCI_FI = "SCI_FI",
  ROMANCE = "ROMANCE",
  DOCUMENTARY = "DOCUMENTARY"
}

registerEnumType(Genre, {
  name: "Genre",
  description: "Content genre"
});
