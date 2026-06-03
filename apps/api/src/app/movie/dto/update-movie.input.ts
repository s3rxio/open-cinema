import { IsBoolean, IsOptional, IsString } from "class-validator";
import { CreateMovieInput } from "./create-movie.input";
import { InputType, Field, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateMovieInput extends PartialType(CreateMovieInput) {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
