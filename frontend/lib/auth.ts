import { api, unwrap } from "@/lib/api";
import type { User } from "@/types";

export type AuthPayload = { user: User; token: string };

export function saveSession(payload: AuthPayload) {
  localStorage.setItem("adrm_token", payload.token);
  localStorage.setItem("adrm_user", JSON.stringify(payload.user));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("adrm_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("adrm_token");
  localStorage.removeItem("adrm_user");
  window.location.href = "/login";
}

export async function login(email: string, password: string) {
  const data = unwrap<AuthPayload>(await api.post("/auth/login", { email, password }));
  saveSession(data);
  return data;
}

export async function signup(payload: { name: string; email: string; password: string; role: string }) {
  const data = unwrap<AuthPayload>(await api.post("/auth/signup", payload));
  saveSession(data);
  return data;
}

export async function demoLogin(email = "admin@example.com") {
  try {
    return await login(email, "password123");
  } catch {
    await api.post("/seed");
    return login(email, "password123");
  }
}
