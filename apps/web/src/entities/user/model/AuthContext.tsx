"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState
} from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/entities/favorite";
import {
  useAuthStore,
  useAuthStoreHydrated,
  type AuthUser
} from "@/shared/state";
import { useFavoritesStore } from "@/shared/state";
import { useWatchHistoryStore } from "@/shared/state";
import {
  canAccessDashboard,
  canManageUsers
} from "@/shared/auth";
import {
  isAccessTokenExpired,
  isAuthError,
  sessionLogout
} from "@/shared/auth";
import { refreshAccessToken } from "@/shared/auth/refreshAccessToken";

export type { AuthUser };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  /** false until zustand rehydration and optional token refresh finished */
  isReady: boolean;
  isAuthenticated: boolean;
  /** false while profile/roles are still being resolved */
  isUserLoaded: boolean;
  /** true while `me` is loading and dashboard access is not yet confirmed */
  isProfileLoading: boolean;
  canAccessDashboard: boolean;
  canManageUsers: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function resolveRoleSlugs(
  user: AuthUser | null,
  me: { id: string; roles?: Array<{ slug: string }> | null } | undefined
): string[] {
  const meSlugs = me?.roles?.map(role => role.slug) ?? [];

  if (meSlugs.length > 0) {
    return meSlugs;
  }

  return user?.roleSlugs ?? [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStoreHydrated();
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshToken = useAuthStore(state => state.refreshToken);
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void (async () => {
      const needsRefresh =
        !!refreshToken &&
        (!accessToken ||
          (accessToken ? isAccessTokenExpired(accessToken) : true));

      if (needsRefresh) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) {
          sessionLogout();
        }
      }

      setSessionReady(true);
    })();
  }, [hasHydrated, accessToken, refreshToken]);

  const isReady = hasHydrated && sessionReady;

  const meQuery = useQuery(ME_QUERY, {
    skip: !accessToken || !isReady,
    fetchPolicy: "cache-and-network"
  });

  const setFavoritesFromServer = useFavoritesStore(
    state => state.setFromServer
  );
  const setWatchHistoryFromServer = useWatchHistoryStore(
    state => state.setFromServer
  );

  useEffect(() => {
    const me = meQuery.data?.me;
    if (me) {
      setUser({
        id: me.id,
        email: me.email,
        username: me.username,
        roleSlugs: me.roles?.map(role => role.slug) ?? []
      });
      if (me.favorites) {
        setFavoritesFromServer(me.favorites);
      }
      if (me.watchHistory) {
        setWatchHistoryFromServer(me.watchHistory);
      }
    }
  }, [
    meQuery.data,
    setUser,
    setFavoritesFromServer,
    setWatchHistoryFromServer
  ]);

  useEffect(() => {
    if (!meQuery.error || !isAuthError(meQuery.error)) {
      return;
    }

    void (async () => {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        await meQuery.refetch();
        return;
      }

      sessionLogout();
    })();
  }, [meQuery.error, meQuery.refetch]);

  const logout = useCallback(() => {
    sessionLogout();
  }, []);

  const me = meQuery.data?.me;
  const roleSlugs = resolveRoleSlugs(user, me);

  const isProfileLoading = !!accessToken && isReady && meQuery.loading;

  const isUserLoaded =
    !accessToken ||
    !!user?.id ||
    meQuery.error !== undefined ||
    (!meQuery.loading && me !== undefined);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: accessToken,
      isReady,
      isAuthenticated: isReady && !!accessToken,
      isUserLoaded,
      isProfileLoading,
      canAccessDashboard: canAccessDashboard(roleSlugs),
      canManageUsers: canManageUsers(roleSlugs),
      logout
    }),
    [
      accessToken,
      user,
      logout,
      isReady,
      isUserLoaded,
      isProfileLoading,
      roleSlugs
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
