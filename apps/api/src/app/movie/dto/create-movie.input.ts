import { InputType, Field } from "@nestjs/graphql";
import { IsArray, IsEnum, IsString } from "class-validator";
import { CreateContentInput } from "../../content/dto/create-content.input";
import { Genre } from "../../content/genre.enum";

@InputType()
export class CreateMovieInput extends CreateContentInput {
  @Field(() => [Genre])
  @IsArray()
  @IsEnum(Genre, { each: true })
  genres: Genre[];

  @Field()
  @IsString()
  director: string;
}
