"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@open-cinema/ui";

export function AuthNavButton({
  href,
  children,
  className,
  onNavigate
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        className="w-full sm:w-auto"
      >
        {children}
      </Button>
    </Link>
  );
}
