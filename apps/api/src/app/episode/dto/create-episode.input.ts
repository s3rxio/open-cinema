import { InputType, Field, Int } from "@nestjs/graphql";
import { IsString, IsInt, Min } from "class-validator";
import { CreateContentInput } from "../../content/dto/create-content.input";

@InputType()
export class CreateEpisodeInput extends CreateContentInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  season: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  episode: number;

  @Field()
  @IsString()
  seriesId: string;
}
