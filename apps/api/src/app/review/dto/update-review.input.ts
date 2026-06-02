import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateReviewInput } from "./create-review.input";
import { IsString } from "class-validator";

@InputType()
export class UpdateReviewInput extends PartialType(CreateReviewInput) {
  @Field()
  @IsString()
  id: string;
}
