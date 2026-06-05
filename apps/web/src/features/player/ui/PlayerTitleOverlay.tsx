"use client";

type PlayerTitleOverlayProps = {
  title: string;
  visible: boolean;
};

export function PlayerTitleOverlay({ title, visible }: PlayerTitleOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="text-lg font-semibold text-white line-clamp-2">{title}</h1>
    </div>
  );
}
