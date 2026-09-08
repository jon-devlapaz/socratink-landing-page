# Encounter · Contract-slip spine — ship spec

**Status:** blocked on **Delta A** — stranger falsifiers §10.1–4 on `:4502`

**Spike:** `scrollcraft/builds/socratink-contract-slip/` · serve `python3 serve.py` → http://127.0.0.1:4502/

---

## Decision

Replace production Encounter’s dense two-plane Cold Ledger with a **single-slip Contract spine**: one question, one ruled slip, five beats. Ghost pays **Cost** (assisted fluency erased). **Bound** is the climax — claims try to land, refuse in place, durable NON-INFERENCES remain in the DOM. Ghost stamp is Cost ornament only; if Bound loses “first remembered” to the stamp, **cut the stamp** — do not add Bound chrome to compete.

Production `EncounterStrip` / Method fold port is **out of scope** until Delta A clears §10.1–4 on the spike.

---

## Five-beat map

| Beat | Panel | Job |
|------|-------|-----|
| **1 · Cold** | `cold` | One question, ruled void. Evidence begins when you attempt. |
| **2 · Ghost Cost** | `ghost` | Assisted text arrives, scatters, voids. Stamp = Cost ornament after emptiness. Irreversible once paid. |
| **3 · Ink** | `ink` | Visitor sentence **or** labeled Sample Trace **or** refuse (`I don't know yet.`). No hidden-badge Maya / persona clock-typing. |
| **4 · Bound climax** | `contract` | Claims land → ✕ refuse. Underlined ink + condition line. **NON-INFERENCES** as durable readable DOM (not animation-only). |
| **5 · Exit** | `exit` | Bounded observation; CTA handoff. NON-INFERENCES remain in DOM for sensors. |

---

## Brain gates

| Ref | Gate |
|-----|------|
| **DEC-0003** | Product language must not exceed available evidence. Bound shows explicit non-claims. No mastery %, no Capability Horizon table on spike climax. |
| **EVD-0004** | Contract climax = Bound refusal + NON-INFERENCES list. Wow budget on Bound, not Ghost stamp. |
| **EVD-0001** | Visitor ink is first-class (`typed` or `refuse`). Refuse is productive absence, not soft exit. |
| **EVD-0002** | Sample Trace badged immediately and for entire sample duration — never masquerades as visitor evidence. |

---

## Taste kills (must stay absent on spike)

- Two-plane Encounter + Evidence Ledger shell
- Capability Horizon table / mastery % / boolean companion as competing climax
- Hidden demo badge / clock-typed persona ink
- Target · Observed · Bounded inference brochure card stack
- Stamp winning “first remembered” over Bound (→ cut stamp)
- Scroll deadlock / force-reset gates
- Internal DEC-/EVD- codes in customer HTML

---

## Evaluator minimum loop

1. Serve spike: `cd scrollcraft/builds/socratink-contract-slip && python3 serve.py`
2. Cold scroll (or `node verify-bound.mjs` from repo root)
3. Ghost Cost irreversible; stamp ≤ ornament
4. Ink: typed **or** Sample Trace (badge on) **or** refuse
5. Bound: claims land → refuse; `[data-non-inference]` nodes with “Does not establish …” copy
6. Exit: CTA; DOM still contains ≥1 readable NON-INFERENCE string

Automated gate: `node scrollcraft/builds/socratink-contract-slip/verify-bound.mjs` (non-zero exit on failure).

---

## Port plan

| Delta | Scope | Gate |
|-------|-------|------|
| **A** (this PR) | Harden `:4502` spike; ship spec; `verify-bound.mjs`; CLAIM-AUDIT | Stranger falsifiers §10.1–4 |
| **B** | Port Contract-slip spine into production `EncounterStrip` | Delta A green + taste review |
| **C** | Memory section hygiene (same PR as B port — **not this PR**) | No Encounter echoes / movie-repeat |
| **D** | Deploy + production verify | B + C merged |

---

## Falsifiers §10 (stranger cold-scroll)

### §10.1 · Bound wins first remembered
Stranger who scrolls to Bound remembers **claim refusal** (land → ✕), not Ghost stamp alone. If stamp dominates recall, cut stamp — do not inflate Bound chrome.

### §10.2 · Sample Trace honesty
Any sample ink path shows **Sample Trace · not your evidence** badge for the full duration sample is on the slip (ink + contract). No hidden demo / persona typing.

### §10.3 · Refuse is first-class ink
“I don't know yet.” records as `refuse` kind; appears on contract line; not demoted to empty slip or skip.

### §10.4 · NON-INFERENCES instrumentable
After Bound plays, DOM contains ≥1 readable NON-INFERENCE string (e.g. “Does not establish durable retention”) in persistent nodes — assertable by `verify-bound.mjs` / Andrej’s DOM sensor. Not strike-only animation with no durable text.

---

## Amendments (locked)

1. **Delta A hard gate** before EncounterStrip port — §10.1–4 must pass on `:4502`.
2. **Cut stamp** if it wins first remembered over Bound.
3. **Instrument readable NON-INFERENCES** in DOM after Bound (`#nonInferenceList`, `[data-non-inference]`).
4. **Keep refuse-as-ink** — `kind: refuse`, first-class button, contract display.
5. **Delta C Memory hygiene** ships in same PR as later EncounterStrip port — note only; **not implemented in Delta A PR**.

---

## Related

- Spike audit: `scrollcraft/builds/socratink-contract-slip/CLAIM-AUDIT.md`
- Verify: `scrollcraft/builds/socratink-contract-slip/verify-bound.mjs`
