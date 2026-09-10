import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=metal'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

try {
  await page.goto('http://localhost:3001/');
  await page.waitForFunction(
    () => window.socratinkInk?.call('ink_get_scene')?.rendering?.ready
  );

  // 1. Verify NO click bar at the bottom
  const clickBar = await page.$('.hero-ink-cues');
  assert.equal(clickBar, null, 'Click bar must not be present on landing page');
  const cueButtons = await page.$$('.hero-ink-cues button');
  assert.equal(cueButtons.length, 0, 'No cue buttons should exist');

  // 2. Initial state is the Socratic logo orb
  const initialScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.ok(
    initialScene === 'Living ink' || initialScene === 'Ink droplet',
    `Expected initial scene to be Living ink or Ink droplet, got: ${initialScene}`
  );

  // 3. Test manual click-to-advance on the ink sphere: rest -> question
  const sphere = page.locator('.ink-sphere');
  await sphere.click();
  await page.waitForFunction(
    () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
  );
  const secondScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(secondScene, 'Question mark', 'First advance should morph to Question mark');

  // 4. Test second advance: question -> nib
  await sphere.click();
  await page.waitForFunction(
    () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
  );
  const thirdScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(thirdScene, 'Dipped nib', 'Second advance should morph to Dipped nib');

  // 5. Test third advance: nib -> connect (Bridge)
  await sphere.click();
  await page.waitForFunction(
    () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
  );
  const fourthScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(fourthScene, 'Bridge', 'Third advance should morph to Bridge');

  // 6. Test fourth advance: connect -> explain (Open notebook)
  await sphere.click();
  await page.waitForFunction(
    () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
  );
  const fifthScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(fifthScene, 'Open notebook', 'Fourth advance should morph to Open notebook');

  // 7. Test fifth advance: explain -> rest (Ink droplet)
  await sphere.click();
  await page.waitForFunction(
    () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
  );
  const loopedScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(loopedScene, 'Ink droplet', 'Fifth advance should cycle back to Ink droplet');

  await fs.mkdir('lab/ink-landing', { recursive: true });
  await page.screenshot({ path: 'lab/ink-landing/desktop.png' });

  // 5. Test mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth <= innerWidth
  );

  // 6. Test reduced motion stops cycling
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => window.socratinkInk.call('ink_get_scene').rendering.reducedMotion
  );
  const reducedScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.equal(
    reducedScene,
    'Ink droplet',
    'Reduced motion should settle on Ink droplet at rest'
  );

  await page.screenshot({ path: 'lab/ink-landing/mobile.png' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // 7. Test legacy query param override (?shape=code&morph=1)
  await page.goto('http://localhost:3001/?shape=code&morph=1');
  await page.waitForSelector('canvas');
  assert.equal(
    await page.getByRole('group', { name: 'Explore the ink symbols' }).count(),
    0
  );

  assert.deepEqual(errors, []);
  console.log(
    'Landing ink passed: auto-cycle morphing verified, no click bar, manual click advance, mobile, reduced motion; no page errors.'
  );
} finally {
  await browser.close();
}
