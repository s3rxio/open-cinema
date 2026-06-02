"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type AuthUser = {
  id: string;
  email?: string;
  username?: string;
  // extend based on backend auth resolver response
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { email: string; password: string; username: string }) => Promise<void>;
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
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login: async () => {
        // TODO integrate with auth mutation
        throw new Error("Auth.login not implemented yet");
      },
      register: async () => {
        // TODO integrate with auth mutation
        throw new Error("Auth.register not implemented yet");
      },
      logout,
    }),
    [token, user, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

