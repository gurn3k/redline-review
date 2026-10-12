import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();
let configured = true;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () =>
    configured ? { auth: { exchangeCodeForSession } } : null,
}));

const { GET } = await import("@/app/auth/callback/route");

function callback(query: string) {
  return GET(new NextRequest(new URL(`/auth/callback${query}`, "https://redline.test")));
}

describe("GET /auth/callback", () => {
  afterEach(() => {
    exchangeCodeForSession.mockReset();
    configured = true;
  });

  it("signs the reader in and sends them to /home", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback("?code=abc");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://redline.test/home");
  });

  it("sends the reader back to /login when the exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("bad code") });
    const response = await callback("?code=abc");
    expect(response.headers.get("location")).toBe("https://redline.test/login?error=oauth");
  });

  it("sends the reader back to /login when the provider returns no code", async () => {
    const response = await callback("?error=access_denied&error_description=User+cancelled");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://redline.test/login?error=oauth");
  });

  it("ignores a redirect target smuggled into the query string", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback("?code=abc&next=https://evil.test&redirect_to=//evil.test");
    expect(response.headers.get("location")).toBe("https://redline.test/home");
  });

  it("sends the reader to /login when Supabase isn't configured", async () => {
    configured = false;
    const response = await callback("?code=abc");
    expect(response.headers.get("location")).toBe("https://redline.test/login?error=oauth");
  });
});
