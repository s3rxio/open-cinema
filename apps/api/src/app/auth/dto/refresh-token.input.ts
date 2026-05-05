import { InputType, Field } from "@nestjs/graphql";
import { IsJWT } from "class-validator";

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsJWT()
  refreshToken: string;
}
