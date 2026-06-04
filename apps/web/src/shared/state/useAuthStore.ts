"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email?: string;
  username?: string;
  roleSlugs: string[];
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    options?: { resetUser?: boolean }
  ) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
};

const AUTH_STORAGE_KEY = "open-cinema-auth";
const LEGACY_ACCESS_KEY = "authToken";
const LEGACY_REFRESH_KEY = "refreshToken";

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0
};

function createAuthStorage() {
  return createJSONStorage(() =>
    typeof window === "undefined" ? noopStorage : localStorage
  );
}

function readLegacyTokens(): Pick<AuthState, "accessToken" | "refreshToken"> {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  const accessToken = localStorage.getItem(LEGACY_ACCESS_KEY);
  const refreshToken = localStorage.getItem(LEGACY_REFRESH_KEY);

  if (accessToken) {
    localStorage.removeItem(LEGACY_ACCESS_KEY);
  }
  if (refreshToken) {
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  }

  return { accessToken, refreshToken };
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, options) =>
        set(state => ({
          accessToken,
          refreshToken,
          user: options?.resetUser ? null : state.user
        })),
      setUser: user => set({ user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createAuthStorage(),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      }),
      merge: (persisted, current) => {
        const legacy = readLegacyTokens();

        return {
          ...current,
          ...(persisted as Partial<AuthState>),
          accessToken:
            (persisted as AuthState | undefined)?.accessToken ??
            legacy.accessToken ??
            current.accessToken,
          refreshToken:
            (persisted as AuthState | undefined)?.refreshToken ??
            legacy.refreshToken ??
            current.refreshToken,
          user: (persisted as AuthState | undefined)?.user ?? current.user
        };
      }
    }
  )
);

export function useAuthStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return useAuthStore.persist?.hasHydrated() ?? false;
  });

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi) {
      setHydrated(true);
      return;
    }

    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return persistApi.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

/** @deprecated use accessToken */
export const useAuthToken = () => useAuthStore(state => state.accessToken);
