import { Field, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from "class-validator";

@InputType()
export class CreateEpisodesBulkInput {
  @Field()
  @IsString()
  seriesId: string;

  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  season: number;

  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  count: number;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  startEpisode?: number;

  @Field({ defaultValue: "" })
  @IsString()
  description: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  releaseDate: Date;

  @Field()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  titlePrefix?: string;
}
