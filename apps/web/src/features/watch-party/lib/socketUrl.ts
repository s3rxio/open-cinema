export function getWatchPartySocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_WS_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const graphql =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3333/graphql";
  const url = new URL(graphql);
  return url.origin;
}
