import { ObjectCannedACL } from "@aws-sdk/client-s3";

export interface S3UploadOptions {
  bucket: string;
  key: string;
  filePath: string;
  contentType?: string;
  retries?: number;
  acl?: ObjectCannedACL;
}

export interface S3UploadFolderOptions {
  bucket: string;
  folderKey: string;
  folderPath: string;
  retries?: number;
}

export interface SignedUrlOptions {
  bucket: string;
  key: string;
  expiresIn?: number;
}
