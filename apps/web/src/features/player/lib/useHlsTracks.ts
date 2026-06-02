import type Hls from "hls.js";
import { useCallback } from "react";
import type { AudioMeta, SubtitleMeta, VideoMeta } from "@/shared/api/operation-types";

export const AUTO_QUALITY = "auto";

export function useHlsTracks(hlsRef: React.RefObject<Hls | null>) {
  const setQuality = useCallback(
    (metaId: string, videoMetas: VideoMeta[]) => {
      const hls = hlsRef.current;
      if (!hls) return;

      if (metaId === AUTO_QUALITY) {
        hls.currentLevel = -1;
        return;
      }

      const meta = videoMetas.find(m => m.id === metaId);
      if (!meta) return;

      const levelIndex = hls.levels.findIndex(
        level => level.height === meta.height || level.bitrate === meta.bitrate
      );

      if (levelIndex >= 0) {
        hls.currentLevel = levelIndex;
      }
    },
    [hlsRef]
  );

  const setAudio = useCallback(
    (metaId: string, audioMetas: AudioMeta[]) => {
      const hls = hlsRef.current;
      if (!hls) return;

      const meta = audioMetas.find(m => m.id === metaId);
      if (!meta) return;

      const trackIndex = hls.audioTracks.findIndex(
        track =>
          track.name === meta.displayName ||
          track.lang === meta.slug ||
          track.url === meta.url
      );

      if (trackIndex >= 0) {
        hls.audioTrack = trackIndex;
      }
    },
    [hlsRef]
  );

  const setSubtitle = useCallback(
    (metaId: string | null, subtitleMetas: SubtitleMeta[]) => {
      const hls = hlsRef.current;
      if (!hls) return;

      if (!metaId) {
        hls.subtitleTrack = -1;
        hls.subtitleDisplay = false;
        return;
      }

      const meta = subtitleMetas.find(m => m.id === metaId);
      if (!meta) return;

      const trackIndex = hls.subtitleTracks.findIndex(
        track =>
          track.name === meta.displayName ||
          track.lang === meta.slug ||
          track.url === meta.url
      );

      if (trackIndex >= 0) {
        hls.subtitleTrack = trackIndex;
        hls.subtitleDisplay = true;
      }
    },
    [hlsRef]
  );

  return { setQuality, setAudio, setSubtitle };
}
