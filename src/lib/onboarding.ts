const PENDING_KEY = "gestaglic_onboarding_pending";

export function onboardingStorageKey(userId: string) {
  return `gestaglic_onboarding_${userId}`;
}

export function markOnboardingPending() {
  sessionStorage.setItem(PENDING_KEY, "1");
}

export function isOnboardingPending(): boolean {
  return sessionStorage.getItem(PENDING_KEY) === "1";
}

export function clearOnboardingPending() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function hasSeenOnboarding(userId: string): boolean {
  return localStorage.getItem(onboardingStorageKey(userId)) === "1";
}

export function markOnboardingSeen(userId: string) {
  localStorage.setItem(onboardingStorageKey(userId), "1");
}
