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
import { UpdateVideoMetaInput } from "./dto/update-video-meta.input";
import { UpdateAudioMetaInput } from "./dto/update-audio-meta.input";
import { UpdateSubtitleMetaInput } from "./dto/update-subtitle-meta.input";
import { VideoMeta } from "./entities/video-meta.entity";
import { Permission, RequiredPermission } from "../rbac";

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

  @BypassAuth()
  @Query(() => Stream, {
    description:
      "Get stream for a movie or episode by content id (same id as createStream)"
  })
  async getStreamForContent(@Args("contentId") contentId: string) {
    return this.streamService.getStreamForContent(contentId);
  }

  @BypassAuth()
  @Query(() => Stream, {
    description: "Get stream for a movie by movie id"
  })
  async getStreamForMovie(@Args("movieId") movieId: string) {
    return this.streamService.getStreamForMovie(movieId);
  }

  @BypassAuth()
  @Query(() => Stream, {
    description: "Get stream for an episode by episode id"
  })
  async getStreamForEpisode(@Args("episodeId") episodeId: string) {
    return this.streamService.getStreamForEpisode(episodeId);
  }

  @RequiredPermission(Permission.StreamCreate)
  @Mutation(() => Stream, {
    description: "Create a new stream"
  })
  async createStream(
    @Args("createStreamInput") createStreamInput: CreateStreamInput
  ) {
    return this.streamService.createStream(createStreamInput);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => String, {
    description: "Generates m3u8 master playlist"
  })
  async generateMaster(@Args("streamId") streamId: string) {
    return this.streamService.generateMaster(streamId);
  }

  @RequiredPermission(Permission.StreamUpload)
  @Mutation(() => String, {
    description: "Upload and process video file"
  })
  async uploadVideo(
    @Args("uploadVideoInput") uploadVideoInput: UploadVideoInput
  ) {
    return this.streamService.uploadVideo(uploadVideoInput);
  }

  @RequiredPermission(Permission.StreamUpload)
  @Mutation(() => AudioMeta, {
    description: "Upload and process audio file"
  })
  async uploadAudio(
    @Args("uploadAudioInput") uploadAudioInput: UploadAudioInput
  ) {
    return this.streamService.uploadAudio(uploadAudioInput);
  }

  @RequiredPermission(Permission.StreamUpload)
  @Mutation(() => SubtitleMeta, {
    description: "Upload and process subtitle file"
  })
  async uploadSubtitle(
    @Args("uploadSubtitleInput") uploadSubtitleInput: UploadSubtitleInput
  ) {
    return this.streamService.uploadSubtitle(uploadSubtitleInput);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => VideoMeta, { description: "Update video track metadata" })
  async updateVideoMeta(
    @Args("updateVideoMetaInput") updateVideoMetaInput: UpdateVideoMetaInput
  ) {
    return this.streamService.updateVideoMeta(updateVideoMetaInput);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => AudioMeta, { description: "Update audio track metadata" })
  async updateAudioMeta(
    @Args("updateAudioMetaInput") updateAudioMetaInput: UpdateAudioMetaInput
  ) {
    return this.streamService.updateAudioMeta(updateAudioMetaInput);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => SubtitleMeta, {
    description: "Update subtitle track metadata"
  })
  async updateSubtitleMeta(
    @Args("updateSubtitleMetaInput")
    updateSubtitleMetaInput: UpdateSubtitleMetaInput
  ) {
    return this.streamService.updateSubtitleMeta(updateSubtitleMetaInput);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => Boolean, { description: "Delete video track" })
  async removeVideoMeta(@Args("id") id: string) {
    return this.streamService.removeVideoMeta(id);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => Boolean, { description: "Delete audio track" })
  async removeAudioMeta(@Args("id") id: string) {
    return this.streamService.removeAudioMeta(id);
  }

  @RequiredPermission(Permission.StreamManage)
  @Mutation(() => Boolean, { description: "Delete subtitle track" })
  async removeSubtitleMeta(@Args("id") id: string) {
    return this.streamService.removeSubtitleMeta(id);
  }
}
