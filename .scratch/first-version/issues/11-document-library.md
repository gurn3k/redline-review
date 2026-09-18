# 11: Document library

**What to build:** A logged-in User's analyzed documents are saved to a
personal library: extracted text plus the full `AnalysisResult`, scoped to
their account. The User can see their past documents in one place and open
a past one to view its saved analysis again, without re-uploading or
re-running it.

**Blocked by:** 01 (Auth and app shell), 04 (Core analyzeDocument seam and
Clear baseline)

**Status:** ready-for-agent

- [ ] After analysis completes, the document's extracted text and full
      `AnalysisResult` are persisted to Supabase, scoped to the
      authenticated user.
- [ ] User sees a list of their previously analyzed documents.
- [ ] Opening a past document shows its previously computed summary, flags
      (or Clear result), and counter-offers without re-running analysis.
- [ ] No cross-user access: a User can only see their own library entries.
