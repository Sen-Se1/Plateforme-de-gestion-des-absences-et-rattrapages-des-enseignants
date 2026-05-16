import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = (session as any)?.accessToken;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Une erreur est survenue");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
