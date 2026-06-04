"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@open-cinema/ui";
import { useAuth } from "@/entities/user";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const {
    isReady,
    isAuthenticated,
    isUserLoaded,
    isProfileLoading,
    canAccessDashboard
  } = useAuth();
  const router = useRouter();

  const canEnter =
    isReady &&
    isAuthenticated &&
    isUserLoaded &&
    !isProfileLoading &&
    canAccessDashboard;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (isProfileLoading || !isUserLoaded) {
      return;
    }

    if (!canAccessDashboard) {
      router.replace("/");
    }
  }, [
    isReady,
    isAuthenticated,
    isUserLoaded,
    isProfileLoading,
    canAccessDashboard,
    router
  ]);

  if (!canEnter) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
