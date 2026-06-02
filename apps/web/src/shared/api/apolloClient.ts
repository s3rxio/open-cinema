"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const uri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3333/graphql";

const httpLink = new HttpLink({
  uri,
  credentials: "include"
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache()
});
