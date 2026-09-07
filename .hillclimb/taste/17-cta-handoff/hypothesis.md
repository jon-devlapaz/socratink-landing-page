# 17: CTA handoff — “Start a free attempt” + Log in auth clarity

Status: **PROVISIONAL implemented** (2026-09-07). Primary CTAs retuned to Start a free attempt; Log in href left at appUrl (no distinct auth route). Encounter inert/beats/ledger untouched.

Authority: Conversion/auth-clarity follow-on after candidate 16 (Hero five-second). Preserve DEC-0003, twin climaxes, Sample Trace, pin gate, Orbit CLS, forest spine, Memory macro-only.

## Problem
Primary CTAs still say **Open Socratink** (Nav, Hero, Encounter return beat, FinalCta). Cold visitors may not know:
1. Entry is a **free attempt** (not a purchase or demo theater alone).
2. **Log in** (Nav) vs primary CTA — whether opening the app walls behind auth or allows guest start.
3. Encounter finale subline already says *Instant in-browser · No account required · Free to start* — but button label still “Open…”, so trust line and verb disagree in emphasis.

## Hypothesis
Retuning **CTA label language** (and optionally pairing Log in vs primary more explicitly) to **“Start a free attempt”** (or close variant) plus clearer **Log in** affordance will win **clarity + conversion** without touching Encounter interaction, sticky math, or Orbit.

## In scope (candidate 17 — if run)
1. Primary CTA label(s): prefer *Start a free attempt* (or A/B: keep Open Socratink where brand recognition matters; change Hero + Final + Encounter finale first).
2. Nav: keep **Log in** as secondary; ensure it is visually secondary to primary CTA; optional micro-copy that Log in resumes an account while primary starts guest attempt — only if true to product.
3. Align Encounter return `encounter-cta` + `encounter-cta-sub` so verb and trust line match (no conflicting “Open” vs “no account”).
4. `content.ts` CTA strings only (+ component label bindings). No CSS inert/pointer-events work.

## Explicit out of scope
- Changing Attempt choice wiring, `inert`, or beat scrubbing.
- Auth implementation / app.socratink.ai flows (landing copy only).
- Workflow band, product screenshots, trust footer (later numbers from 16’s backlog).
- Inventing pricing or efficacy claims beyond DEC-0003.

## Success criteria
- Visitor can answer in ≤5s: “I can start free without an account; Log in is for returning users.”
- No regression on Attempt clickability or off-beat inert.
- Identity/restraint: not a brochure strip; one primary verb.

## Falsifiers
- App actually requires account before any attempt → trust line + “free attempt” must be pulled (honesty gate).
- Label change reduces brand recognition more than it gains intent clarity (measure with cold 5s / preference).

## Preserve
- Verified Attempt clicks (`aria-pressed` / ledger commit path).
- Candidate 16 trust micro-copy spirit if still true.
- Frozen Hero composition spirit; prefer content.ts CTA edits over layout churn.
