"use client";

import { Loader } from "@open-cinema/ui";

type PlayerShellStateProps = {
  variant: "embedded" | "cinema";
  message: string;
  detail?: string;
  loading?: boolean;
};

export function getPlayerShellClasses(variant: "embedded" | "cinema") {
  const isCinema = variant === "cinema";
  return {
    shell: isCinema
      ? "relative h-full w-full overflow-hidden bg-black"
      : "relative w-full bg-black rounded-lg overflow-hidden aspect-video",
    state: isCinema
      ? "flex h-full w-full items-center justify-center text-white bg-black"
      : "w-full aspect-video bg-black flex items-center justify-center text-white rounded-lg"
  };
}

export function PlayerShellState({
  variant,
  message,
  detail,
  loading
}: PlayerShellStateProps) {
  const { state } = getPlayerShellClasses(variant);
  const isCinema = variant === "cinema";

  if (loading) {
    return (
      <div className={isCinema ? state : `${state} rounded-lg`}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className={state}>
      <div className="text-center px-4">
        <p className={detail ? "mb-2" : undefined}>{message}</p>
        {detail && <p className="text-sm text-gray-400">{detail}</p>}
      </div>
    </div>
  );
}
