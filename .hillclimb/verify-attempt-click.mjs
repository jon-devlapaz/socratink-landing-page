import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUT = '/tmp/attempt-click-verify';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:4500/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(500);

const geom = await page.evaluate(() => {
  const track = document.querySelector('.encounter-track');
  const shell = document.querySelector('.encounter-shell');
  const trackDocTop = track.getBoundingClientRect().top + window.scrollY;
  const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
  return { trackDocTop, travel, shellH: shell.offsetHeight, trackH: track.offsetHeight };
});
console.log('GEOM', JSON.stringify(geom));

const nav = 56;
// attempt beat: p in [0.32, 0.45) after LEAD=0.1 remapping
// rawP = LEAD + p*(1-LEAD) = 0.1 + 0.38*0.9 ≈ 0.442 mid of attempt window
// window raw for attempt: p_raw after lead: for next=attempt when remapped p in [0.32,0.45)
// remapped: if raw < LEAD -> 0; else (raw-LEAD)/(1-LEAD)
// so for remapped 0.38: raw = 0.1 + 0.38*0.9 = 0.442
const attemptRaw = 0.1 + 0.38 * 0.9;
const attemptY = geom.trackDocTop - nav + geom.travel * attemptRaw;
await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, attemptY));
await page.waitForTimeout(350);

// Wait until data-beat=attempt
let beat = null;
for (let i = 0; i < 20; i++) {
  beat = await page.locator('.encounter-shell').getAttribute('data-beat');
  if (beat === 'attempt') break;
  // nudge scroll slightly within attempt band
  const nudge = attemptY + (i % 2 === 0 ? 40 : -40);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, nudge));
  await page.waitForTimeout(120);
}
console.log('BEAT', beat);

await page.waitForSelector('.encounter-beat.is-on .encounter-choices', { timeout: 5000 });
await page.waitForTimeout(200);

const before = await page.evaluate(() => {
  const shell = document.querySelector('.encounter-shell');
  const attemptBeat = document.querySelector('.encounter-beat.is-on');
  const choices = document.querySelector('.encounter-beat.is-on .encounter-choices');
  const btns = [...(choices?.querySelectorAll('button') || [])];
  const b = btns.find(el => el.getAttribute('data-choice') === 'b') || btns[0];
  const cs = b ? getComputedStyle(b) : null;
  const parentCs = attemptBeat ? getComputedStyle(attemptBeat) : null;
  // hit-test center of button
  let hit = null;
  if (b) {
    const r = b.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    hit = {
      tag: el?.tagName,
      className: typeof el?.className === 'string' ? el.className.slice(0, 120) : String(el?.className||'').slice(0,120),
      dataChoice: el?.getAttribute?.('data-choice'),
      isButton: el === b || b.contains(el),
    };
  }
  const ledgerText = document.querySelector('.encounter-ledger__body')?.innerText?.slice(0, 400) || '';
  return {
    beat: shell?.getAttribute('data-beat'),
    attemptIsOn: attemptBeat?.classList.contains('is-on'),
    attemptInert: attemptBeat?.hasAttribute('inert'),
    attemptPointerEvents: parentCs?.pointerEvents,
    attemptOpacity: parentCs?.opacity,
    btnCount: btns.length,
    btnTexts: btns.map(x => x.textContent?.slice(0, 60)),
    choiceB: b ? {
      dataChoice: b.getAttribute('data-choice'),
      ariaPressed: b.getAttribute('aria-pressed'),
      disabled: b.disabled,
      pointerEvents: cs.pointerEvents,
      cursor: cs.cursor,
      visibility: cs.visibility,
      display: cs.display,
      opacity: cs.opacity,
      rect: (() => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })(),
    } : null,
    hit,
    ledgerAwaiting: ledgerText.includes('Awaiting') || ledgerText.includes('Empty'),
    ledgerSnippet: ledgerText.slice(0, 200),
    cue: document.querySelector('.encounter-cue')?.textContent,
  };
});
console.log('BEFORE', JSON.stringify(before, null, 2));
await page.screenshot({ path: join(OUT, 'before-click.png'), fullPage: false });

const btn = page.locator('.encounter-beat.is-on .encounter-choices button[data-choice="b"]');
const btnCount = await page.locator('.encounter-beat.is-on .encounter-choices button').count();
const target = btnCount ? btn : page.locator('.encounter-beat.is-on .encounter-choices button').first();

let clickError = null;
try {
  await target.click({ timeout: 3000, force: false });
} catch (e) {
  clickError = String(e.message || e);
  console.log('CLICK_ERROR_normal', clickError);
  // try force click to see if handler works when PE blocked
  try {
    await target.click({ timeout: 2000, force: true });
    console.log('FORCE_CLICK_ok');
  } catch (e2) {
    console.log('FORCE_CLICK_fail', String(e2.message || e2));
  }
}
await page.waitForTimeout(400);

const after = await page.evaluate(() => {
  const shell = document.querySelector('.encounter-shell');
  const attemptBeat = document.querySelector('.encounter-panel .encounter-beat:nth-child(3)') || document.querySelector('[data-choice]')?.closest('.encounter-beat');
  // Prefer the attempt beat by content
  const beats = [...document.querySelectorAll('.encounter-beat')];
  const attempt = beats.find(b => b.querySelector('.encounter-choices')) || attemptBeat;
  const b = document.querySelector('.encounter-choices button[data-choice="b"]');
  const pressed = [...document.querySelectorAll('.encounter-choices button')].map(el => ({
    key: el.getAttribute('data-choice'),
    pressed: el.getAttribute('aria-pressed'),
  }));
  const ledgerText = document.querySelector('.encounter-ledger__body')?.innerText?.slice(0, 500) || '';
  return {
    beat: shell?.getAttribute('data-beat'),
    attemptInert: attempt?.hasAttribute('inert'),
    attemptIsOn: attempt?.classList.contains('is-on'),
    attemptPointerEvents: attempt ? getComputedStyle(attempt).pointerEvents : null,
    btnPointerEvents: b ? getComputedStyle(b).pointerEvents : null,
    pressed,
    ariaB: b?.getAttribute('aria-pressed'),
    cue: document.querySelector('.encounter-cue')?.textContent,
    ledgerHasInk: ledgerText.includes('Bias is about how you sample') || ledgerText.includes('Committed') || ledgerText.includes('Ink recorded'),
    ledgerHasAwaiting: ledgerText.includes('Awaiting') || ledgerText.includes('Empty —'),
    ledgerSnippet: ledgerText.slice(0, 280),
  };
});
console.log('AFTER', JSON.stringify(after, null, 2));
await page.screenshot({ path: join(OUT, 'after-click.png'), fullPage: false });

// Also check inert on off-beats
const inertAudit = await page.evaluate(() => {
  const beats = [...document.querySelectorAll('.encounter-beat')];
  return beats.map((el, i) => ({
    i,
    isOn: el.classList.contains('is-on'),
    inert: el.hasAttribute('inert'),
    pe: getComputedStyle(el).pointerEvents,
    hasChoices: !!el.querySelector('.encounter-choices'),
  }));
});
console.log('INERT_AUDIT', JSON.stringify(inertAudit, null, 2));

const worked =
  after.ariaB === 'true' ||
  after.pressed?.some(p => p.pressed === 'true') ||
  after.ledgerHasInk ||
  (after.cue && after.cue.includes('committed'));

const report = {
  url: 'http://127.0.0.1:4500/',
  beatReached: beat === 'attempt',
  before,
  after,
  clickError,
  inertAudit,
  worked: !!worked,
  verdict: worked ? 'VERIFIED_CLICKABLE' : 'BROKEN',
};
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log('VERDICT', report.verdict);
await browser.close();
process.exit(worked ? 0 : 1);
