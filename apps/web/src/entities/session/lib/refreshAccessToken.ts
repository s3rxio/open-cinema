import { print } from "graphql";
import { APOLLO_PREFLIGHT_HEADERS } from "@/shared/api/apolloHeaders";
import { REFRESH_TOKEN_MUTATION } from "../api/auth";
import { getRefreshToken } from "@/shared/auth/authTokens";
import { useAuthStore } from "@/shared/state";

const graphqlUri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";

let refreshInFlight: Promise<string | null> | null = null;

async function requestRefreshToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const response = await fetch(graphqlUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...APOLLO_PREFLIGHT_HEADERS
    },
    credentials: "include",
    body: JSON.stringify({
      query: print(REFRESH_TOKEN_MUTATION),
      variables: { refreshTokenInput: { refreshToken } }
    })
  });

  const json = (await response.json()) as {
    data?: {
      refreshToken?: { accessToken: string; refreshToken: string };
    };
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length || !json.data?.refreshToken) {
    return null;
  }

  return json.data.refreshToken;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const tokens = await requestRefreshToken(refreshToken);
    if (!tokens) {
      return null;
    }

    useAuthStore.getState().setAuth(tokens.accessToken, tokens.refreshToken);

    return tokens.accessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
