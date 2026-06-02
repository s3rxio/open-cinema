"use client";

import Hls, { type HlsConfig } from "hls.js";
import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

export type ReactHlsPlayerProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  hlsConfig?: HlsConfig;
  playerRef: RefObject<HTMLVideoElement | null>;
  src: string;
  onHlsReady?: (hls: Hls) => void;
};

/**
 * HLS video element (react-hls-player pattern + onHlsReady for track controls).
 */
export default function ReactHlsPlayer({
  hlsConfig,
  playerRef,
  src,
  autoPlay,
  onHlsReady,
  ...props
}: ReactHlsPlayerProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      internalRef.current = node;
      playerRef.current = node;
    },
    [playerRef]
  );

  useLayoutEffect(() => {
    let hls: Hls | null = null;
    const video = internalRef.current;

    if (!src || !video) {
      return;
    }

    function initPlayer() {
      hls?.destroy();

      const newHls = new Hls({
        enableWorker: true,
        ...hlsConfig
      });

      newHls.attachMedia(video!);

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(src);

        newHls.on(Hls.Events.MANIFEST_PARSED, () => {
          onHlsReady?.(newHls);

          if (autoPlay && internalRef.current) {
            internalRef.current.play().catch(() => undefined);
          }
        });
      });

      newHls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            newHls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            newHls.recoverMediaError();
            break;
          default:
            initPlayer();
            break;
        }
      });

      hls = newHls;
    }

    if (Hls.isSupported()) {
      initPlayer();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => undefined);
      }
    }

    return () => {
      hls?.destroy();
    };
  }, [autoPlay, hlsConfig, onHlsReady, src]);

  return <video ref={setVideoRef} {...props} />;
}
