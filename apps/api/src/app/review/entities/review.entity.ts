import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { ReviewModel } from "../../../../prisma/generated/models";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class Review extends BaseEntity implements Partial<ReviewModel> {
  @Field()
  content: string;

  @Field()
  rating: number;

  @Field()
  userId: string;

  @Field({ nullable: true })
  movieId: string | null;

  @Field({ nullable: true })
  seriesId: string | null;

  @Field(() => User, { nullable: true })
  user?: User | null;
}
