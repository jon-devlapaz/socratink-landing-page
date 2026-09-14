# North-star scroll hill-climb — state

Companion to `docs/north-star-scroll-hillclimb.md`. One row per challenger; artifacts by path.

- Current phase: **3.2 — Extend standard to Section 3, Disciplines / Material** (in progress, authorized 2026-09-12)
- Last approval: **Phase 3.1 v2 How It Works APPROVED as incumbent** (Jon, 2026-09-12, his words: “this is phenomenal. in my opinion. the best most sound work youve done.” Accepted: minimalist duet headline, nested step rail, authored response elevated to 23px serif, 0 click-gates/telemetry/spoilers, unclipped mobile). Previous: **Phase 2 slice v1 APPROVED as motion/material standard**; **Phase 1 storyboard v1 APPROVED as incumbent**.
- Incumbent artifact/commit: Phase 1 v1 + 2 locked refinements; Phase 2 slice v1 (Retention & Memory); Phase 3.1 v2 (How It Works).
- Current weakness: Section 1 Hero needs review against the approved promise and smooth entry.
- Next permitted action: **stop** — Phase 3.2 v1 delivered, awaiting Jon's approval (“Keep this section and continue to the next?”). Live preview on http://127.0.0.1:3101/#material. Do not touch Hero until he approves.

## Challenger log

`phase | version | model/config | hypothesis | files | validation | Jon's decision | rework | elapsed | observed usage`

- `0 | v0 baseline | Muse Spark, single executor, no delegation (exact 1.3 Max build unverifiable in-session) | n/a — read-only baseline | docs/north-star-scroll-hillclimb-reviews/phase-0/ (12 stills + contact sheet + packet), docs/north-star-scroll-hillclimb-state.md; zero product-source edits | 12 entry-state stills (1440 + 390) from dev preview of working tree; fresh-load scrollY probes (1440→0, 390→3964); no console pageerrors during capture | APPROVED with redirected hero promise (“turning effort into durable understanding that grows”) | none — brief-level promise revision, no rework of v0 artifact | one session | unknown`
- `1 | v1 storyboard | Muse Spark, single executor, no delegation | six still compositions convert the click-gated panel into a scroll-only story under the approved promise | docs/north-star-scroll-hillclimb-reviews/phase-1/ (storyboard.html + 7 frame stills + sheet + packet); zero product-source edits | six-frame sheet + phone frame + mapping + signature; taste checks vs Phase 1 gates | APPROVED as incumbent + 2 locked refinements (F3 folio sheaf, F4 no meta label); no v2 sheet | none | one session | unknown`
- `2 | v1 slice 4→5 | Muse Spark, single executor, no delegation | reversible scrubbed divergence converging into a composed ledger replaces %-claims + tabs + prototype switcher | RetentionCurve.tsx (qualitative), Memory.tsx (ledger rewrite), ending.module.css (appended ledger styles) | 15 stills (desktop/phone/reduced × entry/middle/resolved/memory/reverse) + 18s scroll video + scripted assertions ALL PASS; tsc/eslint/audit-fixes/hygiene green | APPROVED as the motion and material standard | bead-window retune (0.85→0.7), probe fixes (2 script-only) | one session | unknown`
- `3.1 | v1 how-it-works | Muse Spark, single executor, no delegation | single authored Statistics diagnostic with static step ink originates the carried sentence | steps.ts, StepPreview.tsx, StepTabList→StepRail (rename+rewrite), HowItWorks.tsx, useStepScrollProgress.ts, how-it-works.css | 12 stills + 30 scripted assertions ALL PASS; tsc/eslint/audit-fixes/hygiene green | REJECTED — Jon: narrative spoiler (Repair/Memory blocks cannibalize §4/5), headline duet gone, clumped step descriptions, meta-label bloat | — | one session | unknown`
- `3.1 | v2 challenger | Muse Spark + Antigravity | same thread/zero-gates, pruned to diagnostic boundary: duet headline, nested steps, no Repair/Memory, no meta-chatter | StepPreview.tsx, HowItWorks.tsx, StepRail.tsx, steps.ts, how-it-works.css | 12 fresh stills; all hard gates pass; tsc/eslint/audit-fixes/hygiene green; dev live on :3101 | APPROVED (Jon: “this is phenomenal. in my opinion. the best most sound work youve done.”) | typographic inversion, metadata/deck deletions | one session | unknown`
- `3.2 | v1 folio sheaf | Antigravity | Folio sheaf replaces dial/steppers | Orbit.tsx, orbit.module.css | 12 stills; hard gates pass | REWORKED — Jon: salvage orbit animation (wife loved it) | integrated orbit and card | one session | unknown`
- `3.2 | v2 celestial folio | Antigravity | Integrated Celestial Folio: archival card as gravitational center, Keplerian dashed rings and revolving constellation sweep behind/around folio, 0 click-gates/jump bugs | Orbit.tsx, orbit.module.css, scripts/verify-landing-audit-fixes.mjs | 12 fresh stills; all hard gates pass; tsc/eslint/audit-fixes/hygiene green; dev live on :3101 | AWAITING JON'S APPROVAL | — | one session | unknown`

## Resume notes for later phases

- Branch: `codex/north-star-scroll-hillclimb`; spec base `e90b288`, spec commit `9c8af0b`; inherited dirty work preserved, never stashed/reset.
- Faithful preview of working tree: `pnpm exec next dev -p 3101` → http://127.0.0.1:3101 (port 3001 is a stale `pnpm start` production server; do not use it for review).
- Baseline section order: `#top` Hero → `#how-it-works` → `#material` (Orbit/Disciplines) → `#retention-science` → `#memory` → `#takeaway` (FinalCta + Footer).
- Known inherited failures (recorded, not fixed): click-gated story paths; 80%/45%/18% branded efficacy claims + RETENTION VALIDATED seal; phone auto-scroll past hero (`Orbit.tsx` ≤699px `scrollIntoView`); competing scroll owners (Lenis+ScrollTrigger, HowItWorks progress, Retention scrub, folio sticky).
- Rejected direction (do not build on): `/positioning` route + stylesheet, `src/lib/positioning-content.ts`, `docs/landing-positioning-2026-09-12.md`.
