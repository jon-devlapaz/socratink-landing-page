# Homepage layout hillclimb

Metric `debt` from `node .hillclimb/measure.mjs --json`. Lower is better.

Direction: decrease `debt` without raising 320px `overflowX` or failing `pnpm exec tsc --noEmit` / `pnpm lint`.

Stop: `debt === 0` and at least 6 rows in `.hillclimb/decision.tsv`.

Caps (not a floor that forces tightness):
- 390px section junctions above 96px count
- 390px heading-to-card above 56px count
- 1280px junctions above 128px count (weight 0.5)
- 1280px heading-to-card above 72px count (weight 0.5)
- 320px overflow costs 1000 per pixel

Keep a change only if `debt` drops by more than 12 (noise band) and the regression gate stays green. Otherwise revert in full.

## Current visual work

The content-preserving quality/taste climb is in [taste/README.md](taste/README.md). This older spacing-debt run is retained as history; it is not the objective for that climb.
