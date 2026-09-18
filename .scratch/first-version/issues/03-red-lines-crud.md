# 03: Red-lines list (CRUD)

**What to build:** A logged-in User maintains their own editable list of
red lines — terms they specifically care about, independent of Redline's
standard clause set. This list is scoped to their account and persists
across sessions. It doesn't drive any analysis yet (that's ticket 04) —
this ticket only makes the list itself creatable, editable, and durable.

**Blocked by:** 01 (Auth and app shell)

**Status:** ready-for-agent

- [ ] User can add a red line (free text) from an authenticated screen.
- [ ] User can edit and delete an existing red line at any time.
- [ ] Red lines are persisted to Supabase, scoped to the authenticated user
      (no cross-user access).
- [ ] The list is visible and reflects the current state after add/edit/
      delete without a manual refresh.
