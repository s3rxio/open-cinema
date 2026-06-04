import { useAuthStore } from "@/shared/state";

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

/** @deprecated tokens are persisted in zustand */
export function persistAuthTokens(
  _accessToken: string,
  _refreshToken: string
): void {}

/** @deprecated use sessionLogout / useAuthStore.clear */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
}
