# 12. Count visits with Google Analytics on the public pages only

## Decision

The public pages (`/`, `/sample`, `/privacy`, `/login`) load Google
Analytics 4 with the property shared across gurn3k builds
(`G-LNBMSHVG6Q`, reports filtered by hostname), set up like the
portfolio: Google signals and ad personalisation off, analytics cookies
denied by default in the EEA, UK and Switzerland, and gtag.js fetched
only when the browser is idle. Two events: `sample_click` and
`signup_click`, each with the page they came from.

Signed-in pages send nothing. A visit that starts there never loads
the script. A visit that starts on a public page and moves in by
client-side navigation (sign-in calls `router.push("/home")`) is stopped
by GA's own kill switch, `window["ga-disable-<id>"]`, which
`lib/analytics.ts` sets inside `pushState`/`replaceState` and on
`popstate` before GA can report the new URL.

## Alternatives

- `@next/third-parties` `GoogleAnalytics`: a new dependency, and it
  tracks every route, including document pages whose titles carry file
  names.
- Turning off history-based page views in GA: the setting belongs to the
  shared property's web stream, so it would also stop them on the
  portfolio, which is a single-page app.

## Consequences

- The privacy page and the public footer say visits are counted.
- If a public route is added, add it to `isTrackedPath` in
  `lib/analytics.ts` or it won't be counted.
- If GA ever stops honouring `ga-disable-<id>`, signed-in URLs (document
  IDs, not text) and titles could leak; the test in
  `tests/analytics.test.ts` covers only our side.
