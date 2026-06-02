import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf
} from "class-validator";

@InputType()
export class CreateReviewInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  @MinLength(1)
  content: string;

  @Field()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf(o => o.movieId !== undefined)
  movieId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @ValidateIf(o => o.seriesId !== undefined)
  seriesId?: string;
}
