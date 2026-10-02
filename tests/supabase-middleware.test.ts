import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

const { updateSession } = await import("@/lib/supabase/middleware");

function requestFor(pathname: string) {
  return new NextRequest(new URL(pathname, "https://redline.test"));
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    getUser.mockReset();
  });

  it("sends a signed-in reader from /login to /home", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await updateSession(requestFor("/login"));
    expect(response.headers.get("location")).toBe("https://redline.test/home");
  });

  it("shows /login to a signed-out visitor", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await updateSession(requestFor("/login"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("sends a signed-out visitor from /home to /login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const response = await updateSession(requestFor("/home"));
    expect(response.headers.get("location")).toBe("https://redline.test/login");
  });
});
