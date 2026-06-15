export interface User {
  id: string;
  phone: string;
  name: { ar: string; en: string };
  initials: string;
  email?: string;
  birthday?: string;
  role: "member" | "admin" | "super-admin";
  status: "pending" | "approved" | "rejected";
  photoUri?: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const SESSION_KEY = "church-attendance-web-session";

export function saveSession(session: Session) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): Session | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }
  return null;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  // Set default content type to JSON if body is present
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
