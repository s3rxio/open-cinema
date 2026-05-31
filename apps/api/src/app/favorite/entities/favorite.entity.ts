import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { FavoriteModel } from "../../../../prisma/generated/models";
import { IsOptional } from "class-validator";
import { Movie } from "../../movie/entities/movie.entity";
import { Series } from "../../series/entities/series.entity";

@ObjectType()
export class Favorite extends BaseEntity implements Partial<FavoriteModel> {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => Movie, { nullable: true })
  @IsOptional()
  movie: Movie | null;

  @Field(() => Series, { nullable: true })
  @IsOptional()
  series: Series | null;
}
