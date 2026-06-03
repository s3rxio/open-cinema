import { Field, InputType } from "@nestjs/graphql";
import { IsString, MinLength } from "class-validator";

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  currPass: string;

  @Field()
  @IsString()
  @MinLength(6)
  newPass: string;

  @Field()
  @IsString()
  @MinLength(6)
  confirmNewPass: string;
}
