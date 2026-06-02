import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsOptional, Min } from "class-validator";
import { RecordWatchHistoryInput } from "./record-watch-history.input";

@InputType()
export class UpdateWatchHistoryInput extends PartialType(
  RecordWatchHistoryInput
) {
  @Field()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  progress?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
