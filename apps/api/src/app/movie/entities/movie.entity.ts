import { Field, Int, ObjectType, OmitType } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { MovieModel } from "../../../../prisma/generated/models";

@ObjectType()
export class Movie
  extends OmitType(Content, ["type"] as const)
  implements Partial<MovieModel>
{
  @Field({ nullable: true })
  streamId: string | null;

  @Field({
    nullable: true,
    description: "Average rating from user reviews (0–10)"
  })
  userRating?: number | null;

  @Field(() => Int, { nullable: true })
  reviewCount?: number | null;
}
