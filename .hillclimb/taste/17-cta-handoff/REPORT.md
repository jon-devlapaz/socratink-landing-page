# 17-cta-handoff

## Decision
ACCEPT (authored taste + parent cold-scroll + honesty gate). Target: conversion handoff clarity.

## What changed
- Primary conversion labels → **Start a free attempt** on Nav CTA, Hero primary, Final CTA button, Encounter finale CTA.
- Encounter finale CTA + sub wired from `encounterFrame` in `content.ts` (was hardcoded).
- Href unchanged: `https://app.socratink.ai/` everywhere for those CTAs.
- **Log in**: left `href: site.appUrl` — no distinct auth/login route found in landing content/env/repo; did not invent `/login`.
- Early trust: **not added** — Hero `notebook.heroTrust` + Final/Encounter trust lines from candidate 16 already present; no duplicate.

## Out of scope (held)
- EncounterStrip inert / beats / ledger / pointer-events
- Orbit, Memory rewrite, H1 philosophy, sticky compression
- Footer link label and Final titleSerif "Open Socratink." (headline/footer brand, not conversion ask)

## Honesty gate (required for ACCEPT)
Checked live `https://app.socratink.ai/` (2026-09-07):
- No sign-in / create-account wall on load.
- Guest typed and sent an attempt; UI showed “Working from what you wrote,” then a full Socratink response with an unassisted question — no auth interrupt.
- Therefore **Free to start / No account required / Start a free attempt** is honest for current product behavior.

## Evidence
- `pnpm exec next build` green (tsc included).
- Live on `http://127.0.0.1:4500/` — *Start a free attempt* on primary surfaces; trust lines from 16 retained.
- Attempt clicks remain verified (`17-attempt-click`).

## Final CTA strings
| Surface | Label | Href |
|---|---|---|
| Nav primary | Start a free attempt | https://app.socratink.ai/ |
| Nav Log in | Log in | https://app.socratink.ai/ (no separate auth URL) |
| Hero primary | Start a free attempt | https://app.socratink.ai/ |
| Encounter finale | Start a free attempt | https://app.socratink.ai/ |
| Final CTA button | Start a free attempt | https://app.socratink.ai/ |
| Final / Encounter / Hero trust | Instant in-browser · No account required · Free to start | (unchanged from 16) |

## Files changed
- `src/lib/content.ts`
- `src/components/site/EncounterStrip.tsx`

## Preview
http://127.0.0.1:4500/

## Status
ACCEPT — door handoff locked; deploy lag may leave prod on older copy until ship.
