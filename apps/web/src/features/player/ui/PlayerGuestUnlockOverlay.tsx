"use client";

import { Play } from "lucide-react";

type PlayerGuestUnlockOverlayProps = {
  onUnlock: () => void;
};

export function PlayerGuestUnlockOverlay({
  onUnlock
}: PlayerGuestUnlockOverlayProps) {
  return (
    <button
      type="button"
      className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center gap-3 bg-black/70 text-white"
      onClick={onUnlock}
      aria-label="Начать просмотр"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
        <Play className="h-8 w-8 fill-current" />
      </span>
      <span className="text-base font-medium sm:text-lg">
        Нажмите, чтобы смотреть
      </span>
    </button>
  );
}
