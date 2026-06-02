import { InputType, Field, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";
import { CreateContentInput } from "../../content/dto/create-content.input";

@InputType()
export class CreateEpisodeInput extends CreateContentInput {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  season: number;

  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  episode: number;

  @Field()
  @IsString()
  seriesId: string;
}
