import { Module } from "@nestjs/common";
import { S3StorageService } from "./s3-storage.service";
import { S3Module } from "nestjs-s3";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [S3Module, ConfigModule],
  providers: [S3StorageService],
  exports: [S3StorageService]
})
export class StorageModule {}
