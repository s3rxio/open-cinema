import { redirect } from "next/navigation";

type SearchRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchRedirectPage({
  searchParams
}: SearchRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(item => query.append(key, item));
    }
  }

  const queryString = query.toString();
  redirect(queryString ? `/catalog?${queryString}` : "/catalog");
}
