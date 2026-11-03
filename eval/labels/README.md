# Labelling ten flags by hand

A page for labelling ten flags from an eval run. The labels are yours. Nothing here suggests one.

## Which run

`eval-runs/2026-11-02T15-15-46Z.json`, the newest run of gold set 1 (started 2026-11-02 at
15:15:46 UTC). Newer records exist for gold set 2, which is on hold, so they were not used.

## How the ten were picked

Only flags the reader would be shown, and only if the quoted sentence is in its document character
for character (checked against the document, not only the run record's own field). Then, in order:

1. Every flag that matched no planted clause, including any on documents that should come back
   clean.
2. Every flag that matched a planted clause but named a different clause type.
3. Flags from the most severe band the product uses (Dangerous), from as many different documents as
   possible, until there are ten. If that band ran out, flags from the next band down (Unusual),
   spread across documents the same way.

If the first two groups had held more than ten, ten of them would have been taken, spread across
documents. The run record says which flags matched a planted clause, so nothing was worked out
separately. `flags.json` does not say which group a flag came from or whether it matched.

`flags.json` holds the ten sorted by document and numbered 1 to 10: document, clause type, severity,
the quoted sentence copied from the run record, and the paragraph around it copied from the
document.

## The rule

PASS if the quoted sentence really is the kind of clause the flag names and really costs the reader
something. Otherwise FAIL.

The page shows the "What good looks like" and "My red lines" sections of `PRD.md` word for word. The
server cuts them out of `PRD.md` each time the page loads.

## What the page does

- One flag at a time, with the quoted sentence highlighted inside its paragraph.
- PASS, FAIL, and a box for one sentence on why. Move between flags with the buttons, the numbered
  boxes, or the left and right arrow keys (arrows move you when you are not typing; Escape leaves the
  box).
- Every change saves to `eval/labels/labels.json` as you make it, and the page loads whatever that
  file holds, so you can close it and carry on later.
- If you change a label you already gave, the old one stays in `labels.json` under that flag's
  `history`, with the time you replaced it, and it counts as a change of mind. Editing only the note
  does not.
- A box for what changed in how you judge, saved as `whatChanged`.
- Once all ten have a label and a note, a line to copy into the chat, like `7 PASS, 3 FAIL, changed
  my mind once`.
- A copy of your labels is also kept in the browser. If the server stops, the page says so and offers
  a button that copies your labels to the clipboard.

## Open it again

```
npm run label
```

It prints the address, `http://127.0.0.1:4317` or the next free port, and serves only your own
machine. Press Ctrl+C to stop it. The page, `flags.json` and `labels.json` are all in this folder;
the server uses only Node's built-in modules.
