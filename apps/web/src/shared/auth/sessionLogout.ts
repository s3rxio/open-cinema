import { useAuthStore } from "@/shared/state";
import { useFavoritesStore } from "@/shared/state";
import { useWatchHistoryStore } from "@/shared/state";
import { clearAuthTokens } from "./authTokens";

type LogoutListener = () => void;
const logoutListeners = new Set<LogoutListener>();

export function onSessionLogout(listener: LogoutListener): () => void {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
}

export function sessionLogout(): void {
  useAuthStore.getState().clear();
  clearAuthTokens();
  useFavoritesStore.getState().clear();
  useWatchHistoryStore.getState().clear();
  logoutListeners.forEach(listener => listener());
}
