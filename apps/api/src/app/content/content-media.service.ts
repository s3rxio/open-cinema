import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import { extname } from "path";
import { join } from "path";
import { tmpdir } from "os";
import { pipeline } from "stream/promises";
import { FileUpload } from "graphql-upload-ts";
import { PrismaService } from "../prisma/prisma.service";
import { S3StorageService } from "../storage/s3-storage.service";
import { Content } from "./content.entity";
import { ContentService } from "./content.service";
import { ContentType } from "./content.types";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

type ImageKind = "poster" | "banner";

@Injectable()
export class ContentMediaService {
  private readonly logger = new Logger(ContentMediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentService: ContentService,
    private readonly s3Storage: S3StorageService,
    private readonly configService: ConfigService
  ) {}

  async uploadPoster(
    contentId: string,
    file: Promise<FileUpload>
  ): Promise<Content> {
    return this.uploadImage(contentId, "poster", file);
  }

  async uploadBanner(
    contentId: string,
    file: Promise<FileUpload>
  ): Promise<Content> {
    return this.uploadImage(contentId, "banner", file);
  }

  private async uploadImage(
    contentId: string,
    kind: ImageKind,
    filePromise: Promise<FileUpload>
  ): Promise<Content> {
    const contentType = await this.resolveContentType(contentId);
    const upload = await filePromise;

    if (!ALLOWED_IMAGE_MIMES.has(upload.mimetype)) {
      throw new BadRequestException(
        "Допустимы только изображения: JPEG, PNG, WebP, GIF"
      );
    }

    const extension = this.resolveExtension(upload);
    const tempDir = join(
      tmpdir(),
      `content-${contentId}-${kind}-${Date.now()}`
    );
    await mkdir(tempDir, { recursive: true });
    const tempFilePath = join(tempDir, upload.filename);

    try {
      await pipeline(
        upload.createReadStream(),
        createWriteStream(tempFilePath)
      );

      const bucket = this.configService.getOrThrow("s3.bucket");
      const key = `content/${contentId}/${kind}.${extension}`;
      await this.s3Storage.uploadFile({
        bucket,
        key,
        filePath: tempFilePath,
        contentType: upload.mimetype
      });

      const data = kind === "poster" ? { posterUrl: key } : { bannerUrl: key };

      if (contentType === ContentType.MOVIE) {
        await this.prisma.movie.update({
          where: { id: contentId },
          data
        });
      } else {
        await this.prisma.series.update({
          where: { id: contentId },
          data
        });
      }

      const updated = await this.contentService.getContentById(contentId);
      if (!updated) {
        throw new NotFoundException(`Content ${contentId} not found`);
      }

      return updated;
    } catch (error) {
      this.logger.error(error);
      throw error;
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(
        () => undefined
      );
    }
  }

  private async resolveContentType(contentId: string): Promise<ContentType> {
    const movie = await this.prisma.movie.findUnique({
      where: { id: contentId },
      select: { id: true }
    });

    if (movie) {
      return ContentType.MOVIE;
    }

    const series = await this.prisma.series.findUnique({
      where: { id: contentId },
      select: { id: true }
    });

    if (series) {
      return ContentType.SERIES;
    }

    throw new NotFoundException(`Content ${contentId} not found`);
  }

  private resolveExtension(upload: FileUpload): string {
    const fromMime = MIME_EXTENSIONS[upload.mimetype];
    if (fromMime) {
      return fromMime;
    }

    const fromName = extname(upload.filename).replace(/^\./, "").toLowerCase();
    if (fromName) {
      return fromName;
    }

    return "jpg";
  }
}
