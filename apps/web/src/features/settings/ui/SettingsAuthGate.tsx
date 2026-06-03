"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";

export function SettingsAuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, isUserLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated || !isUserLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
