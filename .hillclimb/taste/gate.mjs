import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const candidate = process.argv[2];
if (!candidate) throw new Error('Usage: node .hillclimb/taste/gate.mjs <candidate-directory>');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(candidate, name), 'utf8'));
const gates = [];
const check = (name, pass) => gates.push({ name, pass: Boolean(pass) });
try {
  const frozen = JSON.parse(fs.readFileSync(process.argv[3] || '.hillclimb/taste/frozen.json', 'utf8'));
  check('approved source and content preserved', Object.entries(frozen).every(([p, h]) => sha(p) === h));
  const quality = read('quality.json');
  check('build, typecheck, lint and whitespace checks', ['build','typecheck','lint','diff'].every(k => quality[k] === true));
  check('no new lint warnings', quality.newLintWarnings === 0);
  const source = read('source.json');
  check('evidence matches current source snapshot', Object.entries(source).length > 0 && Object.entries(source).every(([p,h]) => sha(p) === h));
  const functional = read('functional/results.json');
  check('all functional checks passed', functional.length >= 24 && functional.every(x => x.pass === true));
  for (const name of ['desktop','mobile','compact','reduced']) {
    const r = read(`${name}/report.json`);
    const log = fs.readFileSync(path.join(candidate, `${name}.log`), 'utf8');
    check(`${name} visual capture`, r.report.length >= 8 && r.consoleErrors.length === 0 && r.failed.length === 0 && fs.existsSync(path.join(candidate, name, 'sheet.png')));
    check(`${name} harness findings`, log.includes('no dead scroll detected') && log.includes('all cues clear 4.5:1') && !/never reach|never peak|DEAD SCROLL|FROZEN CLIP/.test(log));
  }
  const review = read('review.json');
  check('hero preservation or explicit revision authority recorded', review.heroPreserved === true || (review.heroRevisionAuthorized === true && Boolean(process.argv[3])));
  if (review.structuralReview) {
    const structural = read('functional/structure/results.json');
    check('structural and abrupt-jump checks passed', structural.length >= 70 && structural.every(x => x.pass === true));
  }
  const dimensions = ['readability','hierarchy','identity','surfaces','rhythm','restraint'];
  check('visual review completed', ['desktopReviewed','phoneReviewed','motionReviewed','coldFeelCompared'].every(k => review[k] === true));
  check('all taste dimensions have evidence and no losses', dimensions.every(k => ['win','tie'].includes(review.dimensions[k]?.verdict) && review.dimensions[k]?.evidence?.length > 20));
  check('target dimension is a clear win', dimensions.includes(review.target) && review.dimensions[review.target]?.verdict === 'win');
  check('tradeoff and rationale recorded', review.tradeoff?.length > 20 && review.decisionReason?.length > 20);
} catch (error) { gates.push({ name: `missing or invalid evidence: ${error.message}`, pass: false }); }
const pass = gates.every(g => g.pass);
fs.writeFileSync(path.join(candidate,'gate-result.json'),JSON.stringify({pass,gates},null,2)+'\n');
for(const g of gates) console.log(g.pass ? 'PASS' : 'FAIL', g.name);
console.log(pass ? 'ACCEPTABLE: authored taste review still subject to user preference.' : 'REJECT: retain or restore the incumbent.');
if(!pass) process.exitCode=1;
