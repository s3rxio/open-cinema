import { create } from "zustand";
import { persistAuthTokens } from "@/shared/auth/authTokens";

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
  setAuth: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: (accessToken, refreshToken) => {
    persistAuthTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },
  setUser: user => set({ user }),
  clear: () => set({ accessToken: null, refreshToken: null, user: null })
}));

/** @deprecated use accessToken */
export const useAuthToken = () => useAuthStore(state => state.accessToken);
