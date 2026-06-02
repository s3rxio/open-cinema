"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect
} from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/shared/api/operations/favorites";
import { useAuthStore, type AuthUser } from "@/shared/state/useAuthStore";
import { useFavoritesStore } from "@/shared/state/useFavoritesStore";

export type { AuthUser };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  isAuthenticated: boolean;
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
  const clear = useAuthStore(state => state.clear);
  useEffect(() => {
    const stored = localStorage.getItem("authToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    if (stored && !useAuthStore.getState().accessToken) {
      useAuthStore.setState({
        accessToken: stored,
        refreshToken: storedRefresh
      });
    }
  }, []);

  const meQuery = useQuery(ME_QUERY, {
    skip: !accessToken,
    fetchPolicy: "cache-and-network"
  });

  const setFavoritesFromServer = useFavoritesStore(
    state => state.setFromServer
  );
  const clearFavorites = useFavoritesStore(state => state.clear);

  useEffect(() => {
    const me = meQuery.data?.me;
    if (me) {
      setUser({
        id: me.id,
        email: me.email,
        username: me.username
      });
      if (me.favorites) {
        setFavoritesFromServer(me.favorites);
      }
    }
  }, [meQuery.data, setUser, setFavoritesFromServer]);

  const logout = useCallback(() => {
    clear();
    clearFavorites();
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  }, [clear, clearFavorites]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: accessToken,
      isAuthenticated: !!accessToken,
      logout
    }),
    [accessToken, user, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
