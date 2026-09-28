/**
 * Tests for the API client (lib/api.ts)
 */

const MOCK_API_URL = "http://localhost:8000";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock env var
process.env.NEXT_PUBLIC_API_URL = MOCK_API_URL;

// Re-import after env is set
let api: typeof import("@/lib/api").api;

beforeAll(async () => {
  const mod = await import("@/lib/api");
  api = mod.api;
});

beforeEach(() => {
  mockFetch.mockReset();
});

function mockOkResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  } as Response);
}

function mockErrorResponse(status: number, detail: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ detail }),
  } as Response);
}

// ── send.dryRun ─────────────────────────────────────────────────────────────

describe("api.send.dryRun", () => {
  it("POSTs to /api/send/dry-run and returns results", async () => {
    const results = [{ to: "a@b.com", subject: "Hi", body: "Body", status: "preview", company: "B" }];
    mockOkResponse({ results, credits_used: 0, credits_remaining: 7 });

    const body = { targets: [{ mail: "a@b.com", type: "recruiter" }], template: "Hi {{COMPANY_NAME}}" };
    const res = await api.send.dryRun(body) as { results: typeof results };

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_API_URL}/api/send/dry-run`,
      expect.objectContaining({ method: "POST" })
    );
    expect(res.results).toHaveLength(1);
    expect(res.results[0].status).toBe("preview");
  });

  it("throws on API error", async () => {
    mockErrorResponse(500, "Internal server error");
    await expect(api.send.dryRun({})).rejects.toThrow("Internal server error");
  });
});

// ── credits.balance ──────────────────────────────────────────────────────────

describe("api.credits.balance", () => {
  it("GETs balance for user", async () => {
    mockOkResponse({ balance: 42 });
    const res = await api.credits.balance("user-123") as { balance: number };
    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_API_URL}/api/credits/balance/user-123`,
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) })
    );
    expect(res.balance).toBe(42);
  });

  it("throws on 404", async () => {
    mockErrorResponse(404, "User not found");
    await expect(api.credits.balance("bad-id")).rejects.toThrow("User not found");
  });
});

// ── credits.checkout ─────────────────────────────────────────────────────────

describe("api.credits.checkout", () => {
  it("POSTs to checkout with user_id query param", async () => {
    mockOkResponse({ checkout_url: "https://stripe.com/checkout/abc" });
    const res = await api.credits.checkout(
      { package: "pro", success_url: "http://localhost:3000/credits?success=1", cancel_url: "http://localhost:3000/credits" },
      "user-456"
    ) as { checkout_url: string };

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_API_URL}/api/credits/checkout?user_id=user-456`,
      expect.objectContaining({ method: "POST" })
    );
    expect(res.checkout_url).toContain("stripe.com");
  });

  it("throws 503 when stripe not configured", async () => {
    mockErrorResponse(503, "Payments not configured");
    await expect(
      api.credits.checkout({ package: "starter", success_url: "/", cancel_url: "/" }, "uid")
    ).rejects.toThrow("Payments not configured");
  });
});

// ── directory.list ───────────────────────────────────────────────────────────

describe("api.directory.list", () => {
  it("GETs contacts with user_id", async () => {
    const contacts = [{ id: "c1", name: "Jane D.", company: "Stripe", masked_email: "j●●●●@stripe.com" }];
    mockOkResponse(contacts);
    const res = await api.directory.list("user-789") as typeof contacts;
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("user_id=user-789"),
      expect.anything()
    );
    expect(res).toHaveLength(1);
    expect(res[0].company).toBe("Stripe");
  });

  it("appends dept filter when provided", async () => {
    mockOkResponse([]);
    await api.directory.list("uid", { dept: "Engineering" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("dept=Engineering"),
      expect.anything()
    );
  });
});

// ── directory.unlock ─────────────────────────────────────────────────────────

describe("api.directory.unlock", () => {
  it("POSTs contact_ids and returns unlocked contacts", async () => {
    const unlocked = [{ id: "c1", email: "jane@stripe.com", is_unlocked: true }];
    mockOkResponse({ unlocked, credits_used: 3, credits_remaining: 4 });

    const res = await api.directory.unlock("user-1", ["c1"]) as { unlocked: typeof unlocked; credits_remaining: number };
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("user_id=user-1"),
      expect.objectContaining({ method: "POST" })
    );
    expect(res.unlocked[0].email).toBe("jane@stripe.com");
    expect(res.credits_remaining).toBe(4);
  });

  it("throws 402 when insufficient credits", async () => {
    mockErrorResponse(402, "Insufficient credits: need 3, have 1");
    await expect(api.directory.unlock("uid", ["c1"])).rejects.toThrow("Insufficient credits");
  });
});
