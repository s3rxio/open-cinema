import { Exclude } from "class-transformer";
import { AudioMetaModel } from "../../../../prisma/generated/models";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AudioMeta implements AudioMetaModel {
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

  @Field(() => Int)
  bitrate: number;

  @Field(() => Boolean)
  isDefault: boolean;

  @Field()
  @Exclude()
  isProcessed: boolean;

  @Field()
  streamId: string;
}
