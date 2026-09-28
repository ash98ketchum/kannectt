const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  send: {
    dryRun: (body: object) =>
      apiFetch("/api/send/dry-run", { method: "POST", body: JSON.stringify(body) }),
    // execute uses FormData — caller builds FormData directly and calls fetch
  },
  credits: {
    balance: (userId: string) => apiFetch(`/api/credits/balance/${userId}`),
    checkout: (body: object, userId: string) =>
      apiFetch(`/api/credits/checkout?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  directory: {
    list: (userId: string, params?: Record<string, string>) => {
      const q = new URLSearchParams({ user_id: userId, ...params }).toString();
      return apiFetch(`/api/directory/?${q}`);
    },
    unlock: (userId: string, contactIds: string[]) =>
      apiFetch(`/api/directory/unlock?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify({ contact_ids: contactIds }),
      }),
  },
};
