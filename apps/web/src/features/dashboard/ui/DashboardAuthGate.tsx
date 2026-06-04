"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, isUserLoaded, canAccessDashboard } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (isUserLoaded && !canAccessDashboard) {
      router.replace("/");
    }
  }, [isReady, isAuthenticated, isUserLoaded, canAccessDashboard, router]);

  if (!isReady || !isAuthenticated || !isUserLoaded || !canAccessDashboard) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
