import { redirect } from "next/navigation";

export function DashboardPage() {
  redirect("/dashboard/movies");
}
