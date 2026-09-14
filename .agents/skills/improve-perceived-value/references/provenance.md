# Provenance and maintenance

Use this reference when updating the skill’s models, interventions, evidence grades, or source mappings.

## Source register

### HubSpot seed inventory

- Source: [60 Tactics Brands Use to Justify Premium Prices](https://offers.hubspot.com/view/pricing-tactics-database)
- Publisher: HubSpot / The Hustle
- Accessed: 2026-08-01
- Use: mechanism discovery and coverage checking only
- Limitation: mutable marketing page; examples, causal claims, cost estimates, and implementation advice were not independently validated; its digital-product guidance includes unethical artificial scarcity.
- Transformation: broad mechanism families informed discovery; the public package does not reproduce the source's numbered database or expressive examples.

### Canonical Marketing Skills repository

- Repository: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- Inspected commit: [`7868cb9251fad80a73d26e488a5ad5f6c4a9f335`](https://github.com/coreyhaines31/marketingskills/tree/7868cb9251fad80a73d26e488a5ad5f6c4a9f335)
- License confirmed at inspection: MIT; the required upstream notice is retained in the repository license and `NOTICE.md`.
- Useful donors:
  - `marketing-psychology`: model-selection taxonomy and ethical intent;
  - `offers`: outcome, confidence, delay, effort, truthful scarcity, and progressive disclosure;
  - `pricing`: packaging/metric/price separation, research methods, and teardown output patterns.
- Adaptation: this skill adds actual-versus-perceived-value separation, an evidence ledger, binding-gap taxonomy, ordinal ranking, structured output, reversible experiments, hard ethical gates, and cross-domain acceptance tests.
- Limitation: donor evals are expected-output assertions, not observed passing runs; several behavioral claims require narrower evidence and boundary conditions.

## Update policy

1. Preserve immutable source identifiers where available.
2. Record access dates for mutable sources.
3. Keep mechanisms and examples separate from evidence grades.
4. Change a grade only with cited evidence or direct validated customer data.
5. Add a regression case for every material failure discovered in use.
6. Keep `SKILL.md` procedural; move detailed domain knowledge to one-level-deep references.
7. Remove stale, duplicate, or non-decision-relevant tactics rather than growing the catalogue indefinitely.

## Behavioral evidence audit

- Audit date: 2026-08-01
- Register: [mechanism-evidence.md](mechanism-evidence.md)
- Method: bounded review of primary papers, meta-analyses, and authoritative reviews for ten mechanism families.
- Verification correction: the peak–end meta-analysis DOI is `10.1016/j.obhdp.2022.104149`; an initial evidence packet misstated the article number as `104146`.
- Scope warning: evidence grades apply to narrow outcomes and populations, not guaranteed commercial lift.
