import { ObjectType, Field } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { SeriesModel } from "../../../../prisma/generated/models";
import { Episode } from "../../episode/entities/episode.entity";

@ObjectType()
export class Series extends Content implements Partial<SeriesModel> {
  @Field()
  genre: string;

  @Field()
  director: string;

  @Field(() => [Episode], { nullable: true })
  episodes?: Episode[];
}
