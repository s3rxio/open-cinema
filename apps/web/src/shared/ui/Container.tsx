import { cn } from "@open-cinema/ui";

type ContainerSize = "default" | "narrow";

type ContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  size?: ContainerSize;
};

const sizeClass: Record<ContainerSize, string> = {
  default: "max-w-7xl",
  narrow: "max-w-2xl"
};

export function Container({
  children,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 max-md:px-3",
        sizeClass[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
