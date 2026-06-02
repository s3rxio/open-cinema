"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";

export default function DashboardUsersLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isUserLoaded, canManageUsers } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoaded && !canManageUsers) {
      router.replace("/dashboard/movies");
    }
  }, [isUserLoaded, canManageUsers, router]);

  if (!isUserLoaded || !canManageUsers) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return children;
}
