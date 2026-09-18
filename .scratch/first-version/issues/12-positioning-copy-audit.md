# 12: Positioning/UPL disclaimer audit

**What to build:** A sweep across every surface that shows Redline's
output — summaries, flags, counter-offer drafts, the Q&A box, and the Clear
result — confirming each is framed as explaining document text and
patterns, never as legal advice, a determination of enforceability, or what
the User should do (ADR 0010). This is a copy/framing pass over screens
built in earlier tickets, not new product logic.

**Blocked by:** 04, 05, 06, 07, 08, 09, 10, 11 (every screen this audits
must exist first)

**Status:** ready-for-agent

- [ ] Summary screen copy frames output as explaining the document, not
      giving advice.
- [ ] Flag copy (for every clause type from 05-09) references the cited
      sentence as the thing being explained, not a freestanding legal
      verdict.
- [ ] Counter-offer copy across all clause types is phrased as "example
      language you could propose," never "the legally correct fix" —
      re-verify the guarantee/certainty deny-list holds across all of them
      together, not just per-ticket.
- [ ] Q&A answers are framed as document-grounded explanation, not legal
      guidance.
- [ ] The Clear result's copy doesn't imply a legal determination of
      safety.
- [ ] No screen anywhere in the app implies Redline determines
      enforceability or what a court would decide, or gives
      jurisdiction-specific guidance (explicitly out of scope, ADR 0010).
- [ ] The footer disclaimer from ticket 01 is present on every screen
      audited here (confirm, don't re-author).
