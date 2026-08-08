import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function extractMessage(data: unknown, status: number): string {
  const body = data as { message?: string | string[]; error?: string } | undefined;
  if (Array.isArray(body?.message)) return body.message.join(" ");
  if (typeof body?.message === "string" && body.message) return body.message;
  if (typeof body?.error === "string" && body.error) return body.error;
  return `Request failed (${status})`;
}

/**
 * Every call site across the app was written against paths like "/api/cohorts",
 * which match the NestJS backend's routes exactly (it uses the same "/api"
 * global prefix). So callers don't need to change — only the base URL and
 * the auth header do.
 */
export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    // The backend is unreachable (down, wrong NEXT_PUBLIC_API_URL, offline).
    // A raw TypeError("Failed to fetch") is meaningless to an end user.
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 means the token itself is missing/expired/invalid. A 404 on a
    // "/me" endpoint specifically means the token is valid but no longer
    // points at a real account — most commonly because the database was
    // re-seeded after the person logged in, so their session still carries
    // the old (now-deleted) user id. Both cases are unrecoverable without a
    // fresh login (which mints a token from the current database state), so
    // both get the same treatment: sign out and send them back to /login
    // rather than leaving them stuck on a confusing error.
    const isStaleIdentity = res.status === 401 || (res.status === 404 && path.endsWith("/me"));
    if (isStaleIdentity) {
      signOut({ callbackUrl: "/login" });
    }
    throw new Error(extractMessage(data, res.status));
  }

  return data as T;
}

/**
 * For endpoints that return a file (PDF reports) rather than JSON. A plain
 * <a href> or window.open() can't attach an Authorization header, so we fetch
 * the file as a blob with the bearer token and trigger the download manually.
 */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const session = await getSession();
  const token = session?.accessToken;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 401) signOut({ callbackUrl: "/login" });
    const data = await res.json().catch(() => ({}));
    throw new Error(extractMessage(data, res.status));
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
