import { CombinedGraphQLErrors } from "@apollo/client";

export function getApolloErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка"
): string {
  if (CombinedGraphQLErrors.is(error)) {
    const graphQlMessage = error.errors.find(e => e.message)?.message;
    if (graphQlMessage) {
      return graphQlMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
