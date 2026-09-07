# 17-attempt-click — verification (no code change)

**Verdict: VERIFIED clickable**  
URL: http://127.0.0.1:4500/  
Date: 2026-09-07 (America/Chicago)

## Preconditions
- `curl http://127.0.0.1:4500/` → **200** (next start already up; no restart)

## Playwright proof (1440×900, Chrome channel)
Script: `.hillclimb/verify-attempt-click.mjs` → artifacts in this folder.

| Check | Result |
|---|---|
| Scroll to Attempt beat (`data-beat=attempt`) | PASS |
| `.encounter-choices` visible (3 buttons) | PASS |
| Choice B `pointer-events` | `auto` |
| Attempt parent `.encounter-beat.is-on` `pointer-events` | `auto` |
| Attempt parent `inert` | **false** (absent) |
| Off-beats `inert` + `pointer-events: none` | PASS (indices 0,1,3,4,5) |
| `elementFromPoint` hit-test center of B | BUTTON `data-choice=b` |
| Click B (normal, no force) | PASS |
| `aria-pressed` on B | `false` → **`true`** |
| Cue text | `Three choices · scroll never waits` → **`Choice committed · keep scrolling`** |

Screenshots: `before-click.png`, `after-click.png`  
JSON: `report.json`

## Conclusion
Attempt choices are interactive while the sticky cold-ledger is on the Attempt beat. `inert` correctly gates off-beats; on-beat choices are not a no-op. **No fix required.** CTA copy left unchanged; optional next candidate drafted at `../17-cta-handoff/hypothesis.md`.
