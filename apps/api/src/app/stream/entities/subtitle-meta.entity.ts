import { Exclude } from "class-transformer";
import { SubtitleMetaModel } from "../../../../prisma/generated/models";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SubtitleMeta implements SubtitleMetaModel {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  displayName: string;

  @Field()
  url: string;

  @Field()
  orderNumer: number;

  @Field()
  @Exclude()
  isProcessed: boolean;

  @Field()
  streamId: string;
}
