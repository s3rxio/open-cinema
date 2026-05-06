import { IsString } from "class-validator";
import { CreateEpisodeInput } from "./create-episode.input";
import { InputType, Field, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateEpisodeInput extends PartialType(CreateEpisodeInput) {
  @Field()
  @IsString()
  id: string;
}
