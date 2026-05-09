import { ObjectType, Field } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";

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
}
