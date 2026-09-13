# Experiment and output contract

Use this reference to turn a ranked intervention into an interpretable, reversible decision.

## Contents

1. Experiment quality
2. Markdown test card
3. Structured schema
4. Comparison rubric

## 1. Experiment quality

A valid experiment has:

- one audience and decision context;
- one diagnosed binding gap;
- one primary hypothesis;
- one intervention and a stable baseline;
- a primary outcome that can change the decision;
- a customer-value or experience measure;
- trust, accessibility, autonomy, and harm guardrails;
- economic and operational costs;
- a threshold set before results are viewed;
- enough duration or observations to reduce obvious noise;
- stop and rollback conditions;
- an owner and explicit approvals.

Keep three measurement roles separate:

1. **Primary decision outcome** — the business or behavioral result that changes the decision.
2. **Direct customer-value measure** — task success, time, effort, comprehension, confidence, trust, or another measure tied directly to the diagnosed gap.
3. **Guardrails** — downstream retention, support burden, trust, accessibility, autonomy, harm, cost, or operational stability.

Do not use retention or conversion as a proxy for customer effort. Do not use a satisfaction response as the sole business outcome.

Derive approvals from failure modes. Proof assets may require subject/client consent, privacy or security review, legal/compliance review, and delivery-owner verification. Regulated claims require domain substantiation and qualified review. Price or contract changes require accountable commercial and legal owners. Data use requires privacy and security ownership. Name approvals; do not write only “stakeholders.”

Do not promise statistical significance without sample and design justification. For small samples, use repeated qualitative evidence, usability observation, sequential decisions, or a bounded pilot and label the limitation.

## 2. Markdown test card

```markdown
### Experiment: <decision-oriented name>

- Audience/context:
- Gap:
- Evidence grade:
- Hypothesis:
- Intervention:
- Baseline held constant:
- Primary outcome:
- Customer-value measure:
- Guardrails:
- Cost/operations:
- Decision threshold:
- Duration/sample logic:
- Stop/rollback:
- Owner/approvals:
- Result interpretation:
```

## 3. Expanded structured schema

The normative key, enum, and type contract lives in `SKILL.md` so it remains available in tool-constrained runs. Use this expanded template when references are available. Emit valid JSON only, preserve its field names and array/object types, use `"unknown"` for missing required strings, allow `null` only for `subject.alternative`, and record missing facts in `unknowns` rather than inventing them.

```json
{
  "subject": {
    "type": "product|service|offer|brand|experience",
    "name": "string",
    "audience": "string",
    "job": "string",
    "alternative": "string|null"
  },
  "target": {
    "perception_dimensions": ["string"],
    "observable_outcome": "string",
    "out_of_scope": ["string"]
  },
  "diagnosis": {
    "actual_value": [{"dimension": "string", "finding": "string", "status": "observed|reported|researched|inferred|unknown", "grade": "supported|promising|anecdotal|unknown", "evidence": ["string"]}],
    "perceived_value": [{"stage": "discoverable|comprehensible|credible|salient|experienced|remembered", "finding": "string", "status": "observed|reported|researched|inferred|unknown", "grade": "supported|promising|anecdotal|unknown", "evidence": ["string"]}],
    "binding_gap": {"type": "delivery|fit|evidence|translation|signal|friction|trust-contradiction", "rationale": "string", "uncertainty": "string"}
  },
  "interventions": [{
    "rank": 1,
    "name": "string",
    "mechanism": "string",
    "gap_addressed": "string",
    "evidence_grade": "supported|promising|anecdotal|unknown",
    "truth_condition": "string",
    "expected_customer_value": 1,
    "evidence_confidence": 1,
    "strategic_fit": 1,
    "cost_effort": 1,
    "reversibility": 1,
    "trust_harm_risk": 1,
    "upside": "string",
    "downside": "string"
  }],
  "first_experiment": {
    "hypothesis": "string",
    "intervention": "string",
    "baseline": "string",
    "primary_outcome": "string",
    "customer_value_measure": "string",
    "guardrails": ["string"],
    "decision_threshold": "string",
    "duration_sample_logic": "string",
    "stop_rollback": "string",
    "owner_approvals": ["string"]
  },
  "deferred": [{"item": "string", "reason": "string"}],
  "rejected": [{"item": "string", "failed_gate": "string", "truthful_alternative": "string"}],
  "unknowns": ["string"],
  "required_approvals": ["string"]
}
```

All ordinal scores are 1–5. For `reversibility`, 5 means easiest to reverse. Explain important scores in prose; do not use a hidden total.

## 4. Comparison rubric

For skill evaluation, compare blinded outputs on:

- trigger precision;
- actual/perceived-value separation;
- binding-gap correctness;
- evidence and uncertainty discipline;
- ethical safety;
- relevance and prioritization;
- experiment interpretability;
- cross-domain consistency;
- context efficiency.

Treat a fabricated claim, missed material delivery failure, unsafe manipulation, or experiment without rollback as a critical failure. A candidate with any critical failure cannot win on average score.
