import { InputType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CreateContentInput } from "../../content/dto/create-content.input";

@InputType()
export class CreateSeriesInput extends CreateContentInput {
  @Field()
  @IsString()
  genre: string;

  @Field()
  @IsString()
  director: string;
}
