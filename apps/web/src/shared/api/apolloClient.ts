"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from as linkFrom
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { from as rxFrom, switchMap, throwError } from "rxjs";
import { APOLLO_PREFLIGHT_HEADERS } from "./apolloHeaders";
import { getAccessToken } from "@/shared/auth/authTokens";
import { isAuthError } from "@/shared/auth/isAuthError";
import { refreshAccessToken } from "@/shared/auth/refreshAccessToken";
import { onSessionLogout, sessionLogout } from "@/shared/auth/sessionLogout";

const uri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";

const httpLink = new HttpLink({
  uri,
  credentials: "include"
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      ...APOLLO_PREFLIGHT_HEADERS,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (
    !isAuthError(error) ||
    operation.operationName === "RefreshToken" ||
    operation.operationName === "Login" ||
    operation.operationName === "Register"
  ) {
    return;
  }

  return rxFrom(refreshAccessToken()).pipe(
    switchMap(accessToken => {
      if (!accessToken) {
        sessionLogout();
        return throwError(() => error);
      }

      return forward(operation);
    })
  );
});

export const apolloClient = new ApolloClient({
  link: linkFrom([errorLink, authLink, httpLink]),
  cache: new InMemoryCache()
});

onSessionLogout(() => {
  void apolloClient.clearStore();
});
