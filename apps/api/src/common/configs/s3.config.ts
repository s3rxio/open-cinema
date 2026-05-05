import { registerAs } from "@nestjs/config";
import { S3ModuleOptions } from "nestjs-s3";

const S3_CONFIG_KEY = "s3";

const s3Config = registerAs(
  S3_CONFIG_KEY,
  (): S3Config => ({
    config: {
      credentials: {
        accessKeyId: process.env.API_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.API_S3_SECRET_ACCESS_KEY
      },
      region: process.env.API_S3_REGION,
      endpoint: process.env.API_S3_ENDPOINT,
      forcePathStyle: true
    },
    bucket: process.env.API_S3_BUCKET
  })
);

export type S3Config = S3ModuleOptions & {
  bucket: string;
};
export default s3Config;
