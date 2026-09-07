# Gates: landing layout hillclimb

Scope: Drive down frozen layout debt on the homepage until the stop predicate, without regressing types, lint, or 320px overflow.

- [x] G1: Frozen harness prints a numeric `debt` field
  CHECK: (cd .hillclimb && node measure.mjs --json)
  EXPECT: /"debt":\s*\d+/
  EVIDENCE: {"debt":134,"overflowX":0,"p90_390":105,"p90_1280":177,"v390":{"inflate":false,"overflowX":0,"junctions":[{"from":"a tutor that keeps the evidence","to":"method","gap":86},{"from":"method","to":"moves

- [x] G2: Sensitivity probe raises debt when section padding is inflated
  CHECK: (cd .hillclimb && node measure.mjs --json --probe-inflate)
  EXPECT: /"sensitive":\s*true/
  EVIDENCE: {"debt":134,"overflowX":0,"p90_390":105,"p90_1280":177,"v390":{"inflate":false,"overflowX":0,"junctions":[{"from":"a tutor that keeps the evidence","to":"method","gap":86},{"from":"method","to":"moves

- [x] G3: Baseline artifact exists
  CHECK: test -f .hillclimb/baseline.json
  EVIDENCE: (no output)

- [x] G4: Typecheck is green
  CHECK: pnpm exec tsc --noEmit
  EVIDENCE: (no output)

- [x] G5: Lint is green
  CHECK: pnpm lint
  EVIDENCE: $ eslint

- [x] G6: No horizontal overflow at 320px
  CHECK: (cd .hillclimb && node measure.mjs --json)
  EXPECT: /"overflowX":\s*0/
  EVIDENCE: {"debt":134,"overflowX":0,"p90_390":105,"p90_1280":177,"v390":{"inflate":false,"overflowX":0,"junctions":[{"from":"a tutor that keeps the evidence","to":"method","gap":86},{"from":"method","to":"moves

- [x] G7: Stop predicate: debt is 0 and at least 6 decision rows exist
  CHECK: python3 -c "import json, pathlib, sys; d=json.load(open('.hillclimb/latest.json')); n=sum(1 for i,l in enumerate(pathlib.Path('.hillclimb/decision.tsv').read_text().splitlines()) if i and l.strip()); sys.exit(0 if d.get('debt')==0 and n>=6 else 1)"
  EVIDENCE: (no output)
