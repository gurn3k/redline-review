# 02: Upload and text extraction

**What to build:** A logged-in User uploads a document (Incoming paper —
see `CONTEXT.md`). The file is parsed client-side; only the extracted text
is sent to the backend and persisted, scoped to that user. The original
file is never stored. If text can't be reliably extracted, or the document
has no text layer at all (e.g. a scanned image), the User sees a clear,
specific error instead of being allowed to proceed on garbled or absent
text.

**Blocked by:** 01 (Auth and app shell)

**Status:** done

- [x] User can upload a document (PDF and at least one other common format)
      from an authenticated screen.
- [x] Parsing happens client-side; the original file is never sent to the
      backend or persisted anywhere.
- [x] Extracted text is persisted to Supabase, scoped to the authenticated
      user (no cross-user access).
- [x] If extraction fails or yields unreliable text, the User sees an
      explicit error naming the problem — no analysis is attempted on bad
      text.
- [x] If the document has no extractable text layer at all, the User sees
      an explicit message telling them to get a proper digital copy,
      distinct from the generic extraction-failure error.
- [x] No analysis, summary, or flags yet — this ticket ends at "text
      extracted and stored" or "clear error shown."

## Comments

Built: `app/(app)/home/document-intake-card.tsx` is a Client Component
with a file input (`.pdf` / `.txt`), extracting text entirely in the
browser (`pdfjs-dist` for PDF, `file.text()` for `.txt`) and never sending
the raw file anywhere. Paste-text intake was considered (the
`app-shell.md` brief allows either) but deliberately left out — upload
alone already satisfies every acceptance criterion here, and paste would
have needed its own filename-derivation rule that the ticket doesn't spec.
A quality gate (`lib/extraction/validate.ts`, unit tested in
`tests/extraction-validate.test.ts`) checks the extracted text before
anything is saved: empty/near-empty, garbled (high control/replacement
character ratio), and too little text for the file's size all reject as
"unreliable"; a PDF with pages but ~no extracted text rejects as the
distinct "no-text-layer" (scanned-document) case, with its own copy.
Both error messages were run through the humanizer skill. On success, a
Server Action (`app/(app)/documents/actions.ts`) persists `file_name` +
`extracted_text` (never `analysis_result`) scoped to the authenticated
user from the server-side Supabase client, then redirects to
`/documents/[id]`, a Server Component shell page that loads the row
scoped to that user (404s via `notFound()` otherwise) and renders the
file name, a scrollable read-only source-text panel reusing the
`.tape`/`.tape-body` ledger classes, and two placeholder children —
`analysis-panel.tsx` (ticket 04) and `qa-box.tsx` (ticket 10) — built now
with their final prop signatures so those tickets don't need to touch
`page.tsx`.

Unverified: an actual end-to-end upload against a live Supabase project,
since none exists yet in this environment (same constraint noted for
ticket 01). What was verified: `npm run typecheck` and `npm run build`
both pass; `npm test` passes, including unit coverage of the quality-gate
function's empty/garbled/too-short/no-text-layer branches and a
render-without-crashing smoke test for the intake card; and a manual
check against a running `next dev` server confirmed `/home`,
`/documents/[id]`, and `/login` all redirect/render cleanly with no
Supabase configured (no crash, no blank screen) — consistent with
"upload requires an account" being expected in this state.
