import * as React from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "./utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollArea.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollArea.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollArea.Root
    ref={ref}
    className={cn(
      "relative w-full overflow-hidden rounded-md border",
      className
    )}
    {...props}
  >
    <ScrollArea.Viewport className="h-full w-full">
      {children}
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar
      className="flex touch-none select-none bg-border p-0.5 transition-colors"
      orientation="horizontal"
    >
      <ScrollArea.Thumb className="relative flex-1 rounded-full bg-muted-foreground/40" />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner />
  </ScrollArea.Root>
));
TableScrollArea.displayName = "TableScrollArea";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableScrollArea
};
