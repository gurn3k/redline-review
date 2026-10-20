/**
 * Google Analytics 4 on the public pages only, set up like the portfolio
 * (portfolio/src/lib/analytics.ts): one shared property across gurn3k builds
 * (filter reports by hostname), ad features off, and no analytics cookies for
 * visitors in the EEA, the UK or Switzerland. See docs/adr/0012.
 *
 * Signed-in pages carry document names and contract text, so nothing is sent
 * from them. Leave GA_ID empty to turn analytics off.
 */
export const GA_ID = "G-LNBMSHVG6Q";

const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT",
  "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

/** The pages analytics may see: the public ones a visitor reaches without signing in. */
export function isTrackedPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/sample" ||
    pathname === "/privacy" ||
    pathname === "/login" ||
    pathname.startsWith("/login/")
  );
}

type Click = { name: string; params?: Record<string, string> };

/** The event for a followed link, or null for links we don't count. */
export function classifyClick(href: string, from: string): Click | null {
  const url = new URL(href, "https://redline.invalid");
  if (url.hostname !== "redline.invalid") return null;
  if (url.pathname === "/sample") return { name: "sample_click", params: { from } };
  if (url.pathname === "/login") return { name: "signup_click", params: { from } };
  return null;
}

type Gtag = (...args: unknown[]) => void;
type GaWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag } & Record<string, unknown>;

/**
 * Sets GA's own kill switch (window["ga-disable-<id>"]) before the URL changes,
 * so a client-side move into the signed-in area (router.push("/home") after
 * sign-in) is never reported. GA's script loads later and wraps pushState on
 * top of this, and this popstate listener runs before GA's.
 */
export function installPathGuard(win: GaWindow, id: string) {
  const flag = `ga-disable-${id}`;
  const check = (url: string | URL | null | undefined) => {
    win[flag] = !isTrackedPath(new URL(url ?? win.location.href, win.location.href).pathname);
  };
  for (const method of ["pushState", "replaceState"] as const) {
    const original = win.history[method].bind(win.history);
    win.history[method] = (data: unknown, unused: string, url?: string | URL | null) => {
      check(url);
      return original(data, unused, url);
    };
  }
  win.addEventListener("popstate", () => check(win.location.href));
  check(win.location.href);
}

/** Consent defaults, config and the deferred gtag.js load. Call once, on a tracked page. */
export function startAnalytics(win: GaWindow, doc: Document, id: string) {
  installPathGuard(win, id);
  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  win.dataLayer = win.dataLayer || [];
  // gtag.js reads the `arguments` object itself, not an array, so this can't be an arrow function.
  win.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    win.dataLayer!.push(arguments);
  };
  win.gtag("consent", "default", { ...denied, region: CONSENT_REGIONS });
  win.gtag("consent", "default", { ...denied, analytics_storage: "granted" });
  win.gtag("js", new Date());
  win.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });

  doc.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const click = a && classifyClick(a.getAttribute("href") ?? "", win.location.pathname);
      if (click) win.gtag!("event", click.name, click.params);
    },
    true,
  );

  const load = () => {
    const s = doc.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    doc.head.appendChild(s);
  };
  if ("requestIdleCallback" in win) win.requestIdleCallback(load, { timeout: 2000 });
  else setTimeout(load, 1);
}
