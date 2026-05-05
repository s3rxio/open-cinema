import { ObjectType, Field } from "@nestjs/graphql";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class TokenPair {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
