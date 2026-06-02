import { useEffect, useRef } from "react";

type UsePlayerKeyboardOptions = {
  enabled: boolean;
  onTogglePlay: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onToggleMute: () => void;
  onCycleSubtitles: () => void;
  onToggleFullscreen: () => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function usePlayerKeyboard(options: UsePlayerKeyboardOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!options.enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!optionsRef.current.enabled) return;
      if (isTypingTarget(e.target)) return;

      const {
        onTogglePlay,
        onSeekBackward,
        onSeekForward,
        onToggleMute,
        onCycleSubtitles,
        onToggleFullscreen
      } = optionsRef.current;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onTogglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeekBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeekForward();
          break;
        case "KeyM":
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          onToggleMute();
          break;
        case "KeyC":
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          onCycleSubtitles();
          break;
        case "KeyF":
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          onToggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [options.enabled]);
}
