import { describe, expect, it } from "vitest";
import { classifyClick, installPathGuard, isTrackedPath } from "@/lib/analytics";

describe("isTrackedPath", () => {
  it("allows the public pages only", () => {
    for (const p of ["/", "/sample", "/privacy", "/login", "/login/reset"]) expect(isTrackedPath(p)).toBe(true);
    for (const p of ["/home", "/documents/42", "/library", "/red-lines", "/auth/callback", "/loginx"]) {
      expect(isTrackedPath(p)).toBe(false);
    }
  });
});

describe("classifyClick", () => {
  it("names sample and sign-up links, with the page they were clicked on", () => {
    expect(classifyClick("/sample", "/")).toEqual({ name: "sample_click", params: { from: "/" } });
    expect(classifyClick("/login", "/sample")).toEqual({ name: "signup_click", params: { from: "/sample" } });
  });

  it("ignores other links", () => {
    expect(classifyClick("/privacy", "/")).toBeNull();
    expect(classifyClick("https://github.com/gurn3k/redline-review", "/")).toBeNull();
    expect(classifyClick("https://evil.example/login", "/")).toBeNull();
  });
});

describe("installPathGuard", () => {
  function fakeWindow(start: string) {
    const listeners: Array<() => void> = [];
    const win = {
      location: { href: start },
      history: {
        pushState: (_d: unknown, _u: string, url?: string) => { win.location.href = new URL(url!, win.location.href).href; },
        replaceState: (_d: unknown, _u: string, url?: string) => { win.location.href = new URL(url!, win.location.href).href; },
      },
      addEventListener: (_t: string, fn: () => void) => listeners.push(fn),
      back(to: string) { win.location.href = to; listeners.forEach((fn) => fn()); },
    } as unknown as Parameters<typeof installPathGuard>[0] & { back(to: string): void };
    return win;
  }
  const flag = "ga-disable-G-TEST";

  it("turns GA off before the URL moves into the signed-in area, and back on for public pages", () => {
    const win = fakeWindow("https://redline.test/login");
    installPathGuard(win, "G-TEST");
    expect(win[flag]).toBe(false);

    // GA's script loads later, wraps pushState on top of ours and reports after the URL changes.
    const ours = win.history.pushState;
    let flagWhenGaReports: unknown;
    win.history.pushState = (...args: Parameters<typeof ours>) => {
      ours(...args);
      flagWhenGaReports = win[flag];
    };
    win.history.pushState(null, "", "/home");
    expect(flagWhenGaReports).toBe(true);

    win.back("https://redline.test/sample");
    expect(win[flag]).toBe(false);
  });
});
