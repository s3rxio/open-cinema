"use client";

import { use } from "react";
import { ContentAdminEdit } from "@/features/dashboard";

export function DashboardSeriesEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ContentAdminEdit kind="series" id={id} backHref="/dashboard/series" />
  );
}
