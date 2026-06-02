import { redirect } from "next/navigation";

export default function FavoritesPage() {
  redirect("/my#bookmarks");
}
