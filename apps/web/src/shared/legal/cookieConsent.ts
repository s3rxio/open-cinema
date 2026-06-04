export const COOKIE_CONSENT_STORAGE_KEY = "open-cinema-cookie-consent";

export type CookieConsentStatus = "accepted";

export function getCookieConsentStatus(): CookieConsentStatus | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return value === "accepted" ? "accepted" : null;
}

export function setCookieConsentAccepted(): void {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
}
