/**
 * app/api/orchestra.ts
 *
 * Central API layer — shared config, fetch wrapper, and response helpers.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth-utils";

// ── Config ────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:8386/api";

export const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function cookieOptions(maxAge: number) {
  return { ...COOKIE_BASE, maxAge };
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

export type ApiFetchResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiFetchResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });

    const payload = await res.json().catch(() => null);
    const raw: T = payload?.data ?? payload?.result ?? payload;

    if (!res.ok) {
      const error = payload?.message ?? payload?.error ?? "Request failed.";
      return { ok: false, status: res.status, data: null, error };
    }

    return { ok: true, status: res.status, data: raw, error: null };
  } catch {
    return { ok: false, status: 500, data: null, error: "Network error." };
  }
}

export async function apiFetchAuthed<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiFetchResult<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Unauthorized." };
  }

  return apiFetch<T>(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

// ── Response helpers ──────────────────────────────────────────────────────────

export const Res = {
  ok: <T>(data: T, status = 200) =>
    NextResponse.json(data, { status }),

  badRequest: (message = "Invalid request.") =>
    NextResponse.json({ error: message }, { status: 400 }),

  unauthorized: (message = "Unauthorized.") =>
    NextResponse.json({ error: message }, { status: 401 }),

  upstream: (message: string, status: number) =>
    NextResponse.json({ error: message }, { status }),

  serverError: (message = "Internal server error.") =>
    NextResponse.json({ error: message }, { status: 500 }),
};
