"use client";

import { cn } from "@open-cinema/ui";

type PlayerProgressBarProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export function PlayerProgressBar({
  value,
  max,
  onChange,
  className
}: PlayerProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="group/progress relative flex h-5 flex-1 cursor-pointer items-center">
        <div className="relative h-1 w-full transition-[height] group-hover/progress:h-1.5">
          <div className="absolute inset-0 rounded-full bg-white/30" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-red-600 transition-[height] group-hover/progress:bg-red-500"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-600 opacity-0 shadow-md transition-opacity group-hover/progress:opacity-100"
            style={{ left: `calc(${percent}% - 6px)` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={safeMax}
          step={0.1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          aria-label="Прогресс воспроизведения"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

export { formatTime };
