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
    createOrder: (body: object, userId: string) =>
      apiFetch(`/api/credits/create-order?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    orders: (userId: string) =>
      apiFetch(`/api/credits/orders/${userId}`),
  },
  payments: {
    verify: (body: object) =>
      apiFetch("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  referral: {
    stats: (userId: string, baseUrl?: string) => {
      const q = baseUrl ? `?base_url=${encodeURIComponent(baseUrl)}` : "";
      return apiFetch(`/api/referral/${userId}${q}`);
    },
    claim: (body: { referee_id: string; referral_code: string }) =>
      apiFetch("/api/referral/claim", {
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
  profile: {
    getResume: (userId: string) =>
      apiFetch(`/api/profile/resume?user_id=${userId}`),
    uploadResume: (userId: string, file: File): Promise<{ path: string; filename: string; signed_url: string }> => {
      const form = new FormData();
      form.append("resume", file);
      return fetch(`${API_URL}/api/profile/resume?user_id=${userId}`, {
        method: "POST",
        body: form,
      }).then(async r => {
        if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail ?? `API error ${r.status}`); }
        return r.json();
      });
    },
    deleteResume: (userId: string) =>
      fetch(`${API_URL}/api/profile/resume?user_id=${userId}`, { method: "DELETE" }),
    getGmail: (userId: string) =>
      apiFetch(`/api/profile/gmail?user_id=${userId}`),
    saveGmail: (userId: string, body: { sender_email: string; gmail_app_password: string }) =>
      apiFetch(`/api/profile/gmail?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};
