/* eslint-disable @typescript-eslint/no-explicit-any */

export type GraphQLError = {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export class GraphQLRequestError extends Error {
  status?: number;
  errors?: GraphQLError[];

  constructor(
    message: string,
    opts?: { status?: number; errors?: GraphQLError[] }
  ) {
    super(message);
    this.name = "GraphQLRequestError";
    this.status = opts?.status;
    this.errors = opts?.errors;
  }
}

const DEFAULT_GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "";

function getGraphqlUrl() {
  if (!DEFAULT_GRAPHQL_URL) {
    // Next.js runtime error message with clear guidance
    throw new Error(
      "NEXT_PUBLIC_GRAPHQL_URL is not set. Set it in your environment to enable GraphQL requests."
    );
  }
  return DEFAULT_GRAPHQL_URL;
}

export async function graphqlRequest<TData>(params: {
  query: string;
  variables?: Record<string, any>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}): Promise<TData> {
  const res = await fetch(getGraphqlUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params.headers || {})
    },
    body: JSON.stringify({
      query: params.query,
      variables: params.variables || {}
    }),
    signal: params.signal,
    cache: "no-store"
  });

  if (!res.ok) {
    throw new GraphQLRequestError(`GraphQL HTTP error: ${res.status}`, {
      status: res.status
    });
  }

  const json = (await res.json()) as GraphQLResponse<TData>;

  if (json.errors && json.errors.length) {
    throw new GraphQLRequestError(json.errors[0]?.message || "GraphQL error", {
      errors: json.errors
    });
  }

  if (!json.data) {
    throw new GraphQLRequestError("GraphQL response missing data");
  }

  return json.data;
}
