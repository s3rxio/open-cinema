import { BullModuleOptions, BullRootModuleOptions } from "@nestjs/bull";
import { registerAs } from "@nestjs/config";

const BULL_CONFIG_KEY = "bull";

const bullConfig = registerAs(
  BULL_CONFIG_KEY,
  (): BullConfig => ({
    redis: {
      host: process.env.API_REDIS_HOST || "localhost",
      port: process.env.API_REDIS_PORT || 6379,
      password: process.env.API_REDIS_PASSWORD,
      db: 0
    }
  })
);

export type BullConfig = BullRootModuleOptions;
export default bullConfig;

export const bullQueueOptions: BullModuleOptions[] = [
  {
    name: "video-processing",
    redis: {
      host: process.env.API_REDIS_HOST || "localhost",
      port: process.env.API_REDIS_PORT || 6379,
      password: process.env.API_REDIS_PASSWORD
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      }
    }
  },
  {
    name: "audio-processing",
    redis: {
      host: process.env.API_REDIS_HOST || "localhost",
      port: process.env.API_REDIS_PORT || 6379,
      password: process.env.API_REDIS_PASSWORD
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      }
    }
  },
  {
    name: "subtitle-processing",
    redis: {
      host: process.env.API_REDIS_HOST || "localhost",
      port: process.env.API_REDIS_PORT || 6379,
      password: process.env.API_REDIS_PASSWORD
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      }
    }
  }
];
