"use client";

import {
  useState,
  type PointerEvent,
  type ReactElement,
  type ReactNode
} from "react";
import { cn } from "@open-cinema/ui";

type TooltipSide = "top" | "bottom";

function usePlayerTooltip() {
  const [visible, setVisible] = useState(false);

  const hide = () => setVisible(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    hide();
    const focusable = event.currentTarget.querySelector<HTMLElement>(
      "button, a, input, select, [tabindex]:not([tabindex='-1'])"
    );
    focusable?.blur();
  };

  return {
    visible,
    show: () => setVisible(true),
    hide,
    onPointerDown
  };
}

function tooltipLabelClass(visible: boolean, side: TooltipSide) {
  return cn(
    "pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg transition-opacity duration-150",
    visible ? "opacity-100" : "opacity-0",
    side === "top" ? "bottom-full mb-2" : "top-full mt-2"
  );
}

type PlayerControlTooltipProps = {
  label: string;
  children: ReactElement;
  side?: TooltipSide;
  className?: string;
};

export function PlayerControlTooltip({
  label,
  children,
  side = "top",
  className
}: PlayerControlTooltipProps) {
  const tooltip = usePlayerTooltip();

  return (
    <div
      className={cn("relative inline-flex max-w-full", className)}
      onMouseEnter={tooltip.show}
      onMouseLeave={tooltip.hide}
      onPointerDown={tooltip.onPointerDown}
    >
      {children}
      <span role="tooltip" className={tooltipLabelClass(tooltip.visible, side)}>
        {label}
      </span>
    </div>
  );
}

export function PlayerControlTooltipWrap({
  label,
  children,
  side = "top",
  className
}: {
  label: string;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}) {
  const tooltip = usePlayerTooltip();

  return (
    <div
      className={cn("relative inline-flex max-w-full", className)}
      onMouseEnter={tooltip.show}
      onMouseLeave={tooltip.hide}
      onPointerDown={tooltip.onPointerDown}
    >
      {children}
      <span role="tooltip" className={tooltipLabelClass(tooltip.visible, side)}>
        {label}
      </span>
    </div>
  );
}
