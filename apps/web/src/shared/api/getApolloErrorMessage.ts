import { CombinedGraphQLErrors } from "@apollo/client";

function formatGraphQlErrorMessage(message: string, extensions?: unknown): string {
  if (message !== "Bad Request Exception" && message !== "Bad Request") {
    return message;
  }

  const response = (extensions as { response?: { message?: string | string[] } })
    ?.response?.message;

  if (Array.isArray(response)) {
    return response.join("; ");
  }

  if (typeof response === "string" && response.length > 0) {
    return response;
  }

  return message;
}

export function getApolloErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка"
): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors.find(e => e.message);
    if (first?.message) {
      return formatGraphQlErrorMessage(first.message, first.extensions);
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
