import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, ValidateIf } from "class-validator";

@InputType()
export class CreateFavoriteInput {
  @Field()
  @IsString()
  userId: string;

  @Field({ nullable: true })
  @IsString()
  @ValidateIf(o => o.movieId !== undefined)
  movieId?: string;

  @Field({ nullable: true })
  @IsString()
  @ValidateIf(o => o.seriesId !== undefined)
  seriesId?: string;
}
