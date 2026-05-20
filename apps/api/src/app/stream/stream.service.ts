import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3StorageService } from "../storage/s3-storage.service";
import { MediaQueueService } from "../media-processing/services/media-queue.service";
import { ProcessingType } from "../media-processing/types";
import { Stream } from "./entities/stream.entity";
import { CreateStreamInput } from "./dto/create-stream.input";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { UploadAudioInput } from "./dto/upload-audio.input";
import { UploadVideoInput } from "./dto/upload-video.input";
import { UploadSubtitleInput } from "./dto/upload-subtitle.input";
import { AudioMeta } from "./entities/audio-meta.entity";
import { mkdir, rm, writeFile } from "fs/promises";
import { VideoMeta } from "./entities/video-meta.entity";
import { SubtitleMeta } from "./entities/subtitle-meta.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StreamService {
  private logger = new Logger(StreamService.name);

  constructor(
    private prisma: PrismaService,
    private s3Storage: S3StorageService,
    private mediaQueue: MediaQueueService,
    private configService: ConfigService
  ) {}

  async getStreamInfo(streamId: string): Promise<Stream> {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        videoMetas: true,
        audioMetas: true,
        subtitleMetas: true
      }
    });

    if (!stream) {
      throw new NotFoundException(`Stream ${streamId} not found`);
    }

    const bucket = this.configService.getOrThrow("s3.bucket");

    // Get signed URLs for all metas
    stream.videoMetas.forEach(async (meta, i) => {
      let url = "";
      try {
        url = await this.s3Storage.getSignedUrl({
          bucket,
          key: meta.url
        });
        stream.videoMetas[i].url = url;
      } catch (e) {
        this.logger.error(e);
      }
    });

    stream.audioMetas.forEach(async (meta, i) => {
      let url = "";
      try {
        url = await this.s3Storage.getSignedUrl({
          bucket,
          key: meta.url
        });
        stream.audioMetas[i].url = url;
      } catch (e) {
        this.logger.error(e);
      }
    });

    stream.subtitleMetas.forEach(async (meta, i) => {
      let url = "";
      try {
        url = await this.s3Storage.getSignedUrl({
          bucket,
          key: meta.url
        });
        stream.subtitleMetas[i].url = url;
      } catch (e) {
        this.logger.error(e);
      }
    });

    let masterPlaylistUrl: string | null = null;
    try {
      masterPlaylistUrl = await this.s3Storage.getSignedUrl({
        bucket,
        key: `${streamId}/master.m3u8`
      });
    } catch (e) {
      this.logger.error(e);
      masterPlaylistUrl = null;
    }

    return {
      ...stream,
      masterPlaylistUrl
    };
  }

  async createStream(input: CreateStreamInput): Promise<Stream> {
    const content = await this.getMovieOrEpisodeWithRelationName(
      input.contentId
    );

    const stream = await this.prisma.stream.create({
      data: {
        [content.relationName]: {
          connect: {
            id: input.contentId
          }
        }
      }
    });

    return this.getStreamInfo(stream.id);
  }

  async generateMaster(streamId: string) {
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        videoMetas: true,
        audioMetas: true,
        subtitleMetas: true
      }
    });

    if (!stream) {
      throw new NotFoundException(`Stream ${streamId} not found`);
    }

    const tempDir = await this.createTempDirectory(
      streamId,
      "master",
      ProcessingType.VIDEO
    );

    const masterPlaylistPath = join(tempDir, "master.m3u8");

    await this.generateMasterPlaylist(
      masterPlaylistPath,
      stream.videoMetas,
      stream.audioMetas,
      stream.subtitleMetas
    );

    const bucket = this.configService.getOrThrow("s3.bucket");

    await this.s3Storage.uploadFile({
      bucket,
      key: `${streamId}/master.m3u8`,
      filePath: masterPlaylistPath
    });

    await rm(tempDir, {
      recursive: true,
      force: true
    });

    return await this.s3Storage.getSignedUrl({
      bucket,
      key: `${streamId}/master.m3u8`
    });
  }

  async uploadVideo(uploadVideoInput: UploadVideoInput): Promise<string> {
    const { streamId, file } = uploadVideoInput;

    const resultFile = await file;
    const tempDir = await this.createTempDirectory(
      streamId,
      Date.now().toString(),
      ProcessingType.VIDEO
    );

    const tempFilePath = join(tempDir, resultFile.filename);
    const outputDir = join(tempDir, "processed");

    await pipeline(
      resultFile.createReadStream(),
      createWriteStream(tempFilePath)
    );

    this.uploadAudio(
      {
        slug: "source",
        displayName: "Source",
        isDefault: true,
        orderNumer: 0,
        streamId
      },
      tempFilePath
    );

    this.mediaQueue.enqueueVideoProcessing({
      inputPath: tempFilePath,
      outputPath: outputDir,
      streamId: streamId,
      type: ProcessingType.VIDEO
    });

    return "Uploaded. Video processing...";
  }

  async uploadAudio(
    uploadAudioInput: UploadAudioInput,
    uploadedFilePath?: string
  ): Promise<AudioMeta> {
    const { streamId, slug, displayName, orderNumer, isDefault, file } =
      uploadAudioInput;

    const audioMeta = await this.prisma.audioMeta.create({
      data: {
        slug,
        displayName,
        isDefault,
        orderNumer,
        url: "processing",
        bitrate: 0,
        stream: {
          connect: {
            id: streamId
          }
        }
      }
    });

    const tempDir = await this.createTempDirectory(
      streamId,
      audioMeta.id,
      ProcessingType.AUDIO
    );
    const outputDir = join(tempDir, "processed");
    let tempFilePath: string = "";

    if (file && !uploadedFilePath) {
      const resultFile = await file;

      tempFilePath = join(tempDir, resultFile.filename);

      await pipeline(
        resultFile.createReadStream(),
        createWriteStream(tempFilePath)
      );
    } else if (!file && uploadedFilePath) {
      tempFilePath = uploadedFilePath;
    } else {
      throw new Error("file and uploadedFilePath is undefined or null");
    }

    this.mediaQueue.enqueueAudioProcessing({
      inputPath: tempFilePath,
      outputPath: outputDir,
      metaId: audioMeta.id,
      type: ProcessingType.AUDIO
    });

    return audioMeta;
  }

  async uploadSubtitle(
    uploadSubtitleInput: UploadSubtitleInput
  ): Promise<SubtitleMeta> {
    const { streamId, slug, displayName, orderNumer, file } =
      uploadSubtitleInput;

    const subtitleMeta = await this.prisma.subtitleMeta.create({
      data: {
        slug,
        displayName,
        orderNumer,
        url: "processing",
        stream: {
          connect: {
            id: streamId
          }
        }
      }
    });

    const resultFile = await file;
    const tempDir = await this.createTempDirectory(
      streamId,
      subtitleMeta.id,
      ProcessingType.SUBTITLE
    );

    const tempFilePath = join(tempDir, resultFile.filename);
    const outputDir = join(tempDir, "processed");

    await pipeline(
      resultFile.createReadStream(),
      createWriteStream(tempFilePath)
    );

    this.mediaQueue.enqueueSubtitleProcessing({
      inputPath: tempFilePath,
      outputPath: outputDir,
      metaId: subtitleMeta.id,
      type: ProcessingType.SUBTITLE
    });

    return subtitleMeta;
  }

  async createTempDirectory(
    streamId: string,
    metaId: string,
    type: ProcessingType
  ): Promise<string> {
    const tempDir = join(
      tmpdir(),
      `stream-${streamId}-${type}-${metaId}-${Date.now()}`
    );
    await mkdir(tempDir, { recursive: true });

    return tempDir;
  }

  async getMovieOrEpisodeWithRelationName(id: string) {
    type RelationName = "movie" | "episodes";

    const movie = await this.prisma.movie.findUnique({
      where: {
        id: id
      }
    });

    if (!movie) {
      const episode = await this.prisma.episode.findUnique({
        where: {
          id: id
        }
      });

      if (!episode) {
        throw new NotFoundException("Content not found");
      }

      return {
        data: episode,
        relationName: "episodes" as RelationName
      };
    }

    return {
      data: movie,
      relationName: "movies" as RelationName
    };
  }

  /* Master playlist generation */
  async generateMasterPlaylist(
    outputPath: string,
    videoMetas: VideoMeta[],
    audioMetas: AudioMeta[],
    subtitleMetas: SubtitleMeta[]
  ): Promise<string> {
    try {
      let masterContent = "#EXTM3U\n";
      masterContent += "#EXT-X-VERSION:6\n\n";

      // Группируем аудио дорожки по качеству/битрейту
      const audioGroups = this.groupAudioStreams(audioMetas);

      // Группируем субтитры
      const subtitleGroups = this.groupSubtitles(subtitleMetas);

      // Добавляем информацию о группах в манифест
      if (audioGroups.size > 0) {
        masterContent += this.generateAudioGroupTag(audioGroups);
      }

      if (subtitleGroups.size > 0) {
        masterContent += this.generateSubtitleGroupTag(subtitleGroups);
      }

      masterContent += "\n";

      // Добавляем каждую видео дорожку с соответствующими аудио и субтитрами
      for (const video of videoMetas) {
        masterContent += this.generateVideoStreamTag(
          video,
          audioGroups,
          subtitleGroups
        );
        masterContent += this.generateVideoStreamInfo(video);
      }

      // Сохраняем файл
      await this.saveMasterPlaylist(outputPath, masterContent);

      this.logger.debug(
        `Master playlist generated successfully at: ${outputPath}`
      );
      return masterContent;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to generate master playlist: ${error.message}`
        );
      }

      throw error;
    }
  }

  /**
   * Группирует аудио дорожки
   */
  private groupAudioStreams(audioMetas: AudioMeta[]): Map<string, AudioMeta[]> {
    const groups = new Map<string, AudioMeta[]>();

    // for (const audio of audioMetas) {
    //   const groupId = `audio-${audio.bitrate}`;
    //   if (!groups.has(groupId)) {
    //     groups.set(groupId, []);
    //   }
    //   groups.get(groupId)?.push(audio);
    // }

    // return groups;

    groups.set("audio-0", audioMetas);

    return groups;
  }

  /**
   * Группирует субтитры
   */
  private groupSubtitles(
    subtitleMetas: SubtitleMeta[]
  ): Map<string, SubtitleMeta[]> {
    const groups = new Map<string, SubtitleMeta[]>();

    // for (const subtitle of subtitleMetas) {
    //   const groupId = `subs-0`;
    //   if (!groups.has(groupId)) {
    //     groups.set(groupId, []);
    //   }
    //   groups.get(groupId)?.push(subtitle);
    // }

    groups.set("subtitles-0", subtitleMetas);

    return groups;
  }

  /**
   * Генерирует тэг EXT-X-MEDIA для аудио групп
   */
  private generateAudioGroupTag(audioGroups: Map<string, AudioMeta[]>): string {
    let tags = "";

    for (const [groupId, audios] of audioGroups) {
      for (const audio of audios) {
        tags += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${groupId}",`;
        tags += `NAME="${audio.displayName}",`;
        tags += `LANGUAGE="${audio.slug}",`;
        tags += `AUTOSELECT=YES,`;
        tags += `DEFAULT=${audio.isDefault ? "YES" : "NO"},`;
        tags += `URI="${this.normalizeS3Key(audio.url)}"\n`;
      }
    }

    return tags;
  }

  /**
   * Генерирует тэг EXT-X-MEDIA для субтитров
   */
  private generateSubtitleGroupTag(
    subtitleGroups: Map<string, SubtitleMeta[]>
  ): string {
    let tags = "";

    for (const [groupId, subtitles] of subtitleGroups) {
      for (const subtitle of subtitles) {
        tags += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="${groupId}",`;
        tags += `NAME="${subtitle.displayName}",`;
        tags += `LANGUAGE="${subtitle.slug}",`;
        tags += `URI="${this.normalizeS3Key(subtitle.url)}"\n`;
      }
    }

    return tags;
  }

  /**
   * Генерирует тэг видео потока с аудио и субтитрами
   */
  private generateVideoStreamTag(
    video: VideoMeta,
    audioGroups: Map<string, AudioMeta[]>,
    subtitleGroups: Map<string, SubtitleMeta[]>
  ): string {
    let tag = `#EXT-X-STREAM-INF:BANDWIDTH=${video.bitrate},`;
    tag += `RESOLUTION=${video.width}x${video.height},`;
    // tag += `CODECS="avc1.4d0029,mp4a.40.2",`;

    // Добавляем аудио группы
    if (audioGroups.size > 0) {
      const audioGroupIds = Array.from(audioGroups.keys()).join(",");
      tag += `AUDIO="${audioGroupIds.split(",")[0]}",`;
    }

    // Добавляем группы субтитров
    if (subtitleGroups.size > 0) {
      const subtitleGroupIds = Array.from(subtitleGroups.keys()).join(",");
      tag += `SUBTITLES="${subtitleGroupIds.split(",")[0]}"`;
    }

    return tag + "\n";
  }

  /**
   * Генерирует информацию о видео потоке
   */
  private generateVideoStreamInfo(video: VideoMeta): string {
    return `${this.normalizeS3Key(video.url)}\n\n`;
  }

  private normalizeS3Key(url: string): string {
    const urlParts = url.split("/");
    urlParts.shift();

    return urlParts.join("/");
  }

  /**
   * Сохраняет master playlist файл
   */
  private async saveMasterPlaylist(
    outputPath: string,
    content: string
  ): Promise<void> {
    // Создаем директорию если её нет
    const dir = dirname(outputPath);
    await mkdir(dir, { recursive: true });

    // Сохраняем файл
    await writeFile(outputPath, content, "utf-8");
  }
}
