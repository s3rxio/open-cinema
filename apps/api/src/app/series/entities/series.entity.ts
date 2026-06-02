import { ObjectType, Field, OmitType } from "@nestjs/graphql";
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
}
