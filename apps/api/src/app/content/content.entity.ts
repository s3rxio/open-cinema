import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { ContentType } from "./content.types";

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
  genre: string;

  @Field()
  director: string;

  @Field({ nullable: true })
  posterUrl?: string | null;

  @Field(() => ContentType)
  type: ContentType;
}
