import { Injectable } from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import { readdir, readFile } from "fs/promises";
import {
  S3UploadFolderOptions,
  S3UploadOptions,
  SignedUrlOptions
} from "./s3-storage.types";
import { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { join } from "path";

@Injectable()
export class S3StorageService {
  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService
  ) {}

  async uploadFile(options: S3UploadOptions): Promise<string> {
    const { bucket, key, filePath, contentType, retries = 3 } = options;
    const s3Endpoint = this.configService.getOrThrow("s3.config.endpoint");

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const fileContent = await readFile(filePath);

        await this.s3.putObject({
          Bucket: bucket,
          Key: key,
          Body: fileContent,
          ContentType: contentType
        });

        return `https://${s3Endpoint}/${bucket}/${key}`;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(
            `S3 upload failed after ${retries} attempts: ${(error as Error).message}`
          );
        }
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error("S3 upload failed");
  }

  async uploadFolder(options: S3UploadFolderOptions): Promise<string[]> {
    const { folderKey, folderPath, ...restOptions } = options;

    const files = await readdir(folderPath);
    const promises = files.map(file =>
      this.uploadFile({
        ...restOptions,
        filePath: join(folderPath, file),
        key: join(folderKey, file)
      })
    );

    return Promise.all(promises);
  }

  async getSignedUrl(options: SignedUrlOptions): Promise<string> {
    const { bucket, key, expiresIn = 86400 } = options; // Default 24 hours

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const url = await getSignedUrl(this.s3, command, { expiresIn });
      return url;
    } catch (error) {
      throw new Error(
        `Failed to generate signed URL: ${(error as Error).message}`
      );
    }
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: bucket,
        Key: key
      });
    } catch (error) {
      throw new Error(`S3 delete failed: ${(error as Error).message}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
