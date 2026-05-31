import { InputType, Field, PartialType } from "@nestjs/graphql";
import { CreateFavoriteInput } from "./create-favorite.input";

@InputType()
export class UpdateFavoriteInput extends PartialType(CreateFavoriteInput) {
  @Field()
  id: string;
}
