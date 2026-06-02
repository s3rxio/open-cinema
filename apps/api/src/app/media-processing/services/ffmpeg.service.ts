import { Injectable, Logger } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { VideoQuality } from "../types";
import { BITRATE_MAP } from "../constants/bitrate-map";
import { HLS_SEGMENT_PATTERN } from "../constants/segment-pattern";

const execAsync = promisify(exec);

@Injectable()
export class FfmpegService {
  private logger = new Logger(FfmpegService.name);

  async convertVideoToHLS(
    inputPath: string,
    outputDir: string,
    quality: VideoQuality
  ): Promise<void> {
    const config = BITRATE_MAP[quality];

    const playlistPath = join(outputDir, "index.m3u8");
    const segmentPattern = join(outputDir, HLS_SEGMENT_PATTERN);

    const command = [
      "ffmpeg -y",
      `-i "${inputPath}"`,
      "-an -c:v libx264 -preset fast -g 48 -keyint_min 48 -sc_threshold 0",
      `-b:v ${config.bitrate} -maxrate ${config.maxrate} -bufsize ${config.bufsize}`,
      `-vf scale=${config.width}:${config.height}`,
      "-f hls -hls_time 6 -hls_list_size 0 -hls_segment_type mpegts",
      `-hls_segment_filename "${segmentPattern}"`,
      `"${playlistPath}"`
    ].join(" ");

    try {
      await execAsync(command, { maxBuffer: 1024 * 1024 * 100 }).then();
      this.logger.debug(
        `FFmpeg conversion completed for ${playlistPath}. Config:\n`,
        config
      );
    } catch (error) {
      throw new Error(
        `FFmpeg conversion failed for ${quality}: ${(error as Error).message}`
      );
    }
  }

  async convertAudioToHLS(inputPath: string, outputDir: string): Promise<void> {
    const playlistPath = join(outputDir, "index.m3u8");
    const segmentPattern = join(outputDir, HLS_SEGMENT_PATTERN);

    const command = [
      `ffmpeg -y -i "${inputPath}"`,
      "-vn -c:a aac -b:a 128k -ac 2 -ar 48000",
      "-f hls -hls_time 6 -hls_list_size 0 -hls_segment_type mpegts",
      `-hls_segment_filename "${segmentPattern}"`,
      `"${playlistPath}"`
    ].join(" ");

    try {
      await execAsync(command, { maxBuffer: 1024 * 1024 * 50 });

      this.logger.debug(
        `FFmpeg conversion completed for ${playlistPath}. Config:\n`
      );
    } catch (error) {
      throw new Error(`Audio conversion failed: ${(error as Error).message}`);
    }
  }

  async convertSubtitle(inputPath: string, outputDir: string): Promise<void> {
    const playlistPath = join(outputDir, "index.m3u8");
    const segmentPattern = join(outputDir, "segment_%04d.vtt");

    const command = [
      `ffmpeg -y -i "${inputPath}"`,
      "-vn -an -map s:0 -c:s webvtt",
      `-f segment -segment_list ${playlistPath}`,
      `"${segmentPattern}"`
    ].join(" ");

    try {
      await execAsync(command);
      this.logger.debug(
        `FFmpeg conversion completed for ${playlistPath}. Config:\n`
      );
    } catch (error) {
      throw new Error(
        `Subtitle conversion failed: ${(error as Error).message}`
      );
    }
  }
}
