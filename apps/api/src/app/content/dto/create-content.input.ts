import { InputType, Field } from "@nestjs/graphql";
import { IsDateString, IsNumber, IsString, Min, Max } from "class-validator";

@InputType()
export class CreateContentInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsDateString()
  releaseDate: Date;

  @Field()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;
}
