import { CombinedGraphQLErrors } from "@apollo/client";
import { ServerError } from "@apollo/client/errors";

export function isAuthError(error: unknown): boolean {
  if (ServerError.is(error)) {
    return error.statusCode === 401;
  }

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some(graphQLError => {
      const code = (graphQLError.extensions as { code?: string } | undefined)
        ?.code;

      return (
        code === "UNAUTHENTICATED" || /unauthorized/i.test(graphQLError.message)
      );
    });
  }

  if (error instanceof Error) {
    return /unauthorized/i.test(error.message);
  }

  return false;
}
