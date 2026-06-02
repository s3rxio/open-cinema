import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Role {
  @Field()
  slug: string;

  @Field()
  name: string;
}
