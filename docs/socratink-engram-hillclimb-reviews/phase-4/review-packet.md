# Phase 4 Review Packet: Socratink + Engram Hill-Climb

**Branch:** `codex/socratink-engram-hillclimb`  
**Date:** 2026-09-12  
**Evaluation Standard:** Steve Jobs minutia-level critique · First-principles learning & verification engine vs. LearnVector.ai ($100M Coursera-backed)

---

## 1. Executive Summary & Thesis

LearnVector promises a "patient AI guide" delivering institutional course catalogs. But gentle chatbots encourage cognitive offloading—students nod today and forget next week.

Socratink delivers **ruthless cognitive resistance**:
1. **Deconstruct & Predict:** Curricula decomposed into prerequisite DAGs where threshold concepts ($\dagger$) require pre-commit prediction gates before any solution is revealed.
2. **Socratic Struggle & Explorables:** Strict dialogue grammar forbidding the AI from solving problems for the user; hints and interactive simulations force the student's mind to do the work.
3. **Separation of Powers:** The tutor guides, but a **Blind Assessor** evaluates free recall in fresh context without lesson bias. Every score is an immutable written receipt on disk.
4. **Deterministic FSRS-4.5 Scheduling:** Tackling the Harvard 2025 finding (*Kestin et al.*) that AI tutoring gains evaporate by day 10 without spaced retrieval.
5. **Client-Owned Learning Ledger:** Append-only transcripts, exportable to Markdown, JSON, and Anki, with zero public model training.

---

## 2. Hard Gate Audit Verification

| Gate | Requirement | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **G1: Scroll-Only Comprehension** | 100% understandable without interaction | **PASS** | Full story readable purely via linear scroll |
| **G2: Zero Invented Evidence** | Primary literature citations only | **PASS** | Roediger & Karpicke (2006); Karpicke & Blunt (2011); Kestin et al. (Harvard 2025); FSRS-4.5 |
| **G3: Responsive Containment** | Zero horizontal overflow or clipped text | **PASS** | Verified across 1440 desktop, 390 mobile, and reduced-motion |
| **G4: Test Suite Integrity** | `pnpm test:landing-fixes` | **PASS** | 18/18 audit checks passing |
| **G5: Zero Build & Lint Errors** | `pnpm typecheck && pnpm lint` | **PASS** | 0 TypeScript errors, 0 ESLint errors |

---

## 3. Stills Gallery

### Desktop (1440 × 900)
- **Hero (§1):** Manifesto typography, clear eyebrow, dual CTAs, living ink sphere.
- **How It Works (§2):** Threshold node header (`THRESHOLD NODE † · PREREQUISITE: VARIANCE VS SELECTION`), 3-step cognitive engine rail, specimen receipt footer.
- **Orbit Material (§3):** 10 disciplines orbiting central archival folio card with zero side clipping.
- **Retention Science (§4):** Living ink divergence curve, Harvard 2025 citation, FSRS-4.5 scheduling.
- **Memory Ledger (§5):** 30-day longitudinal timeline, verbatim cold retrieval match, client-side export tags (`.md`, `.json`, `.csv`).
- **Closing (§6):** Uncompromising anti-offloading prompt, free diagnostic CTA, zero-void footer.

### Mobile (390 × 844)
- **Hero (§1):** Stacked composition, zero horizontal scroll, crisp action buttons.
- **How It Works (§2):** Compact folio layout, clear typography, clean padding.
- **Orbit Material (§3):** Vertically staggered orbit pills with central specimen card fully visible.
- **Memory Ledger (§5):** Readable timeline rail with wrapped receipts and export tags.

### Reduced Motion (1440 × 900)
- Full static layout renders instantly without scroll-scrub dependency; retention curve and milestone accordions display resolved state.
