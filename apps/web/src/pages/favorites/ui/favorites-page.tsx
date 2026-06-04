import { redirect } from "next/navigation";

export function FavoritesPage() {
  redirect("/my#bookmarks");
}
