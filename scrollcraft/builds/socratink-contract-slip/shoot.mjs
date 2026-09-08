import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'shots');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://127.0.0.1:4502/', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
const travel = await p.evaluate(() => {
  const el = document.getElementById('pinWrap');
  return Math.max(0, el.offsetHeight - innerHeight);
});
const fracs = [
  ['v4-01-cold', 0.02],
  ['v4-02-ghost-mid', 0.20],
  ['v4-03-ghost-void', 0.34],
  ['v4-04-ink', 0.45],
  ['v4-05-contract', 0.65],
  ['v4-06-exit', 0.90],
];
for (const [name, f] of fracs) {
  await p.evaluate(({ travel, f }) => window.scrollTo(0, travel * f), { travel, f });
  await p.waitForTimeout(320);
  await p.screenshot({ path: path.join(out, name + '.png') });
  const live = await p.evaluate(() => document.querySelector('.panel.is-live')?.dataset.panel);
  console.log(name, live, 'y=', Math.round(travel * f));
}
await p.evaluate(({ travel }) => window.scrollTo(0, travel * 0.45), { travel });
await p.waitForTimeout(200);
await p.fill('#inkInput', 'Larger n from a skewed process just tightens the wrong answer.');
await p.click('#commitBtn');
await p.waitForTimeout(150);
await p.evaluate(({ travel }) => window.scrollTo(0, travel * 0.65), { travel });
await p.waitForTimeout(320);
await p.screenshot({ path: path.join(out, 'v4-07-contract-typed.png') });
const mark = await p.evaluate(() => document.querySelector('.noninf .x')?.textContent);
console.log('typed', await p.evaluate(() => document.querySelector('.panel.is-live')?.dataset.panel), 'mark=', mark);
await b.close();
