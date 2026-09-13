# Improve Perceived Value

An agent skill for diagnosing and improving actual value and perceived value across products, services, offers, brands, and customer experiences.

It turns requests such as “make this feel more valuable” into an evidence-backed diagnosis and one reversible experiment. The skill fixes delivery, friction, accessibility, or trust problems before amplifying presentation.

## What it helps with

- Product onboarding, activation, retention, and feature packaging
- Pricing pages, offers, proposals, and comparisons
- Service journeys, hospitality, and physical experiences
- Learning products and progress visibility
- Trust, evidence, differentiation, and willingness-to-pay problems
- Ethical review of scarcity, social proof, authority, and outcome claims

The skill distinguishes weak underlying value from weak communication. It refuses fabricated proof, false scarcity, hidden costs, unsupported comparisons, and unsubstantiated consequential claims.

## Install

Clone the repository into the skills directory used by your compatible agent host:

```bash
git clone https://github.com/jon-devlapaz/improve-perceived-value.git ~/.agents/skills/improve-perceived-value
```

If your host uses a different skills directory, clone or copy this repository there instead. `SKILL.md` is the entry point; the files under `references/` are loaded only when relevant.

## Use

Invoke it explicitly:

```text
Use $improve-perceived-value to audit this pricing page and propose the strongest ethical experiment.
```

Other useful requests:

```text
Why does this service feel overpriced?
Improve this offer without using deceptive urgency.
Diagnose why users do not upgrade after onboarding.
Compare these alternatives using the same value standard.
Return the value diagnosis as structured JSON.
```

## Method

The skill:

1. Defines the audience, job, alternative, desired perception, and observable outcome.
2. Separates actual value from perceived value.
3. Builds an evidence ledger and identifies the highest unresolved gap.
4. Selects mechanisms that address that gap.
5. Ranks at most three interventions without false precision.
6. Produces one reversible experiment with outcome, customer-value measure, guardrails, threshold, approvals, and rollback.

## Repository contents

- `SKILL.md` — routing, workflow, safety contract, and output contract
- `references/diagnostic-model.md` — value model and gap taxonomy
- `references/intervention-library.md` — intervention mechanisms
- `references/mechanism-evidence.md` — bounded evidence register
- `references/domain-patterns.md` — cross-domain adaptations
- `references/evidence-and-ethics.md` — evidence and ethical gates
- `references/experiment-and-output.md` — experiment and output guidance
- `references/provenance.md` — source and maintenance record
- `agents/openai.yaml` — optional host metadata

## Limitations

This skill supports decisions; it does not establish causal proof or replace legal, clinical, regulatory, financial, security, accessibility, or compliance review. Recommendations remain hypotheses until tested with appropriate approvals and representative evidence.

The held-out evaluation suite and internal run artifacts are intentionally excluded from the public repository so they remain useful as regression tests.

## Provenance and license

This project adapts MIT-licensed patterns from Corey Haines's Marketing Skills project and acknowledges HubSpot/The Hustle as a discovery source. See [NOTICE.md](NOTICE.md) and [references/provenance.md](references/provenance.md).

Released under the [MIT License](LICENSE).

## Contributing

Contributions should preserve the actual-value-first sequence, explicit evidence grades, ethical refusal boundaries, reversible experiments, and concise runtime footprint. Add regression coverage for any material failure discovered in use.
