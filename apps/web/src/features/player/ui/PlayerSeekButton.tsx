"use client";

import { Button, cn } from "@open-cinema/ui";
import { PlayerControlTooltip } from "./PlayerControlTooltip";

type PlayerSeekButtonProps = {
  direction: "back" | "forward";
  onClick: () => void;
};

export function PlayerSeekButton({ direction, onClick }: PlayerSeekButtonProps) {
  const label =
    direction === "back" ? "Отмотать на 10 секунд" : "Перемотать на 10 секунд";

  return (
    <PlayerControlTooltip label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className="relative h-9 w-9 shrink-0 hover:bg-white/20 text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "h-5 w-5 fill-current",
            direction === "forward" && "scale-x-[-1]"
          )}
          aria-hidden
        >
          <path d="M12.5 8c-2.65 0-5.05 1.04-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8zm-1 11h-2v-6h2v6zm4 0h-2v-6h2v6z" />
        </svg>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold leading-none">
          10
        </span>
      </Button>
    </PlayerControlTooltip>
  );
}
