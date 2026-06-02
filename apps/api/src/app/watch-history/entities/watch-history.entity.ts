import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { WatchHistoryModel } from "../../../../prisma/generated/models";
import { IsOptional } from "class-validator";
import { Episode } from "../../episode/entities/episode.entity";
import { Movie } from "../../movie/entities/movie.entity";

@ObjectType()
export class WatchHistory
  extends BaseEntity
  implements Partial<WatchHistoryModel>
{
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => Int)
  progress: number;

  @Field(() => Int, { nullable: true })
  duration: number | null;

  @Field()
  completed: boolean;

  @Field(() => Movie, { nullable: true })
  @IsOptional()
  movie: Movie | null;

  @Field(() => Episode, { nullable: true })
  @IsOptional()
  episode: Episode | null;
}
