"use client";

import Link from "next/link";
import { buttonVariants, cn } from "@open-cinema/ui";

type DashboardListToolbarProps = {
  createHref: string;
  createLabel: string;
};

export function DashboardListToolbar({
  createHref,
  createLabel
}: DashboardListToolbarProps) {
  return (
    <div className="flex justify-end">
      <Link href={createHref} className={cn(buttonVariants())}>
        {createLabel}
      </Link>
    </div>
  );
}
