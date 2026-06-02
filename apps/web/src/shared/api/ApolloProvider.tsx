"use client";

import * as React from "react";
import { ApolloProvider as ApolloProviderBase } from "@apollo/client/react";

import { apolloClient } from "./apolloClient";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
}
