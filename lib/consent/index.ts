export const CONSENT_COOKIE = "lorem-ipsum-consent";
export const CONSENT_EVENT = "lorem-ipsum-consent-change";

export type ConsentChoice = "all" | "essential";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((row) => row.trim())
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  const value = entry?.split("=")[1];
  return value === "all" || value === "essential" ? value : null;
}

export function writeConsent(choice: ConsentChoice) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
