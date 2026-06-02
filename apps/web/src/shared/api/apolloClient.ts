"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3333/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri,
    credentials: "include",
    headers: {
      authorization: typeof window !== "undefined" 
        ? `Bearer ${localStorage.getItem("authToken") || ""}` 
        : "",
    },
  }),
  cache: new InMemoryCache(),
});

