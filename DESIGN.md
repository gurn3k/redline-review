---
name: Redline
description: A bank-wire confirmation ledger for contract risk — every flag stamped, cited, and clipped to the exact sentence it names.
colors:
  ledger-cream: "#f2ede1"
  ledger-cream-deep: "#e7ded0"
  ledger-paper-edge: "#d9cdb8"
  ink: "#242220"
  ink-soft: "#524c43"
  confirm-green: "#1f5c3f"
  confirm-green-soft: "#dfeee5"
  danger-red: "#9b1c1c"
  danger-red-soft: "#f6dcda"
  unusual-amber: "#8a5a2b"
  unusual-amber-soft: "#f0e3cd"
  rule-line: "rgba(36, 34, 32, 0.22)"
  rule-line-soft: "rgba(36, 34, 32, 0.12)"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 4.2rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "normal"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.5rem, 2.8vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  pill: "50%"
spacing:
  xs: "0.5rem"
  sm: "0.9rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "3rem"
  2xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.confirm-green}"
    textColor: "{colors.ledger-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.95rem 1.9rem"
  button-primary-hover:
    backgroundColor: "#17462f"
    textColor: "{colors.ledger-cream}"
---

# Design System: Redline

## Overview

**Creative North Star: "The Wire Confirmation"**

Redline's landing page renders each contract risk flag as a stamped, verified confirmation clipped to the exact sentence it names — the visual grammar of a bank-wire teleprinter ledger, not a dashboard. A vertical source tape of real contract prose feeds down the left column in tabular mono; on the right, stamped confirmation slips punch out one at a time, each tethered by a perforated tear-line and a dashed SVG path to its exact source citation. The lead flag (first, most severe) is rendered enormous — min-height 30rem, oversized type — filling real vertical space rather than sitting as a card among cards. This refuses the category's dashboard-card-with-a-score default: nothing here is a floating score: every claim sits next to its own cited proof.

The palette stays warm and paper-toned at rest (ledger cream, soft charcoal ink) and reserves color strictly for verdicts: confirmation green for Clear, stamp red for Dangerous, amber-brown for Unusual — never used decoratively elsewhere. Texture (ink-stamp grain, perforation punch-holes) is generated live via SVG filter chains (`feTurbulence` + `feDisplacementMap` + `feComponentTransfer`), not pre-rendered raster imagery — there are no shipped rasters in this build, so no image-provenance concerns apply.

**Key Characteristics:**
- Ledger-cream ground with a charcoal-ink body voice; verdict color (green/red/amber) appears only inside stamps, borders, and shadows tied to a severity tier.
- Tabular monospace (IBM Plex Mono) for every citation, reference tag, and label; Space Grotesk for display/headline weight; IBM Plex Sans for readable prose.
- Rubber-stamp ink texture and punch-hole perforations are both generated at runtime through inline SVG filters — no raster assets anywhere in the build.
- The lead confirmation dominates the viewport rather than joining a grid of equal cards.
- §-style reference tags replace sequential numbering throughout, echoing the source tape's own citation chips.

## Colors

Warm, paper-toned neutrals at rest; saturated ink is spent only on verdicts.

### Primary
- **Confirmation Green** (`#1f5c3f`): the Clear-tier stamp/border color, and — doubling as the site's only accent — the primary CTA button background. A soft mint variant (`#dfeee5`) is declared alongside it but not yet consumed by any rendered surface.

### Secondary
- **Stamp Red** (`#9b1c1c`): the Dangerous-tier stamp fill, lead-card border, and lead-card ambient shadow tint. Reserved — it appears nowhere else on the page (not in nav, links, or the CTA). A soft blush variant (`#f6dcda`) is declared but unused in the current build.
- **Unusual Amber-Brown** (`#8a5a2b`): the Unusual-tier stamp fill and card border. A soft tan variant (`#f0e3cd`) is declared but unused in the current build.

### Neutral
- **Ledger Cream** (`#f2ede1`): the page ground.
- **Ledger Cream Deep** (`#e7ded0`): the tape panel, confirmation card, and hero-gradient surface — one step darker than the ground to read as a distinct "paper" layer.
- **Ledger Paper Edge** (`#d9cdb8`): scrollbar thumb and paper-edge tinting.
- **Charcoal Ink** (`#242220`): body prose, headings, and default text color.
- **Soft Ink** (`#524c43`): secondary/supporting text (sub-headlines, captions, footnotes).
- **Rule Line** (`rgba(36,34,32,0.22)`) / **Rule Line Soft** (`rgba(36,34,32,0.12)`): card borders, section-divider rules, and citation-block backgrounds — the "continuous-feed ledger rule" motif.

### Named Rules
**The Reserved Verdict Rule.** Stamp red, confirmation green, and unusual amber-brown are used exclusively inside severity-tier stamps, card borders, and their matching shadow tints. None of the three appears as a decorative or structural color anywhere else on the page — the CTA's use of confirmation green is the single exception, and it is legible as a "Clear to proceed" cue rather than decoration.

## Typography

**Display Font:** Space Grotesk (with ui-sans-serif, sans-serif fallback)
**Body Font:** IBM Plex Sans (with ui-sans-serif, sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace fallback)

**Character:** A confident geometric display face paired with a plain, legible sans for prose and a tabular teleprinter mono for anything that functions as evidence — citation, reference tag, or label. The pairing reads as instrument-panel precision rather than editorial warmth.

### Hierarchy
- **Display** (700, `clamp(2.1rem, 5vw, 4.2rem)`, line-height 1.05, letter-spacing -0.015em): the hero H1 only.
- **Headline** (500, 2.5rem, line-height 1.1): the lead confirmation's title — the single place a confirmation title is treated at display scale.
- **Title** (700, `clamp(1.5rem, 2.8vw, 2rem)`): section headings (Mechanism, Clause Index, Final CTA).
- **Body** (400/500/600, ~1–1.15rem, line-height 1.55–1.65, max ~62–65ch): hero subhead, section prose, footer.
- **Label** (600, 0.68–0.72rem, letter-spacing 0.05–0.09em, uppercase): tape label, counter label, stamp label — all IBM Plex Mono.

### Named Rules
**The Cited-in-Mono Rule.** Anything that functions as evidence — a citation, a §-reference tag, a tabular figure — is set in IBM Plex Mono with `tabular-nums`. Prose that makes a claim, rather than showing proof, is set in IBM Plex Sans or Space Grotesk. Mixing the two inside a single line is how the tape and the confirmation cards visually agree they're citing the same fact.

## Layout

Every section below the hero uses `.measure`: a centered column capped at 72rem with 1.5rem gutters (2.5rem at ≥640px). The hero is the deliberate exception — full-bleed with its own gutter padding and a tinted cream gradient background, its inner `.hero-ledger` grid capped at 100rem so the two-column ledger can run wider than the prose measure.

`.hero-ledger` stacks to a single column by default and splits to a 0.85fr/1.15fr two-column grid at ≥900px (source tape narrower than the confirmation stack, 2.5rem gap). Below 900px the cross-column dashed tether is suppressed entirely — the shared §-reference tag on both the tape chip and the confirmation card becomes the sole visual link on mobile, not a compressed version of the desktop tether.

Section rhythm below the hero: 3–5rem vertical padding per section, each opening with a 1px `rule-line-soft` top border — the "continuous-feed ledger rule" that stitches sections together instead of a card grid or alternating background bands. Internal rhythm is tighter: confirmation cards stack with a 1.1rem gap; ledger-list rows are 0.9rem tall with a `rule-line-soft` bottom rule per row.

## Elevation & Depth

Flat by default: cards and the tape panel sit on a 1px `rule-line` border at their `ledger-cream-deep` tone, with no ambient shadow at rest. Depth is introduced only for elements that are meant to read as freshly "stamped" or physically lifted: confirmation cards carry a soft diffuse shadow (`0 8px 20px rgba(36,34,32,0.1)`), the lead card a larger, red-tinted diffuse shadow (`0 20px 44px rgba(155,28,28,0.18)`), and the CTA button a green-tinted diffuse shadow (`0 6px 14px rgba(31,92,63,0.28)`, deepening on hover). All shadows in the build are soft and centered/diffuse — there is no hard-offset, unblurred "brutalist" shadow anywhere in this world.

### Shadow Vocabulary
- **Confirmation lift** (`box-shadow: 0 8px 20px rgba(36, 34, 32, 0.1)`): default confirmation card, on stamp-in.
- **Lead lift** (`box-shadow: 0 20px 44px rgba(155, 28, 28, 0.18)`): the lead (most severe) confirmation only.
- **CTA lift** (`box-shadow: 0 6px 14px rgba(31, 92, 63, 0.28)`, hover `0 9px 18px rgba(31, 92, 63, 0.34)`): the primary stamp-styled action button.

### Named Rules
**The Soft-Stamp Rule.** Every shadow in this world is diffuse and centered, never a hard unblurred offset. Depth reads as ink lifting off paper, not as a cutout block.

## Shapes

Corners stay small and consistent: 2–4px on cards, chips, and the CTA button — barely-rounded rectangles, not pills or sharp brutalist squares. The signature form devices are generative rather than geometric: a rubber-stamp ink-grain texture (`feTurbulence` + `feDisplacementMap` + `feComponentTransfer`, filter `#ink-grain`) gives severity stamps uneven density and bled edges instead of a flat color fill; a tiled punch-hole pattern (`#perf-v` / `#perf-h`, run through a gentler `#perf-rough` turbulence filter for irregular hole edges) forms the perforated tear-line between a cited source line and its confirmation. Stamps and the CTA carry a small intentional rotation (stamp badges −2° to −2.4°, CTA −1.1° at rest, straightening on hover) — the only place the layout departs from strict rectilinearity, read as an analog imprint rather than decoration.

## Components

### Buttons
- **Shape:** small rounded corners (3px), no pill shapes.
- **Primary:** confirmation-green background (`#1f5c3f`), ledger-cream text, IBM Plex Mono uppercase label (600, 0.04em tracking), −1.1° resting rotation, soft green ambient shadow. Two sizes: `cta-small` (0.55rem/1rem padding, nav) and `cta-large` (0.95rem/1.9rem padding, final CTA).
- **Hover / Focus:** rotation straightens to 0°, lifts 1px, shadow deepens, background darkens to `#17462f`. Focus-visible uses a 2px confirmation-green outline with 3px offset site-wide (not button-specific).

### Cards / Containers
- **Corner Style:** 4px radius.
- **Background:** `ledger-cream-deep`, one step off the page ground.
- **Border:** 1px `rule-line` at rest; the lead confirmation widens this to 3px and swaps color to its severity tier (red for Dangerous).
- **Shadow Strategy:** see Elevation & Depth — soft diffuse lift on stamp-in, none at rest for the tape panel.
- **Internal Padding:** compact cards 0.7rem/0.95rem/0.85rem; the lead card 3rem/3.25rem.

### Wire Confirmation Card (signature)
The core unit of the page. Each card pairs a `StampBadge` (severity tier, rotated, ink-grain textured) with a §-reference tag, a title, a mono-set quoted citation block (exact substring of the source tape, background `rule-line-soft`), a horizontal `Perforation` divider, and a "Proposed edit" counter-offer line. The first/most severe card is rendered as `.lead`: substantially larger padding, a 30rem min-height, and headline-scale title/citation/counter type, so it reads as dominant rather than one card among equals. Cards animate in with a staggered `stamp-in` keyframe (translateY + scale + slight rotation snap, exponential ease-out, per-card `animation-delay`), respecting `prefers-reduced-motion`.

### Source Tape (signature)
A `ledger-cream-deep` panel of tabular-mono contract prose (`white-space: pre-wrap`), each cited line prefixed with a `tape-ref` chip matching a confirmation card's §-tag. A vertical `Perforation` marks its outer edge. On desktop (≥900px), `HeroLedger` measures each ref chip's and each card's DOM position live (`getBoundingClientRect`, recomputed on resize/`ResizeObserver`) and draws a dashed SVG path between them, colored by severity tier; below 900px the tether is suppressed and the shared §-tag is the only link.

### Perforation (signature)
A tiled SVG circle pattern (`#perf-v` vertical / `#perf-h` horizontal) run through a gentle `feTurbulence` + `feDisplacementMap` filter (`#perf-rough`) for slightly irregular punch-hole edges. Used only as a tear-line divider: the tape's outer edge, and the horizontal rule between each card's citation and its counter-offer.

### Navigation
Sticky top bar, translucent ledger-cream (`rgba(242,237,225,0.92)`) with backdrop-blur and a 1px `rule-line-soft` bottom border. Wordmark in Space Grotesk 700, small-caps tracking. A single `cta-small` action, always in view.

## Do's and Don'ts

### Do:
- **Do** set every citation, §-reference tag, and tabular figure in IBM Plex Mono with `tabular-nums` — evidence is always mono-set.
- **Do** reserve stamp red exclusively for the Dangerous tier (stamp fill, lead-card border, lead-card shadow tint); never use it decoratively elsewhere.
- **Do** pair every flag with its exact cited source sentence inside the same card — a claim never floats without its citation beside it.
- **Do** render the lead (most severe) confirmation dominant — larger padding, larger type, real vertical space — rather than as a card among equal cards.
- **Do** build stamp texture and perforation punch-holes from inline SVG filter chains (`feTurbulence`/`feDisplacementMap`/`feComponentTransfer`), not raster images — this build ships zero rasters, all texture is code-generated.
- **Do** use §-style reference tags for section/clause indexing instead of sequential numbers.
- **Do** keep shadows soft and diffuse (ambient lift), never a hard unblurred offset.
- **Do** show an explicit "Clear" confirmation card (naming what was checked) when nothing trips a flag — never an empty state or silence, per PRODUCT.md's brand commitment.

### Don't:
- **Don't** use stamp red, confirmation green, or unusual amber-brown as general decoration — each is a reserved verdict color, and confirmation green's CTA use is the one confirmed exception, not a precedent for the other two.
- **Don't** introduce hard-offset "brutalist" box-shadows — this world's depth vocabulary is exclusively soft and diffuse.
- **Don't** add a kicker, eyebrow, glyph icon, or system display face — none exist in the built system; the §-reference tag is the sole index/label device, and Space Grotesk/IBM Plex are the only faces in use.
- **Don't** invent a numeric risk score or a hedged middle severity tier — copy stays binary (Dangerous / Unusual / Clear), per PRODUCT.md.
- **Don't** rename the established severity terms ("Dangerous", "Unusual", "Clear") or substitute "No issues found" / "all clear" language, per PRODUCT.md's Brand Commitments.
