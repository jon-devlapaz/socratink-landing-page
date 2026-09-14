---
name: improve-perceived-value
description: Diagnose and improve actual value and perceived value for products, services, offers, brands, and customer experiences. Use when a user wants to increase trust, quality perception, relevance, distinctiveness, desirability, ease, confidence, adoption, retention, or willingness to pay; audit why an offering feels weak, generic, risky, confusing, or overpriced; strengthen an offer without deception; compare value signals; or design a measurable value experiment. Inspect supplied evidence first, distinguish delivery problems from perception problems, rank a few ethical interventions, and define a reversible test.
---

# Improve Perceived Value

Turn an ambiguous “make this feel more valuable” request into an evidence-backed diagnosis and a small, ethical experiment. Improve the underlying value before amplifying claims about it.

## Non-negotiable contract

1. Separate **actual value** from **perceived value**. Never assume a communication change can repair a delivery failure.
2. Treat every causal explanation as supported evidence, direct customer evidence, inference, or unknown.
3. Refuse fabricated scarcity, proof, provenance, comparisons, authority, outcomes, or hidden costs. Offer the nearest truthful alternative.
4. Prioritize three interventions at most. Recommend one experiment first and defer the rest.
5. Define a primary decision outcome, a separate direct customer-value measure, guardrails, a decision threshold, and rollback before recommending execution.
6. Do not publish, contact customers, change prices, or persist context without explicit approval.
7. Test the highest unresolved value gap first. Do not bundle lower-order perception tactics into a material delivery or friction repair.

## Route the request

Identify the requested mode:

- **Audit**: explain why an existing subject underperforms on value.
- **Design**: improve or create a subject while preserving truth.
- **Compare**: compare alternatives using the same audience, job, and evidence standard.
- **Experiment**: convert a suspected value gap into a falsifiable test.

Use the full workflow for audit or design. For compare, run the diagnostic consistently on each alternative. For experiment, verify the upstream diagnosis before writing the test.

## Workflow

### 1. Inspect before asking

Inspect user-supplied pages, artifacts, research, reviews, analytics, interviews, and saved context. If a user-approved context file exists, use it but distinguish saved facts from fresh observations.

Ask only for missing information that could change the diagnosis or ranking. Resolve public facts through research rather than asking the user. Typical load-bearing gaps are:

- subject and audience;
- job or outcome the audience seeks;
- current promise, price, and alternatives;
- evidence of delivered outcomes and failure modes;
- target perception or behavior;
- constraints, budget, and authority.

Do not silently create or update a context file.

### 2. Define the value target

State:

- **Subject**: product, service, offer, brand, or experience.
- **Audience and situation**: who is evaluating it, for what job, and against which alternative.
- **Desired perception**: trust, quality, relevance, distinctiveness, ease, desirability, confidence, or another explicit dimension.
- **Desired outcome**: comprehension, trial, adoption, retention, referral, willingness to pay, or another observable behavior.
- **Out of scope**: what this intervention must not optimize.

Do not use willingness to pay as the default objective.

### 3. Build the evidence ledger

Record material inputs as:

- `observed`: directly present in an artifact or reliable measurement;
- `reported`: supplied by a stakeholder or customer;
- `researched`: supported by an external source;
- `inferred`: reasoned from evidence but not directly observed;
- `unknown`: necessary but unavailable.

For external research, cite primary or authoritative sources near the claim. Separate category conventions from customer evidence. Competitor behavior is evidence of convention, not proof of effectiveness.

Read [evidence-and-ethics.md](references/evidence-and-ethics.md) when external claims, persuasion mechanisms, regulated domains, vulnerable users, or ethical concerns matter.

### 4. Diagnose actual value first

Audit whether the subject reliably delivers the audience’s desired outcome with acceptable quality, time, effort, risk, accessibility, and total cost. Look for defects, weak outcomes, slow time-to-value, unnecessary work, exclusion, service inconsistency, or a poor fit with the intended audience.

If actual value is the binding constraint, prioritize improving delivery. Do not recommend stronger signals that would widen the promise-delivery gap.

Apply the sequencing invariant: when safety, accessibility, delivery, fit, material friction, or a trust contradiction is unresolved, the first experiment must target that highest-priority gap alone. Defer pricing, memory, aesthetic, and other signaling interventions until the higher-priority gap meets a preset threshold. Bundle changes only when they are necessary parts of the same causal intervention; never add a lower-order tactic merely because it is operationally convenient.

Read [diagnostic-model.md](references/diagnostic-model.md) for the complete model and gap taxonomy.

### 5. Diagnose the perception chain

Trace whether real value is:

1. **Discoverable** — the audience notices the relevant signal.
2. **Comprehensible** — they understand the outcome and tradeoffs.
3. **Credible** — they believe the claim applies to them.
4. **Salient** — the value matters in this decision context.
5. **Experienced** — the product or service reinforces the promise.
6. **Remembered** — the useful difference survives after the interaction.

Classify the binding gap using exactly one of `delivery`, `fit`, `evidence`, `translation`, `signal`, `friction`, or `trust-contradiction`. Keep multiple gaps only when evidence shows no single constraint dominates.

### 6. Apply the ethics gate

Reject an intervention if its effect depends on a reasonable audience believing something materially false, unverifiable, concealed, or coercive. Require claims, scarcity, proof, certifications, comparisons, and guarantees to be truthful, specific, enforceable, and auditable.

When rejecting, return:

1. the failed truth or harm condition;
2. the likely trust and customer cost;
3. one closest truthful alternative;
4. at most two prerequisites or evidence needs required to proceed safely.

Do not replace a rejected tactic with an unranked catalogue of alternatives.

Use this exact refusal structure:

```text
Cannot help: <failed truth or harm condition and likely cost>
Nearest truthful alternative: <one replacement tactic only>
Before proceeding: <zero to two evidence or approval prerequisites>
```

Escalate legal, medical, financial, safety, discrimination, dark-pattern, or vulnerable-user implications to qualified review. For regulated or consequential claims, use the two prerequisite slots for: (1) substantiation of the claim, outcome, efficacy, or safety; and (2) a named qualified review such as clinical, regulatory, legal, security, or compliance review. A generic “get approval” is insufficient. Do not convert ethical uncertainty into implementation advice.

### 7. Generate mechanisms, then interventions

Select mechanisms that address the diagnosed gap; do not browse a tactic catalogue and retrofit a problem. Read only the relevant sections of:

- [intervention-library.md](references/intervention-library.md) for mechanism families;
- [mechanism-evidence.md](references/mechanism-evidence.md) when selecting or grading behavioral mechanisms;
- [domain-patterns.md](references/domain-patterns.md) for physical, digital, service, brand, and experience adaptations.

For every candidate, state the mechanism, the diagnosed gap it addresses, evidence grade, audience fit, expected upside, likely downside, and truth condition.

### 8. Rank without false precision

Assess each candidate on 1–5 ordinal scales:

- expected customer value;
- evidence confidence;
- strategic fit;
- cost and effort;
- reversibility;
- trust or harm risk.

Use the first three as benefits and the latter three as constraints. Prefer candidates that dominate across dimensions. If a weighted choice is necessary, show the weights and rationale; do not hide uncertainty in a composite score.

Return the top three, explain why the first wins, and place non-dominant ideas in a short deferred backlog.

### 9. Design one interpretable experiment

Test one primary hypothesis and one measurable intervention. Follow the sequencing invariant above. Bundle changes only when they form one operationally inseparable causal intervention; label the result as package-level evidence.

The experiment must include:

- audience and context;
- diagnosed gap and hypothesis;
- intervention and unchanged baseline;
- primary decision outcome: the business or behavioral result that can change the decision;
- direct customer-value measure tied to the diagnosed gap, such as task success, time, effort, comprehension, confidence, or trust;
- downstream and trust, accessibility, autonomy, and harm guardrails;
- operational and economic impact;
- decision threshold;
- duration or sample logic;
- stop and rollback conditions;
- owner and required approvals.

Keep these metric roles distinct. Conversion, activation, or retention cannot substitute for a direct measure of customer effort or experience. A direct customer measure cannot substitute for a business outcome or downstream guardrail.

Derive approvals from the intervention's failure modes and name them explicitly. Proof assets, testimonials, or case studies may require subject or client consent, privacy/security review, legal/compliance review, and delivery-owner verification. Regulated claims require domain substantiation and qualified review. Pricing or contract changes require the accountable commercial and legal owners. Personalization or customer data requires privacy and security ownership. Do not write only “stakeholder approval.”

Read [experiment-and-output.md](references/experiment-and-output.md) for experiment quality checks and the structured output contract.

### 10. Verify the answer

Before returning:

- Did actual value receive a separate diagnosis?
- Does every recommended signal correspond to something real?
- Is each claim tagged by evidence status and grade?
- Does each intervention address the binding gap?
- Are there no more than three priorities and one first experiment?
- Could the result harm trust, accessibility, autonomy, or excluded users?
- Are success and rollback decidable before execution?
- Does the first experiment address only the highest unresolved gap?
- Are the primary outcome, direct customer-value measure, and guardrails distinct?
- Are approvals derived from the actual intervention risks and named specifically?
- Are facts, inference, and unknowns visibly distinct?

If critical evidence is missing, provide a research or measurement plan instead of pretending to know.

## Structured output contract

When JSON is requested, return one valid JSON object and no Markdown fence or surrounding prose. Structured mode overrides the default Markdown response. Use these exact top-level keys; do not rename them, wrap them, or add alternate status envelopes:

`subject`, `target`, `diagnosis`, `interventions`, `first_experiment`, `deferred`, `rejected`, `unknowns`, `required_approvals`.

Preserve these exact nested field sets:

- `subject`: `type`, `name`, `audience`, `job`, `alternative`;
- `target`: `perception_dimensions`, `observable_outcome`, `out_of_scope`;
- `diagnosis`: `actual_value`, `perceived_value`, `binding_gap`;
- each `actual_value`: `dimension`, `finding`, `status`, `grade`, `evidence`;
- each `perceived_value`: `stage`, `finding`, `status`, `grade`, `evidence`;
- `binding_gap`: `type`, `rationale`, `uncertainty`;
- each intervention: `rank`, `name`, `mechanism`, `gap_addressed`, `evidence_grade`, `truth_condition`, `expected_customer_value`, `evidence_confidence`, `strategic_fit`, `cost_effort`, `reversibility`, `trust_harm_risk`, `upside`, `downside`;
- `first_experiment`: `hypothesis`, `intervention`, `baseline`, `primary_outcome`, `customer_value_measure`, `guardrails`, `decision_threshold`, `duration_sample_logic`, `stop_rollback`, `owner_approvals`;
- each `deferred`: `item`, `reason`; each `rejected`: `item`, `failed_gate`, `truthful_alternative`.

Use only these enums:

- subject type: `product|service|offer|brand|experience`;
- evidence status: `observed|reported|researched|inferred|unknown`;
- evidence grade: `supported|promising|anecdotal|unknown`;
- perception stage: `discoverable|comprehensible|credible|salient|experienced|remembered`;
- gap type: `delivery|fit|evidence|translation|signal|friction|trust-contradiction`.

Enforce these JSON types:

- objects: `subject`, `target`, `diagnosis`, `binding_gap`, `first_experiment`, and each item in an object array;
- arrays: `perception_dimensions`, `out_of_scope`, every `evidence`, `interventions`, `guardrails`, `owner_approvals`, `deferred`, `rejected`, `unknowns`, and `required_approvals`;
- integers 1–5: the six ordinal intervention scores;
- strings: every remaining scalar except `subject.alternative`, which may be a string or `null`.

For a missing required string, use the literal string `"unknown"`; only `subject.alternative` may be `null`. Use `[]` for a missing array. Record every missing fact in `unknowns` and use a bounded evidence-gathering experiment rather than inventing facts. Before returning, parse the answer as JSON and verify the exact keys, enums, and types above. Read [experiment-and-output.md](references/experiment-and-output.md) for the expanded template when references are available.

## Default response

Return concise Markdown with these sections:

1. `Decision` — the binding constraint and first move.
2. `Value diagnosis` — actual value, perceived value, and evidence ledger.
3. `Top interventions` — up to three ranked candidates.
4. `First experiment` — a complete test card.
5. `Deferred / rejected` — backlog, refusals, and reasons.
6. `Uncertainty and approvals` — unknowns and required gates.

When structured output is requested, follow the contract above. Do not expose chain-of-thought; provide concise evidence and rationale.

## Provenance

This skill is standalone. It adapts useful patterns from attributed seed sources but does not require other skills at runtime. Read [provenance.md](references/provenance.md) when updating the mechanism library, evidence grades, or source mappings.
