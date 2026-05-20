import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { StreamService } from "./stream.service";
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Stream } from "./entities/stream.entity";
import { UploadVideoInput } from "./dto/upload-video.input";
import { UploadAudioInput } from "./dto/upload-audio.input";
import { UploadSubtitleInput } from "./dto/upload-subtitle.input";
import { AudioMeta } from "./entities/audio-meta.entity";
import { SubtitleMeta } from "./entities/subtitle-meta.entity";
import { CreateStreamInput } from "./dto/create-stream.input";

@Resolver()
export class StreamResolver {
  constructor(private streamService: StreamService) {}

  @BypassAuth()
  @Query(() => Stream, {
    description: "Get stream information with all metas and signed URLs"
  })
  async getStreamInfo(@Args("streamId") streamId: string) {
    return this.streamService.getStreamInfo(streamId);
  }

  @Mutation(() => Stream, {
    description: "Create a new stream"
  })
  async createStream(
    @Args("createStreamInput") createStreamInput: CreateStreamInput
  ) {
    return this.streamService.createStream(createStreamInput);
  }

  @Mutation(() => String, {
    description: "Generates m3u8 master playlist"
  })
  async generateMaster(@Args("streamId") streamId: string) {
    return this.streamService.generateMaster(streamId);
  }

  @Mutation(() => String, {
    description: "Upload and process video file"
  })
  async uploadVideo(
    @Args("uploadVideoInput") uploadVideoInput: UploadVideoInput
  ) {
    return this.streamService.uploadVideo(uploadVideoInput);
  }

  @Mutation(() => AudioMeta, {
    description: "Upload and process audio file"
  })
  async uploadAudio(
    @Args("uploadAudioInput") uploadAudioInput: UploadAudioInput
  ) {
    return this.streamService.uploadAudio(uploadAudioInput);
  }

  @Mutation(() => SubtitleMeta, {
    description: "Upload and process subtitle file"
  })
  async uploadSubtitle(
    @Args("uploadSubtitleInput") uploadSubtitleInput: UploadSubtitleInput
  ) {
    return this.streamService.uploadSubtitle(uploadSubtitleInput);
  }
}
