import { ObjectType, Field, Int, OmitType } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { SeriesModel } from "../../../../prisma/generated/models";
import { Episode } from "../../episode/entities/episode.entity";

@ObjectType()
export class Series
  extends OmitType(Content, ["type"] as const)
  implements Partial<SeriesModel>
{
  @Field(() => [Episode], { nullable: true })
  episodes?: Episode[];

  @Field({
    nullable: true,
    description: "Average rating from user reviews (0–10)"
  })
  userRating?: number | null;

  @Field(() => Int, { nullable: true })
  reviewCount?: number | null;
}
