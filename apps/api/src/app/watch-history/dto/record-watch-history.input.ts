import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf
} from "class-validator";

@InputType()
export class RecordWatchHistoryInput {
  @Field()
  @IsString()
  userId: string;

  @Field({ nullable: true })
  @IsString()
  @ValidateIf(o => o.movieId !== undefined)
  movieId?: string;

  @Field({ nullable: true })
  @IsString()
  @ValidateIf(o => o.episodeId !== undefined)
  episodeId?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  progress: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
