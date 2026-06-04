import { BITRATE_MAP } from "./bitrate-map";
import { VideoQuality } from "../types";

/**
 * HLS ladder encoding tuned for weak CPUs (throughput over compression efficiency).
 * Trade-off: larger segments at the same target bitrate vs. "fast" / "medium" presets.
 */
export const FFMPEG_HLS_VIDEO = {
  codec: "libx264",
  preset: "ultrafast",
  tune: "zerolatency",
  profile: "main",
  /** 0 = let ffmpeg pick thread count from available cores */
  threads: 0,
  gop: 48,
  keyintMin: 48,
  scThreshold: 0,
  x264Params:
    "ref=1:bframes=0:me=dia:subme=0:trellis=0:8x8dct=0:weightp=0:mixed-refs=0:rc-lookahead=0:sync-lookahead=0",
  scaleFlags: "fast_bilinear",
  hlsTime: 6
} as const;

export const FFMPEG_HLS_AUDIO = {
  codec: "aac",
  bitrate: "128k",
  channels: 2,
  sampleRate: 48000,
  hlsTime: 6
} as const;

export function buildVideoScaleFilter(width: number, height: number): string {
  return `scale=${width}:${height}:flags=${FFMPEG_HLS_VIDEO.scaleFlags},format=yuv420p`;
}

export function buildHlsVideoEncodeArgs(quality: VideoQuality): string {
  const config = BITRATE_MAP[quality];
  const v = FFMPEG_HLS_VIDEO;

  return [
    "-an",
    `-c:v ${v.codec}`,
    `-preset ${v.preset}`,
    `-tune ${v.tune}`,
    `-profile:v ${v.profile}`,
    `-threads ${v.threads}`,
    `-g ${v.gop} -keyint_min ${v.keyintMin} -sc_threshold ${v.scThreshold}`,
    `-x264-params ${v.x264Params}`,
    `-b:v ${config.bitrate} -maxrate ${config.maxrate} -bufsize ${config.bufsize}`,
    `-vf ${buildVideoScaleFilter(config.width, config.height)}`
  ].join(" ");
}

export function buildHlsAudioEncodeArgs(): string {
  const a = FFMPEG_HLS_AUDIO;

  return [
    "-vn",
    `-c:a ${a.codec}`,
    `-b:a ${a.bitrate}`,
    `-ac ${a.channels}`,
    `-ar ${a.sampleRate}`
  ].join(" ");
}

export function buildHlsOutputArgs(
  segmentPattern: string,
  playlistPath: string,
  segmentDuration = FFMPEG_HLS_VIDEO.hlsTime
): string {
  return [
    "-f hls",
    `-hls_time ${segmentDuration}`,
    "-hls_list_size 0",
    "-hls_segment_type mpegts",
    `-hls_segment_filename "${segmentPattern}"`,
    `"${playlistPath}"`
  ].join(" ");
}
