import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BaseEntity {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt: Date | null;
}
