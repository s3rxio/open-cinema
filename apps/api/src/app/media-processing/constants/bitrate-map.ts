import { VideoQuality } from "../types";

interface BitrateConfig {
  bitrate: string;
  maxrate: string;
  bufsize: string;
  width: number;
  height: number;
  displayName: string;
}

export const BITRATE_MAP: Record<VideoQuality, BitrateConfig> = {
  [VideoQuality.QUALITY_480P]: {
    bitrate: "1400k",
    maxrate: "2000k",
    bufsize: "3000k",
    width: 640,
    height: 480,
    displayName: "480p SD"
  },
  [VideoQuality.QUALITY_720P]: {
    bitrate: "2500k",
    maxrate: "3500k",
    bufsize: "5000k",
    width: 1280,
    height: 720,
    displayName: "720p HD"
  },
  [VideoQuality.QUALITY_1080P]: {
    bitrate: "4500k",
    maxrate: "6000k",
    bufsize: "7500k",
    width: 1920,
    height: 1080,
    displayName: "1080p Full HD"
  },
  [VideoQuality.QUALITY_1440P]: {
    bitrate: "8000k",
    maxrate: "10000k",
    bufsize: "12000k",
    width: 2048,
    height: 1440,
    displayName: "1440p 2K"
  },
  [VideoQuality.QUALITY_2160P]: {
    bitrate: "16000k",
    maxrate: "20000k",
    bufsize: "24000k",
    width: 3840,
    height: 2160,
    displayName: "2160p 4K"
  }
};
