"use client";

import { use } from "react";
import { UserEditPage } from "@/features/dashboard";

export function DashboardUserEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <UserEditPage id={id} />;
}
