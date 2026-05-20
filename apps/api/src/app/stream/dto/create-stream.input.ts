import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CreateStreamInput {
  @Field()
  @IsString()
  @IsOptional()
  contentId: string;
}
