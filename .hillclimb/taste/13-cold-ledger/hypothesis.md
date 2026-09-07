# 13: Cold Ledger — port loop spike into EncounterStrip

Authority: polish spike at `scrollcraft/builds/socratink-loop-spike/` proved a Cold Ledger loop (Fluency Ghost → Evidence Contract with NON-INFERENCES → Sample Trace → Time-lapse → finale CTA). User asked to open a hillclimb candidate toward :4500 **setup only** — do not fully port until a clean first cut is ready. Keep :4500 craft; Hero/spine frozen-hash spirit; Brain-grounded; DEC-0003 (claims must not exceed available evidence).

Hypothesis: replacing the current Method→Moves sticky rhythm with a scroll-scrubbed **Cold Ledger** encounter (left: sticky question/attempt beats; right: evidence ledger) will win **rhythm + clarity + wow** via Ghost dissolve and Non-Inferences climax, without wrecking hierarchy, identity, or restraint. Principle bar stays the recognition formula (`Recognition ≠ independent recall` / existing assisted≠independent from content). Hero purpose copy stays on the spike; :4500 Hero remains frozen.

## Spike reference (source of truth for port)

Path: `scrollcraft/builds/socratink-loop-spike/index.html` (+ CLAIM-AUDIT.md).

Must port (behavior + copy spirit, not chrome paste):
1. **Fluency Ghost** — assisted correct text vaporizes under scroll; stamp `AI FLUENCY ≠ YOUR MEMORY`; reading ≠ generating.
2. **Evidence Contract** — Target · Observed · Bounded inference · **NON-INFERENCES** ✕ list (retention / unprompted reconstruction / transfer). No mastery %, no % bars.
3. **Sample Trace** — demo path when visitor does not commit an attempt.
4. **Time-lapse** — return / delay framing without claiming the demo stored the visitor.
5. **Finale CTA** — accent Open Socratink → `https://app.socratink.ai/` with subtle kbd `S` (matches `content.nav.cta.kbd`).

Hard non-goals / gates:
- No scroll lock
- No % bars / mastery scores / provenance weight decimals
- No canon ticket IDs (DEC-/EVD-) in UI copy
- No inventing efficacy claims beyond DEC-0003 / Brain-grounded audit
- Preserve Hero composition + frozen hashes spirit (`Hero.tsx`, `content.ts`, ScrollCraft engine) — prefer encounter-local copy over mutating frozen `content.ts`; if content must grow, re-freeze with explicit authority

## Scope (expected touch list for implement pass)

Primary:
- `src/components/site/EncounterStrip.tsx` — phases/beats, ledger panel, ghost, contract, sample/time-lapse, CTA
- `src/components/site/encounter-strip.css` — sticky shell, ledger paper surface, ghost dissolve, non-inference contrast
- `src/app/page.tsx` — only if section wiring changes (today already mounts `<EncounterStrip />`; likely no change)

Secondary / only if needed:
- `src/lib/content.ts` — new encounter strings **or** keep strings colocated in EncounterStrip to avoid frozen-hash churn
- Possibly FinalCta untouched (spike CTA lives inside return beat; :4500 may keep page FinalCta)

Out of scope this candidate: Evidence/Orbit/Memory/FinalCta redesign, ScrollCraft engine edits, hero ink object.

## Success criteria (taste)

Target dimensions: **rhythm**, **clarity**, plus a defensible **wow** from Ghost + Non-Inferences — without losses on hierarchy, identity, surfaces, restraint.
- Sticky encounter still viewport-fit; no empty pinned voids; no scroll lock
- Desktop + phone contact sheets readable; reduced-motion: ghost/contract still legible without vaporize requirement
- Compare against incumbent 12-sticky-frame / 11-encounter-alive spirit

## Gate plan (when implementing)

Freeze → snapshot → smallest port → build + restart :4500 preview → functional + four visual shoots → review.json → gate.mjs. Reject on craft regression or claim overreach.

## Status

Implemented (2026-09-07). Ported into EncounterStrip on :4500; quality/functional/visual gates run; provisional taste ACCEPT pending parent cold-scroll.
