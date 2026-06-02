"use client";

import { Pause, Play } from "lucide-react";
import { cn } from "@open-cinema/ui";

export type PlayerFlashAction = "play" | "pause" | "seek-back" | "seek-forward";

type PlayerActionFlashProps = {
  action: PlayerFlashAction;
  animationKey: number;
};

const SEEK_ICON_PATH =
  "M12.5 8c-2.65 0-5.05 1.04-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8zm-1 11h-2v-6h2v6zm4 0h-2v-6h2v6z";

function SeekFlashIcon({ forward }: { forward: boolean }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        className={cn("h-12 w-12 fill-white", forward && "scale-x-[-1]")}
        aria-hidden
      >
        <path d={SEEK_ICON_PATH} />
      </svg>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-semibold text-white">
        10
      </span>
    </div>
  );
}

export function PlayerActionFlash({ action, animationKey }: PlayerActionFlashProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div
        key={animationKey}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-black/45 player-action-flash"
      >
        {action === "play" && (
          <Play className="ml-1 h-14 w-14 fill-white text-white" strokeWidth={1.5} />
        )}
        {action === "pause" && (
          <Pause className="h-14 w-14 fill-white text-white" strokeWidth={1.5} />
        )}
        {action === "seek-back" && <SeekFlashIcon forward={false} />}
        {action === "seek-forward" && <SeekFlashIcon forward />}
      </div>
    </div>
  );
}
