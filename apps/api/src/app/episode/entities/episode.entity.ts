import { ObjectType, Field, Int, OmitType } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { EpisodeModel } from "../../../../prisma/generated/models";

@ObjectType()
export class Episode
  extends OmitType(Content, ["genre", "director"] as const)
  implements Partial<EpisodeModel>
{
  @Field(() => Int)
  season: number;

  @Field(() => Int)
  episode: number;

  @Field()
  seriesId: string;
}
