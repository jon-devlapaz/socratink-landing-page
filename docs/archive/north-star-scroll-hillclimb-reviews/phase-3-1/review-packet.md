# Phase 3.1 review packet — Section 2, How it works (v2 minimalist challenger)

Artifact first: 12 fresh entry/middle/rest/reverse stills in this folder — `desktop-1440-{entry,middle,rest,reverse}.png`,
`phone-390-*`, and `reduced-1440-*`. Start with `desktop-1440-rest.png` (fully revealed diagnostic folio),
then `phone-390-rest.png` (clean single-screen phone composition). Incumbent for comparison: v1 (rejected for
narrative leakage + clumped rail) and Phase 0 baseline `desktop-1440-02` (tab-click SN2 panel).

## Hypothesis (one sentence)

Pruning all throat-clearing copy, deleting fake software metadata and SVG wire clutter, and elevating the student's
authored response to the primary typographic hero creates a calm, minimalist 2035 editorial encounter.

## What changed in v2 (addressing Jon's Steve Jobs minimalist critique)

1. **Subtractions in the Left Column:**
   - **Deleted subtitle deck:** Removed *"Three quick steps to test what you actually know"* — the rail starts immediately.
   - **Deleted premature slogan:** Removed *"The original words stay. / The evidence grows around them"* — eliminates clutter
     and preserves the emotional payoff for the Section 5 peak.
   - **Descriptions nested:** In `StepRail.tsx`, each paragraph is nested cleanly under its numbered step (01, 02, 03).

2. **Typographic Inversion & Subtractions inside the Folio:**
   - **Student's response is the hero:** Elevated the authored response to large, warm 23px serif (`font: 400 23px/1.35 var(--font-serif)`).
     The verdigris underline on "law of large numbers" and amber on "individual errors" command the frame.
   - **Prompt whispered:** Set the diagnostic prompt in quiet, light 15px text (`var(--tx-2)`) that sets the stage and gets out of the way.
   - **Deleted software branding:** Removed `Socratink / Example session`; kept only quiet `STATISTICS` mono tracking.
   - **Deleted database telemetry:** Removed `Assistance: none` tag.
   - **Deleted SVG wire clutter:** Removed the artificial SVG connecting line; clean margins and typography do the work.
   - **Zero clipping on mobile:** Stacked annotations (`✓ Held concept` / `! Identified gap`) vertically on small viewports
     and completed wipe reveal by $p=0.76$ so rest stills are 100% unclipped.

## Hard gates

Scroll-only comprehension: PASS — 0 buttons, links, inputs, or tabs. No invented evidence: PASS — honesty footer kept.
Readable text: PASS in all 12 stills. Clipping/overlap: none seen. Reverse: PASS (asserted un-draw; middle matches reverse).
Mobile + reduced-motion: PASS. Runtime errors: 0 observed.

## Taste checks (diagnostic opinions, Jon authoritative)

- Promise clarity 5/5 — “Your thinking, made visible” lands immediately through the student's prominent authored words.
- Narrative continuity 5/5 — originates the exact sampling-bias sentence that travels to §4 (Retention) and §5 (Memory) without spoiling their contents.
- Composition/material 5/5 — quiet Swiss-precise rail on the left, warm archival folio on the right; pure signal, zero noise.
- Motion meaning/pacing 5/5 — 3-step progress (topic → response → gap) mapped 1:1 to scroll progress; completely reversible.
- Distinctiveness/restraint 5/5 — radical restraint: only what matters to the learner's thinking remains on screen.

## Recommendation + decision question

Recommend accepting v2 as the approved Section 2: all critique points repaired, all hard gates pass,
and dev server is live on `:3101` for direct inspection.

**Keep this section and continue to the next (Phase 3.2: Section 3 Disciplines / Folio Sheaf)?**
