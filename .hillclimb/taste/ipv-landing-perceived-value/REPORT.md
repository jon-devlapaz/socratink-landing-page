# Improve Perceived Value — Socratink Landing

Skill: [improve-perceived-value](https://github.com/jon-devlapaz/improve-perceived-value) (`SKILL.md` + diagnostic model).  
Subject artifact: live/local landing (`https://socratink.ai` / `http://127.0.0.1:4500/`), ship lineage through candidates 13–17 (ACCEPT).  
Mode: **Audit** → first experiment shipped locally.  
Date: 2026-09-07.

---

## 1. Decision

**Binding gap: `translation` (with secondary `friction`).**

Actual product value may be strong (unknown without in-app outcome data), but cold visitors under-decode *what the software is*, *who it is for*, and *how hard entry is* before they experience the twin climaxes. Amplifying brand poetry or sticky length will not fix that.

**First move (done locally):** Candidate **17-cta-handoff** ACCEPT — *Start a free attempt* + honesty gate (guest attempt on `app.socratink.ai` with no auth wall). Measure 5s comprehension + CTA CTR after deploy. Do not reopen Encounter as a brochure.

---

## 2. Value diagnosis

### Subject / target

| Field | Statement |
|---|---|
| Subject | Socratink marketing landing (experience + brand surface for the web app) |
| Audience | High-stakes learners: medical boards, bar, cloud certs, consequential STEM (`observed` in 16 copy; earlier audits) |
| Job | Decide whether to open an unassisted-attempt workspace for hard material vs ChatGPT / Anki / Q-banks |
| Alternative | ChatGPT/Claude fluency; Anki; UWorld/Amboss/BarBri/LeetCode-style banks |
| Desired perception | Trust, relevance, distinctiveness, ease of entry |
| Desired outcome | Qualified click-through to `app.socratink.ai` and first unassisted attempt |
| Out of scope | Fake proof, mastery %, strawman AI, inventing privacy/pricing claims, diluting Fluency Ghost / NON-INFERENCES |

### Actual value (delivery)

| Dimension | Finding | Status | Grade |
|---|---|---|---|
| Outcome | Landing **demonstrates** attempt-before-reveal + honest non-claims; whether the **app** delivers durable capability is not evidenced here | observed (demo) / unknown (product outcomes) | promising / unknown |
| Quality | Craft + DEC-0003 discipline are exceptional for edtech marketing | observed | supported |
| Time-to-value (page) | Sticky Encounter is long; Orbit tripwires land late for scanners | observed | supported |
| Effort | High cognitive load (ledger jargon) before app open | observed + reported (audits) | promising |
| Risk | Privacy/ToS/pricing silence raises adoption risk for syllabus pasting | observed | supported |
| Fit | Domain cards (Pathophys/Cloud/Contract) match expert tripwires | observed + reported | supported |

**Inference:** Do not amplify “works for boards” claims beyond what Orbit cards already show until in-app retention evidence exists.

### Perceived value (chain)

| Stage | Finding | Status | Grade |
|---|---|---|---|
| Discoverable | Sphere + poetic H1 noticed; product UI / free entry less noticed on cold 5s | reported (5s audits) | promising |
| Comprehensible | Philosophy ahead of form factor; MC beat can read as “quiz app” without scaffold caption | observed + reported | supported |
| Credible | NON-INFERENCES + “demo stores nothing” build trust; zero third-party proof | observed | supported |
| Salient | Orbit proves “my field” but only after sticky tax | observed | supported |
| Experienced | Attempt clicks work on :4500 (`17-attempt-click` verify); commit → ledger is real | observed | supported |
| Remembered | Twin climaxes (Ghost + NON-INFERENCES) are memorable if reached | inferred | promising |

### Binding gap

**Type: `translation`** — real method value exists on-page but is mapped too slowly into “web app for unassisted hard exams, free to start.”

**Secondary: `friction`** — CTA verb “Open Socratink” under-specifies the free attempt; Log in adjacent to Open creates login-wall anxiety (`reported`).

**Uncertainty:** Whether production deploy lags local 16; whether app truly allows no-account start (`unknown` — honesty gate for CTA copy).

---

## 3. Top interventions (≤3)

### Rank 1 — CTA + entry translation (candidate 17)

- **Mechanism:** Align primary verb with the job (“Start a free attempt”) and separate Log in (return) vs guest start; keep 16 trust line.
- **Gap:** translation + friction.
- **Truth condition:** App must allow a free attempt without account; else pull the claim.
- **Scores (1–5):** customer value 4 · evidence confidence 4 · strategic fit 5 · cost/effort 5 (easy) · reversibility 5 · trust/harm 2 (low if honest).
- **Why first:** Highest unresolved gap after 16’s domain specificity; reversible copy-only; matches sequencing (don’t add social proof before entry clarity).

### Rank 2 — Early “what is this” + product surface

- **Mechanism:** One form-factor sentence / eventual real workspace frame so the orb isn’t the only first-viewport product signal.
- **Gap:** signal + discoverable.
- **Defer until:** 17 CTR/comprehension measured; needs authentic UI art (`unknown` asset).

### Rank 3 — Trust / proof strip (truthful only)

- **Mechanism:** Privacy pledge, open-launch/pricing note, optional cognitive-science citations — no fake logos.
- **Gap:** credible / trust-contradiction (silence).
- **Defer until:** Legal/privacy-approved copy exists; don’t invent ToS.

---

## 4. First experiment

### Experiment: CTA verb — free attempt vs Open Socratink

- **Audience/context:** Cold visitors on landing Hero / Final CTA (desktop + mobile).
- **Gap:** translation / friction.
- **Evidence grade:** promising.
- **Hypothesis:** Changing primary CTA to **Start a free attempt** (trust line held) increases qualified app opens without raising bounce-from-disappointment if no-account start is real.
- **Intervention:** Candidate 17 copy on Hero, Nav primary, Final, Encounter finale.
- **Baseline held constant:** H1, Encounter beats, Orbit cards, Memory, twin climaxes.
- **Primary outcome:** CTR from primary CTA to `app.socratink.ai`.
- **Customer-value measure:** 5s / post-click comprehension — “I can try without signing up” (task success in short interview or on-page quiz probe).
- **Guardrails:** Support/auth failure rate; bounce-back if paywall; trust complaints; a11y (no new shortcuts).
- **Decision threshold:** Pre-set — e.g. +X% CTR **and** ≥Y% comprehension of free entry; else rollback labels.
- **Duration/sample:** Enough cold sessions to stabilize CTA CTR (label limitation if traffic low: sequential N-of-1 cold reads).
- **Stop/rollback:** Revert CTA strings if app requires account before any attempt, or if brand confusion spikes.
- **Owner/approvals:** Landing owner; product owner verifies no-account path; no legal needed for label swap if claim already true.

---

## 5. Deferred / rejected

### Deferred
- Compress sticky / replace H1 with exam-day line — risks twin-climax dilution.
- Social proof logos/testimonials — needs real consent + evidence.
- Hero domain A/B personalization — after 17.
- Inline hero sandbox vs sticky (Test A) — experiment later, not default.
- Filling Attempt negative space with mini-models — rejected (steals Beats 4/6).

### Rejected
| Item | Failed gate | Nearest truthful alternative |
|---|---|---|
| Fake mastery % / “10x learning” | Ethics / DEC-0003 | Keep NON-INFERENCES honesty |
| Invented Privacy Policy / “never train on your data” without product truth | Truth condition | Ship only after product+legal confirm |
| Claiming Attempt “broken” after :4500 verify | Evidence | Treat as prod-lag / off-beat misread |

---

## 6. Uncertainty and approvals

**Unknowns:** In-app no-account path; production vs local 16 deploy state; pricing roadmap; privacy posture for syllabus paste.

**Required approvals before stronger claims:** Product verification of free start; privacy/legal for data-sovereignty copy; delivery owner if showing real learner dossiers.

---

## Provenance

- Skill: github.com/jon-devlapaz/improve-perceived-value
- Landing evidence: candidates 13–16 ACCEPT / verify trails under `.hillclimb/taste/`
- External audits: 5-second assessment + conversion findings (reported)
