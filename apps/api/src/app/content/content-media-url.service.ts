import { Injectable } from "@nestjs/common";
import { S3StorageService } from "../storage/s3-storage.service";

type MediaFields = {
  posterUrl?: string | null;
  bannerUrl?: string | null;
};

@Injectable()
export class ContentMediaUrlService {
  constructor(private readonly s3Storage: S3StorageService) {}

  withPublicUrls<T extends MediaFields>(entity: T): T {
    return {
      ...entity,
      posterUrl: this.s3Storage.resolvePublicMediaUrl(entity.posterUrl),
      bannerUrl: this.s3Storage.resolvePublicMediaUrl(entity.bannerUrl)
    };
  }
}
