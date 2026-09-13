# Phase 2 review packet — Frame 4→5 transition slice v1

Artifact first: [slice-scroll-1280.webm](./slice-scroll-1280.webm) (18s: entry → scrub → Memory composed → reverse).
Matched stills: `desktop-1440-{entry,middle,resolved,memory,reverse}.png`, same for `phone-390-*` and
`reduced-1440-*`. Incumbent for comparison: Phase 0 `desktop-1440-04/05` + `phone-390-04/05` (same anchors).

## Hypothesis (one sentence)

The Retention→Memory passage asserted invented percentages behind click-tabs and landed on a prototype
switcher; the challenger makes the same passage a reversible scroll-scrubbed divergence converging into a
composed longitudinal ledger.

## What changed, why, what to look at

- `src/components/site/RetentionCurve.tsx` — qualitative divergence: milestones Day 1/Day 14 (static,
  scroll-synced, no click-to-scroll); canvas drops the % grid, crossover callout, gap label, and % end labels
  (end-label edge clamp preserved — repo audit check still passes); new H2 “The same reasoning, answered
  cold”, cold-retrieval excerpt card (the carried sentence), honesty footers. Scrub/sticky/stylus/particles
  mechanisms untouched.
- `src/components/site/Memory.tsx` — prototype switcher + 4 mode views + autoplay replaced by the composed
  ledger (Day 01 verbatim → Day 03 repair → Day 14 unaided + haloed terminal bead); arrival progress
  (same manual rAF-lerp family as Retention) composes entries and lands the bead; SSR/no-JS/reduced-motion
  render the resolved ledger. Headline, deck, principle, section shell preserved.
- `src/components/site/ending.module.css` — appended ledger styles only; orphaned prototype classes left
  in place, flagged for Phase 3 cleanup (no behavior change).
- Look at: middle still (ink mid-draw, stylus nib at frontier), memory still (bead landed), then the video
  for the continuous scrub down and back.

## Hard gates

Scroll-only comprehension: PASS — slice has zero click/type/wait dependencies. No invented evidence: PASS —
all % claims, seals, and “verified” badges removed from the slice; honesty footers on both sections.
Readable text: PASS in all 15 stills. Clipping/overlap: none seen. Stuck scroll/reverse: PASS — reverse
still matches middle byte-for-byte; milestone flips asserted programmatically both directions. Mobile +
reduced-motion: PASS — phone + reduced stills verified; reduced = fully resolved static. Runtime errors:
none observed (pageerror listeners silent across all capture contexts).

## Taste checks (diagnostic opinions, Jon authoritative)

- Promise clarity 4/5 — growth promise carried by the cold answer + compounding ledger (hero out of slice).
- Narrative continuity 5/5 — the carried sentence now literally travels Retention → Memory; bead closes it.
- Composition/material 4/5 — final-quality duet, hairlines, single accent; entry canvas intentionally spare.
- Motion meaning/pacing 4/5 — scrub pace set by the visitor's reading; ledger composes on arrival; bead
  lands last. All reversible; nothing fires once and strands the return path.
- Distinctiveness/restraint 4/5 — one focal idea per state; no new chrome, libraries, or scroll owners
  (one scoped arrival listener in the existing manual-progress family; Lenis/ScrollTrigger untouched).

## Standard proposed for the rest

Reversible progress-driven motion (scrub/arrival, never once:true) in the existing manual rAF-lerp family;
qualitative ink + honesty footers instead of measured claims; SSR-safe resolved defaults (mounted-gated
progress via `useSyncExternalStore`). No new animation library.

## Known follow-ups (not failures)

Orphaned prototype CSS (~700 lines) and dead `content.ts` memory-stages % copy intentionally left for
Phase 3 cleanup; Memory.tsx/ending.module.css were inherited-dirty files — this slice's portion is the
ledger rewrite + appended styles described above (nothing committed). Frame 3 folio-sheaf refinement boats
with Phase 3.

## Recommendation + decision question

Recommend accepting this slice as the motion and material standard: it converts the weakest passage of the
baseline into the approved storyboard's frames 4→5 with all hard gates passing and checks green
(tsc, eslint, landing-audit-fixes, site-hygiene).

**Should this be the motion and material standard for the rest?**
