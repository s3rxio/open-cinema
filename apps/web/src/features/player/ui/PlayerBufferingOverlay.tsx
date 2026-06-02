"use client";

import { Loader } from "@open-cinema/ui";

type PlayerBufferingOverlayProps = {
  visible: boolean;
};

export function PlayerBufferingOverlay({ visible }: PlayerBufferingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-black/25"
      aria-hidden={!visible}
      aria-busy="true"
      aria-label="Загрузка"
    >
      <Loader size="lg" className="border-2 border-white/25 border-t-white" />
    </div>
  );
}
