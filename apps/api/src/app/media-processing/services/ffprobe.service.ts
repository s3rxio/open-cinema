import { Injectable } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import { ProbeResult, VideoQuality } from "../types";

const execAsync = promisify(exec);

@Injectable()
export class FfprobeService {
  async probe(filePath: string): Promise<ProbeResult> {
    try {
      const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate -of default=noprint_wrappers=1 "${filePath}"`;

      const { stdout } = await execAsync(command);
      const lines = stdout.trim().split("\n");

      const result: ProbeResult = {
        width: 0,
        height: 0,
        duration: 0,
        bitrate: 0
      };

      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key === "width") result.width = parseInt(value, 10);
        if (key === "height") result.height = parseInt(value, 10);
        if (key === "duration") result.duration = parseFloat(value);
        if (key === "bit_rate") result.bitrate = parseInt(value, 10);
      }

      return result;
    } catch (error) {
      throw new Error(`ffprobe failed: ${(error as Error).message}`);
    }
  }

  async getAvailableQualities(sourceHeight: number): Promise<VideoQuality[]> {
    const qualities = [2160, 1440, 1080, 720, 480];
    const threshold = 96;

    return qualities
      .filter(q => q - threshold <= sourceHeight)
      .map(q => `${q}p` as VideoQuality);
  }
}
