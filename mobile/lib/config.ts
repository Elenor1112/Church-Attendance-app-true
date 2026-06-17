import Constants from "expo-constants";

/**
 * Base URL of the backend API (the TanStack Start server).
 * Override per-environment via `expo.extra.apiUrl` in app.json or the
 * EXPO_PUBLIC_API_URL environment variable.
 */
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  "http://localhost:3000";
