// ─── API & AUTH HELPER ───────────────────────────────────────────────────────

export const API_BASE = "http://127.0.0.1:8000";

const TOKEN_KEY = "pyguardian_token";
const USER_KEY = "pyguardian_user";

/**
 * Returns the stored JWT token, or null if not logged in.
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Returns the stored user object, or null if not found.
 */
export function getSavedUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves the active JWT token and user profile to localStorage.
 */
export function setAuthSession(token: string, user: any): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save auth session to localStorage", e);
  }
}

/**
 * Clears the stored session from localStorage.
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}

/**
 * Reusable fetch wrapper that:
 * 1. Automatically attaches `Authorization: Bearer <token>` when a token exists.
 * 2. Adds `Content-Type: application/json` when sending a body.
 * 3. Intercepts 401 Unauthorized responses to clear expired sessions gracefully.
 */
export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = input.startsWith("http") ? input : `${API_BASE}${input.startsWith("/") ? "" : "/"}${input}`;

  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // If backend rejects with 401 and we sent a token, token is invalid or expired
  if (response.status === 401 && token) {
    clearAuthSession();
    window.dispatchEvent(new CustomEvent("auth:expired", { detail: { url } }));
  }

  return response;
}
