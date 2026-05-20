import { VideoMetaModel } from "../../../../prisma/generated/models";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VideoMeta implements VideoMetaModel {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  displayName: string;

  @Field()
  url: string;

  @Field(() => Int)
  bitrate: number;

  @Field(() => Int)
  width: number;

  @Field(() => Int)
  height: number;

  @Field()
  streamId: string;

  @Field()
  isProcessed: boolean;
}
