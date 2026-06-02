/** Required by Apollo Server 4+ CSRF protection for multipart and some POST requests. */
export const APOLLO_PREFLIGHT_HEADERS = {
  "apollo-require-preflight": "true"
} as const;
