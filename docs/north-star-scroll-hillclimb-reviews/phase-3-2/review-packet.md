# Phase 3.2 review packet — Section 3, Disciplines (The Celestial Folio v2 challenger)

Artifact first: 12 fresh entry/middle/rest/reverse stills in this folder — `desktop-1440-{entry,middle,rest,reverse}.png`,
`phone-390-*`, and `reduced-1440-*`. Start with `desktop-1440-rest.png` (integrated Celestial Folio),
then `phone-390-rest.png` (contained mobile cosmic aura). Incumbent for comparison: Phase 0 baseline
`desktop-1440-03` (10-pill rotating dial + Prev/Next stepper).

## Hypothesis (one sentence)

Integrating the mesmerizing orbital mechanics directly with the archival folio card as its gravitational anchor restores
the kinetic wonder of revolving disciplines while eradicating click-gates, standalone dial clutter, and mobile jump bugs.

## What changed in Phase 3.2 v2 (The Celestial Folio)

1. **Integrated Gravitational Architecture:**
   - Instead of a disconnected 620px dial beside the card, the archival dossier sits in the center as the gravitational anchor.
   - Two delicate dashed Keplerian rings sweep behind and around the folio card like an antique celestial astrolabe.
   - 9 disciplines quietly revolve in space (inner 64s, outer 96s) with hardware-accelerated transforms; hovering gently pauses the drift.
   - Inner ring passes behind the paper folio card, creating authentic celestial depth (emerging top and bottom, ducking behind on the sides).

2. **Unclipped Geometry & Click-to-Populate Interaction:**
   - **Zero side clipping:** Expanded stage to 720px × 640px, set `overflow: visible;` on desktop, and tuned orbital radii (215px inner, 305px outer) with 440px card width. All outer pills have complete lateral clearance with zero clipping.
   - **Interactive exploration:** Clicking any orbiting pill immediately swaps the central dossier content in-place with a 200ms ease, highlighting the active pill with a verdigris ring. Zero page jump.
   - **Layering depth:** Card sits at `z-index: 10` with opaque paper fill; inner ring pills glide gracefully behind the card's corners without obscuring the diagnostic text.
   - **Zero software clutter:** No external steppers, pagination dots, or control panels.

3. **Narrative Continuity:**
   - Active Statistics dossier commands the center with `● carried thread`, ready to transit cold into Section 4 (*Retention*).
   - Palimpsest base tab (`BOARD EXAMS`) peeks from behind the top edge for one-click switching.

## Hard gates

Scroll-only comprehension: PASS — readable cold without clicking. Interactive exploration: PASS — clicking any pill updates card.
Readable text: PASS in all 12 stills; zero clipping. Clipping/overlap: none seen; mobile contained with 0 lateral scroll. Reverse: PASS.
Mobile + reduced-motion: PASS (reduced motion stations constellation statically). Runtime errors: 0 observed.

## Taste checks (diagnostic opinions, Jon authoritative)

- Promise clarity 5/5 — “Put your subject to the test” proves deep multi-subject scope without an engineering control board.
- Narrative continuity 5/5 — Statistics remains the anchored carried thread directly bridging into §4 Retention.
- Composition/material 5/5 — Keplerian celestial rings etched in fine ink framing warm archival paper.
- Motion meaning/pacing 5/5 — Gentle, continuous cosmic revolution that pauses on hover and responds instantly to selection.
- Distinctiveness/restraint 5/5 — The celestial folio merges kinetic delight with quiet editorial dignity.

## Recommendation + decision question

Recommend accepting Phase 3.2 v2: side clipping is completely eliminated, every discipline is interactive, the wife-approved orbit is fully integrated, and all automated checks pass.

Live inspection: `http://127.0.0.1:3101/#material`.

**Keep this section and continue to the next (Phase 3.3: Section 1 Hero)?**
