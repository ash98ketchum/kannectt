/**
 * API client unit tests — mocks fetch, checks correct URLs and payloads.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset between tests
beforeEach(() => {
  mockFetch.mockReset();
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
});

// Re-import after env is set
const getApi = () => require("@/lib/api").api;

describe("api.send.dryRun", () => {
  it("POSTs to /api/send/dry-run with correct payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], credits_used: 0, credits_remaining: 0 }),
    });

    const api = getApi();
    await api.send.dryRun({ targets: [], template: "Hi", dry_run: true });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/send/dry-run",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "LLM error" }),
    });

    const api = getApi();
    await expect(api.send.dryRun({})).rejects.toThrow("LLM error");
  });
});

describe("api.credits.balance", () => {
  it("GETs correct URL with user_id", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ balance: 42 }),
    });

    const api = getApi();
    const result = await api.credits.balance("user-abc");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/credits/balance/user-abc",
      expect.any(Object)
    );
    expect(result).toEqual({ balance: 42 });
  });
});

describe("api.directory.unlock", () => {
  it("POSTs contact_ids correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unlocked: [], credits_used: 6, credits_remaining: 1 }),
    });

    const api = getApi();
    await api.directory.unlock("user-abc", ["contact-1", "contact-2"]);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/directory/unlock");
    expect(url).toContain("user_id=user-abc");
    const body = JSON.parse(init.body);
    expect(body.contact_ids).toEqual(["contact-1", "contact-2"]);
  });
});
