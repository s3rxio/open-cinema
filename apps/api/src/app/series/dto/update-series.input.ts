import { IsString } from "class-validator";
import { CreateSeriesInput } from "./create-series.input";
import { InputType, Field, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateSeriesInput extends PartialType(CreateSeriesInput) {
  @Field()
  @IsString()
  id: string;
}
