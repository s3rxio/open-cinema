import { InputType, Field, Int } from "@nestjs/graphql";
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsIn
} from "class-validator";

@InputType()
export class SearchContentInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  query?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  take?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  minRating?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  maxRating?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsIn(["title", "releaseDate", "rating"])
  sortBy?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  genre?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contentType?: "MOVIE" | "SERIES" | "EPISODE";
}
