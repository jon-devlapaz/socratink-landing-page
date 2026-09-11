# Encounter · Contract-slip spine — ship spec

> **Retired (Sept 2026):** the Method `#method` section was removed from
> `src/app/page.tsx`; `EncounterStrip.tsx` and `encounter-strip.css` were
> deleted. This spec is retained as history.

**Status:** **Delta A + B + C done** — ready for trio QC / deploy (Delta D)

**Spike:** `scrollcraft/builds/socratink-contract-slip/` · serve `python3 serve.py` → http://127.0.0.1:4502/

**Production:** `src/components/site/EncounterStrip.tsx` · preview `pnpm dev` → http://127.0.0.1:3000/#method

---

## Decision

Replace production Encounter’s dense two-plane Cold Ledger with a **single-slip Contract spine**: one question, one ruled slip, five beats. Ghost pays **Cost** (assisted fluency erased to void + provenance hint). **Bound** is the climax — claims try to land, refuse in place, durable NON-INFERENCES remain in the DOM. ~~Ghost stamp~~ **Cut** (Jobs §10.1): stamp won “first remembered” over Bound — removed entirely; no Bound chrome added to compete.

---

## Five-beat map

| Beat | Panel | Job |
|------|-------|-----|
| **1 · Cold** | `cold` | One question, ruled void. Evidence begins when you attempt. |
| **2 · Ghost Cost** | `ghost` | Assisted text arrives, scatters, voids. Provenance hint only — **no stamp**. Irreversible once paid. |
| **3 · Ink** | `ink` | Visitor sentence **or** labeled Sample Trace **or** refuse (`I don't know yet.`). No hidden-badge Maya / persona clock-typing. |
| **4 · Bound climax** | `contract` | Claims land → ✕ refuse. Underlined ink + condition line. **NON-INFERENCES** as durable readable DOM (not animation-only). |
| **5 · Exit** | `exit` | Bounded observation; CTA handoff. NON-INFERENCES remain in DOM for sensors. |

---

## Brain gates

| Ref | Gate |
|-----|------|
| **DEC-0003** | Product language must not exceed available evidence. Bound shows explicit non-claims. Memory section uses aspirational/plan language; landing walkthrough stores nothing. |
| **EVD-0004** | Contract climax = Bound refusal + NON-INFERENCES list. Wow budget on Bound only. |
| **EVD-0001** | Visitor ink is first-class (`typed` or `refuse`). Refuse is productive absence, not soft exit. |
| **EVD-0002** | Sample Trace badged immediately and for entire sample duration — never masquerades as visitor evidence. |

---

## Taste kills (held on spike + production)

- Two-plane Encounter + Evidence Ledger shell
- Capability Horizon table / mastery % / boolean companion as competing climax
- Hidden demo badge / clock-typed persona ink
- Target · Observed · Bounded inference brochure card stack
- Ghost stamp / “AI fluency ≠ your memory”
- Scroll deadlock / force-reset gates
- Internal DEC-/EVD- codes in customer HTML
- Line-through on NON-INFERENCE `<li>` text (✕ prefix only; claim stamps may strike)

---

## Evaluator minimum loop

### Spike (`:4502`)
1. `cd scrollcraft/builds/socratink-contract-slip && python3 serve.py`
2. Cold scroll (or `node scrollcraft/builds/socratink-contract-slip/verify-bound.mjs`)
3. Ghost Cost irreversible; void + provenance hint only (stamp removed)
4. Ink: typed **or** Sample Trace (badge on) **or** refuse
5. Bound: claims land → refuse; `[data-non-inference]` nodes with “Does not establish …” copy
6. Exit: CTA; DOM still contains ≥1 readable NON-INFERENCE string

### Production (`pnpm dev`)
1. Open http://127.0.0.1:3000/#method
2. Same five-beat loop on single slip (no left rail / ledger)
3. Optional smoke: `node scripts/verify-encounter-bound.mjs` (requires dev server)

---

## Ship deltas

| Delta | Scope | Status |
|-------|-------|--------|
| **A** | Harden `:4502` spike; ship spec; `verify-bound.mjs`; CLAIM-AUDIT | ✅ §10.1–4 |
| **B** | Port Contract-slip spine into production `EncounterStrip` | ✅ |
| **C** | Memory section hygiene (`Memory.tsx`, `content.ts`) | ✅ |
| **D** | Deploy + production verify | Coordinator |

---

## Falsifiers §10 (stranger cold-scroll)

### §10.1 · Bound wins first remembered
Stranger who scrolls to Bound remembers **claim refusal** (land → ✕), not Ghost ornament. Ghost stamp cut entirely.

### §10.2 · Sample Trace honesty
Sample ink path shows **Sample Trace · not your evidence** badge for the full duration sample is on the slip (ink + contract).

### §10.3 · Refuse is first-class ink
“I don't know yet.” records as `refuse` kind; appears on contract line; not demoted to empty slip or skip.

### §10.4 · NON-INFERENCES instrumentable
After Bound plays, DOM contains ≥3 readable NON-INFERENCE strings in persistent `[data-non-inference]` nodes.

---

## Related

- Spike audit: `scrollcraft/builds/socratink-contract-slip/CLAIM-AUDIT.md`
- Spike verify: `scrollcraft/builds/socratink-contract-slip/verify-bound.mjs`
- Production smoke: `scripts/verify-encounter-bound.mjs`
