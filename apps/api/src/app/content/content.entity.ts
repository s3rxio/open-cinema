import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { ContentType } from "./content.types";
import { Genre } from "./genre.enum";

registerEnumType(ContentType, {
  name: "ContentType"
});

@ObjectType()
export class Content extends BaseEntity {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  releaseDate: Date;

  @Field()
  rating: number;

  @Field()
  director: string;

  @Field(() => [Genre])
  genres: Genre[];

  @Field({ nullable: true })
  posterUrl?: string | null;

  @Field({ nullable: true })
  bannerUrl?: string | null;

  @Field(() => ContentType)
  type: ContentType;
}
