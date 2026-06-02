import { InputType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString, Max, Min } from "class-validator";

@InputType()
export class CreateContentInput {
  @Field()
  @IsString()
  title: string;

  @Field()
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
}
