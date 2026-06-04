import { Field, InputType } from "@nestjs/graphql";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

@InputType()
export class EpisodesBulkIdsInput {
  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids: string[];
}
