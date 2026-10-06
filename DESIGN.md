---
name: Redline
description: Counsel Memo. Warm paper, ink and one oxblood accent; every flag sits beside the sentence it came from.
colors:
  bg: "#f7f4ee"
  bg-alt: "#f1ece2"
  surface: "#fffdf9"
  paper: "#ffffff"
  ink: "#1c1917"
  ink-soft: "#44403c"
  muted: "#78716c"
  line: "#e7e1d6"
  line-strong: "#d6cfc2"
  brand: "#8f1d22"
  brand-hover: "#761419"
  danger: "#8f1d22"
  danger-bg: "#f6e3e1"
  unusual: "#8a5410"
  unusual-bg: "#f6ead2"
  clear: "#2f6b4a"
  clear-bg: "#e6f0e9"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.6rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.7rem, 3vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1.12
  contract:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.75
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.06em"
    textTransform: "uppercase"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
---

# Design System: Redline

Chosen 2026-10-06 from three directions (`.impeccable/review/2026-10-06-directions/`, option B). Replaces "The Wire Confirmation" (2026-09-18), which read as plain and scrambled (`.impeccable/review/2026-10-06-before.md`). The 2026-09-18 version is in git history.

## Overview

**North star: "Counsel Memo."** Redline should look like a careful memo from someone on the reader's side: warm paper, confident serif headings, plain sans for the interface, and one oxblood accent. It's built for two readers at once (PRODUCT.md, "Visitors"): a small business owner with a contract on their desk, and a hiring manager deciding in 30 seconds whether the product is real.

The signature is the **analysis workspace**: flags in one column, the contract in the other, every cited sentence highlighted in place. Selecting either side selects the other. The same component renders the signed-in document page, the public `/sample` page and the landing page's proof section, so the public demo can never look better than the product.

## Color

- **Ground:** warm paper `bg`, with `bg-alt` for alternating landing sections. Panels sit on `surface`; the contract itself sits on pure white `paper`, so it reads as the document.
- **Ink:** `ink` for headings and contract text, `ink-soft` for body copy, `muted` for metadata.
- **Brand:** oxblood `brand` for primary buttons, the wordmark rule, eyebrows and active navigation.
- **Severity:** `danger` (the same oxblood), `unusual` (amber-brown) and `clear` (green), each with a pale background for chips, counts and highlights. Severity color is the only strong color inside the workspace.
- **Rule:** never beige on beige. If two adjacent surfaces are the same family, separate them with a `line` border or a white `paper`.

## Typography

Two families, no monospace.

- **Newsreader (serif):** headings, flag titles, counts, and all contract text, including quoted citations. The contract's voice is always serif, so a quote in a flag card visibly matches its highlighted sentence.
- **Instrument Sans:** everything else: body copy, buttons, navigation, labels, forms.
- **Labels:** small uppercase sans (`typography.label`), used sparingly: section eyebrows, "The contract," "Language you could propose," table headers. No "§" prefixes.

## Layout

- One container: 1200px max, 24px gutters on phones and 40px from 900px.
- Landing sections alternate `bg` and `bg-alt`, separated by a hairline, each with the same container.
- The workspace is 5:7 (flags : contract) from 960px. The contract column is sticky and scrolls on its own; below 960px, flags come first and each open flag has "Show in contract ↓".
- App pages use the full container; red lines uses a 760px reading width.

## Components

- **Buttons:** primary is oxblood with white text; ghost is a hairline border. 6px radius, never rotated. A disabled primary turns neutral (`line` background, `muted` text), not faded pink.
- **Severity chip:** uppercase label on its pale tint.
- **Flag:** collapsed shows chip and title (plus the red line's own wording for red-line flags); open adds the cited sentence (serif, left rule in the severity color), the explanation, and the counter-offer in a green box with Copy. An open flag gets a severity-colored border and a soft ring.
- **Highlight:** pale severity tint with a 2px underline; the selected flag's sentence darkens. Clicking a highlight opens its flag.
- **Overview:** title, metadata with the date in words, the summary, and big serif counts (Dangerous, Unusual), or a single Clear count naming that nothing cleared the bar.
- **Navigation:** public pages show Sample analysis, How it was built and Try it. Signed-in pages show Upload, Library and Red lines with an oxblood underline on the current page, plus Log out.
- **Library:** a real table with document, date in words and result, colored by severity.

## Do

- Show the contract's own words in serif wherever they appear.
- Keep the public sample real: it renders `lib/sample/coldline-analysis.json`, generated by `scripts/generate-sample.ts`, and `tests/sample-analysis.test.ts` checks every quote.
- Name the reader ("small business owners") and their paper (vendor and service agreements, equipment contracts, commercial leases).

## Don't

- Add a third typeface or bring back monospace labels.
- Tilt, stamp or texture controls.
- Hand-write sample flags or invent customers, logos, prices or usage numbers.
- Let a section change content width mid-page.
