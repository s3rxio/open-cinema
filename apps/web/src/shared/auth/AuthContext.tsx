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
import { ME_QUERY } from "@/shared/api/operations/favorites";
import { useAuthStore, type AuthUser } from "@/shared/state/useAuthStore";
import { useFavoritesStore } from "@/shared/state/useFavoritesStore";
import { useWatchHistoryStore } from "@/shared/state/useWatchHistoryStore";
import {
  canAccessDashboard,
  canManageUsers
} from "@/shared/auth/dashboardAccess";
import { getAccessToken, getRefreshToken } from "./authTokens";
import { isAccessTokenExpired } from "./isAccessTokenExpired";
import { isAuthError } from "./isAuthError";
import { refreshAccessToken } from "./refreshAccessToken";
import { sessionLogout } from "./sessionLogout";

export type { AuthUser };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  /** false until tokens are restored from localStorage on the client */
  isReady: boolean;
  isAuthenticated: boolean;
  /** false until `me` has been fetched for the current session */
  isUserLoaded: boolean;
  canAccessDashboard: boolean;
  canManageUsers: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore(state => state.accessToken);
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedAccess = getAccessToken();
    const storedRefresh = getRefreshToken();

    if (storedAccess || storedRefresh) {
      useAuthStore.setState({
        accessToken: storedAccess,
        refreshToken: storedRefresh
      });
    }

    void (async () => {
      const needsRefresh =
        !!storedRefresh &&
        (!storedAccess ||
          (storedAccess ? isAccessTokenExpired(storedAccess) : true));

      if (needsRefresh) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) {
          sessionLogout();
        }
      }

      setIsReady(true);
    })();
  }, []);

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

  const isUserLoaded =
    !accessToken ||
    (!meQuery.loading &&
      (meQuery.dataState !== "empty" || meQuery.error !== undefined));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: accessToken,
      isReady,
      isAuthenticated: isReady && !!accessToken,
      isUserLoaded,
      canAccessDashboard: canAccessDashboard(user?.roleSlugs ?? []),
      canManageUsers: canManageUsers(user?.roleSlugs ?? []),
      logout
    }),
    [accessToken, user, logout, isReady, isUserLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
