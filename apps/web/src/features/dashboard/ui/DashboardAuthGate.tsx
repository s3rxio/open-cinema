"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
