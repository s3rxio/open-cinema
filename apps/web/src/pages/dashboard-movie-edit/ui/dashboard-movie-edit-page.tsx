"use client";

import { use } from "react";
import { ContentAdminEdit } from "@/features/dashboard";

export function DashboardMovieEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <ContentAdminEdit kind="movie" id={id} backHref="/dashboard/movies" />;
}
