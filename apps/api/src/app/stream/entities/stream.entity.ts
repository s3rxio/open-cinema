import { BaseEntity } from "@open-cinema/core";
import { StreamModel } from "../../../../prisma/generated/models";
import { ObjectType, Field } from "@nestjs/graphql";
import { VideoMeta } from "./video-meta.entity";
import { AudioMeta } from "./audio-meta.entity";
import { SubtitleMeta } from "./subtitle-meta.entity";

@ObjectType()
export class Stream extends BaseEntity implements StreamModel {
  @Field(() => [VideoMeta])
  videoMetas: VideoMeta[];

  @Field(() => [AudioMeta])
  audioMetas: AudioMeta[];

  @Field(() => [SubtitleMeta])
  subtitleMetas: SubtitleMeta[];

  @Field({ nullable: true })
  masterPlaylistUrl: string | null;
}
