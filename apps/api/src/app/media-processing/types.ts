export enum VideoQuality {
  QUALITY_480P = "480p",
  QUALITY_720P = "720p",
  QUALITY_1080P = "1080p",
  QUALITY_1440P = "1440p",
  QUALITY_2160P = "2160p"
}

export enum ProcessingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum ProcessingType {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  SUBTITLE = "SUBTITLE"
}

export interface ProcessingJobData {
  inputPath: string;
  outputPath: string;
  streamId?: string;
  metaId?: string;
  type: ProcessingType;
  quality?: VideoQuality;
}

export interface ProbeResult {
  width: number;
  height: number;
  duration: number;
  bitrate: number;
}
