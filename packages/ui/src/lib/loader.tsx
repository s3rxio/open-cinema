import * as React from "react";
import { cn } from "../lib/utils";

const Loader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "md", ...props }, ref) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeMap[size],
        className
      )}
      {...props}
    />
  );
});
Loader.displayName = "Loader";

export { Loader };
