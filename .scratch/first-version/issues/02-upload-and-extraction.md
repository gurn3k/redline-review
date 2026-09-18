# 02: Upload and text extraction

**What to build:** A logged-in User uploads a document (Incoming paper —
see `CONTEXT.md`). The file is parsed client-side; only the extracted text
is sent to the backend and persisted, scoped to that user. The original
file is never stored. If text can't be reliably extracted, or the document
has no text layer at all (e.g. a scanned image), the User sees a clear,
specific error instead of being allowed to proceed on garbled or absent
text.

**Blocked by:** 01 (Auth and app shell)

**Status:** ready-for-agent

- [ ] User can upload a document (PDF and at least one other common format)
      from an authenticated screen.
- [ ] Parsing happens client-side; the original file is never sent to the
      backend or persisted anywhere.
- [ ] Extracted text is persisted to Supabase, scoped to the authenticated
      user (no cross-user access).
- [ ] If extraction fails or yields unreliable text, the User sees an
      explicit error naming the problem — no analysis is attempted on bad
      text.
- [ ] If the document has no extractable text layer at all, the User sees
      an explicit message telling them to get a proper digital copy,
      distinct from the generic extraction-failure error.
- [ ] No analysis, summary, or flags yet — this ticket ends at "text
      extracted and stored" or "clear error shown."
