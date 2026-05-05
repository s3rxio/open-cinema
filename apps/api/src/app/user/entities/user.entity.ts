import { ObjectType, Field } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { UserModel } from "../../../../prisma/generated/models";

@ObjectType()
export class User
  extends BaseEntity
  implements Partial<Omit<UserModel, "password" | "refreshToken">>
{
  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  birthdate: Date | null;
}
