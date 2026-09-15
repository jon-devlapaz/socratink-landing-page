# Phase 0 review packet — baseline v0

Artifact first: [contact-sheet.png](./contact-sheet.png) — 6 sections × desktop 1440 + phone 390, entry states.
Individual frames: `desktop-1440-*.png`, `phone-390-*.png` in this folder. Built 2026-09-12 from the
working tree via dev preview http://127.0.0.1:3101 (`pnpm exec next dev -p 3101`).

## Brief (122 words)

The current homepage is a six-sheet paper-and-ink folio — Hero, How it works, Disciplines, Retention,
Memory, Final invitation — opening on “Practice hard material. Know what you actually know before test
day,” with a living-ink orb and a quiet closing CTA. Foundations are strong: semantic copy, honest
“Illustration only” footers in two sections, and a coherent archival identity. But the page is an
instrument panel, not yet a scroll-led story: Memory offers four prototype modes behind a visitor-facing
switcher, Disciplines hides nine subjects behind tabs, and the retention chart draws only while scrubbing,
so scroll-entry states read hollow. Branded percentages (80% recall, +45% precision, RETENTION VALIDATED)
assert efficacy the product cannot evidence. On phones the page auto-scrolls past the hero on load.

## Three largest gaps vs. Jon's intent

1. **Story requires clicking, not scrolling.** Memory's “PROTOTYPES FOR REVIEW” 4-mode switcher (+ autoplay,
   week/day/node pickers), the orbit dial's 10 tab pills + 01/10 stepper, and How-it-works/Retention tab
   clicks gate essential content. Scroll-only visitors get fragments: hollow specimen window and blank chart
   at entry (see contact sheet rows 2, 4, 5).
2. **Invented efficacy, stated as brand fact.** `RetentionCurve.tsx` (82%/80%/18% recall, “Socratink 80%”
   end labels, ~Day 2 crossover), `content.ts` memory stages (“+45% mechanistic precision”, “80% retention
   verified cold”, `RETENTION VALIDATED` seal), Memory's dated “verified milestones.” Spec requires
   qualitative storytelling instead.
3. **No carried mark; phone entry is broken.** Each section invents its own instrument — nothing recognizably
   travels from thinking into retained understanding. On ≤699px viewports the page loads at scrollY≈3964,
   skipping the hero (`Orbit.tsx:19-24` mount `scrollIntoView`).

## Baseline + preview provenance

- Branch `codex/north-star-scroll-hillclimb` @ `9c8af0b` (spec base `e90b288`) + inherited dirty tree, preserved untouched.
- Dirty files touching the page: `src/app/page.tsx`, `src/app/globals.css`, `src/lib/content.ts`,
  `HowItWorks.tsx`, `StepTabList.tsx`, `StepPreview.tsx`, `steps.ts`, `how-it-works.css`,
  `useStepScrollProgress.ts` (new), `Orbit.tsx`, `orbit.module.css` (new), `Memory.tsx`,
  `ending.module.css` (new), `FinalCta.tsx`, `Footer.tsx`, `DESIGN.md`, plus untracked `/privacy`, `/terms`
  (back footer links — legitimate), and the rejected `/positioning` direction (see below).
- Preview: port 3001 runs a stale `pnpm start` production server (started 14:37, predates 15:02–15:06
  working-tree edits) — not faithful. All captures came from `pnpm exec next dev -p 3101` on this checkout.
- Zero product-source edits in Phase 0. New files: this review folder + `docs/north-star-scroll-hillclimb-state.md`.

## Section sequence (from `src/app/page.tsx`)

`#top` Hero → `#how-it-works` → `#material` Orbit → `#retention-science` → `#memory` → `#takeaway`
(FinalCta + Footer), with Nav, Preloader, AnimatedCursor, CinematicScroller chrome.

## Inherited prototypes (not the brief)

- Rejected interactive-preview direction: `src/app/positioning/`, `src/lib/positioning-content.ts`,
  `docs/landing-positioning-2026-09-12.md` (+ `docs/spikes/`, `scripts/capture-*.mjs`).
- Visitor-facing prototype UI on `/`: Memory 4-mode switcher, “Auto-play”, week/day/node/card pickers.
- Lab/test hooks in visitor path: `/ink-lab`, `/ink-lab-v2` routes; hero `?shape=`/`?morph=` query params.

## Competing scroll owners (audit before any animation work)

Lenis smooth-wheel + GSAP ScrollTrigger reveals/scrub/parallax (`CinematicScroller`, pointer-fine only);
HowItWorks sticky + scroll-progress→step state; Retention sticky + canvas scrub; folio CSS sticky shells;
Orbit mount `scrollIntoView` (≤699px); tab/milestone click `scrollTo`s; InkSphere scroll listener.

## Hard gates (inherited failures recorded, nothing fixed)

Scroll-only comprehension: FAIL. No invented evidence: FAIL. Readable essential text: PASS in stills.
Clipping/overlap: none seen in 12 stills. Stuck scroll/reverse: not certifiable from stills; phone
auto-scroll recorded. Mobile version: renders (12 stills) but entry broken. Reduced motion: not assessed.
Runtime errors: none observed during capture.

## Taste checks (diagnostic opinions, Jon authoritative)

- Promise clarity 3/5 — hero states it crisply; later sections argue method, not the visitor's change.
- Narrative continuity 2/5 — shared paper-and-ink, but no mark or reasoning structure travels across scenes.
- Composition/material 4/5 — deliberate hierarchy and duet headlines; hollow entry states cost a point.
- Motion meaning/pacing N/A — still-frame phase; scrub/auto-scroll behaviors noted from code only.
- Distinctiveness/restraint 3/5 — specific archival voice, but switchers + dial + autoplay read as lab demo.

## Recommendation + decision question

Recommend accepting this capture as the Phase 0 incumbent: it faithfully shows a strong identity wrapped
around a click-gated instrument panel, which is exactly what Phase 1's six-frame storyboard must convert
into a scroll-only story. No code changes proposed at this gate.

**Is this the right starting point and promise?**
