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

  // 2. The hero starts at rest and stays there beyond the old icon cycle.
  const initialScene = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').scene.name
  );
  assert.ok(
    initialScene === 'Living ink' || initialScene === 'Ink droplet',
    `Expected the default rest scene, got: ${initialScene}`
  );
  await page.mouse.move(0, 0); // Hover must not be what prevents cycling.
  for (let second = 0; second < 18; second++) {
    await page.waitForTimeout(1000);
    assert.equal(
      await page.evaluate(() => window.socratinkInk.call('ink_get_scene').scene.name),
      initialScene,
      'Idle hero must not cycle through semantic icons'
    );
  }

  // 3. Pointer and keyboard activation gently pulse without changing symbols.
  const sphere = page.getByRole('button', { name: /Living ink droplet.*gently pulse/ });
  for (const activation of ['click', 'Enter', 'Space']) {
    if (activation === 'click') await sphere.click();
    else await sphere.press(activation);
    await page.waitForFunction(
      () => !window.socratinkInk.call('ink_get_scene').rendering.transitioning
    );
    assert.equal(
      await page.evaluate(() => window.socratinkInk.call('ink_get_scene').scene.name),
      initialScene,
      `${activation} should keep the hero at rest`
    );
  }

  // An explicitly saved lab scene remains previewable in the hero.
  const manualResult = await page.evaluate(
    () => window.socratinkInk.call('ink_express', { expression: 'lightbulb' })
  );
  assert.equal(manualResult.ok, true, 'The public expression tool remains available');
  await page.reload();
  await page.waitForFunction(
    () => window.socratinkInk?.call('ink_get_scene')?.rendering?.ready
  );
  assert.equal(
    await page.evaluate(() => window.socratinkInk.call('ink_get_scene').scene.name),
    'Lightbulb',
    'Landing should preview an explicitly saved symbol'
  );

  await fs.mkdir('lab/ink-landing', { recursive: true });
  await page.screenshot({ path: 'lab/ink-landing/desktop.png' });

  // 4. Test mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth <= innerWidth
  );

  // 5. Reduced motion stays still, including after activation.
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
  const reducedTime = await page.evaluate(
    () => window.socratinkInk.call('ink_get_scene').rendering.time
  );
  await sphere.press('Enter');
  await page.waitForTimeout(500);
  assert.equal(
    await page.evaluate(() => window.socratinkInk.call('ink_get_scene').rendering.time),
    reducedTime,
    'Activation must not animate under reduced motion'
  );

  await page.screenshot({ path: 'lab/ink-landing/mobile.png' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // 6. Test legacy query param override (?shape=code&morph=1)
  await page.goto('http://localhost:3001/?shape=code&morph=1');
  await page.waitForSelector('canvas');
  assert.equal(
    await page.getByRole('group', { name: 'Explore the ink symbols' }).count(),
    0
  );

  assert.deepEqual(errors, []);
  console.log(
    'Landing ink passed: stable rest, click/keyboard activation, saved-scene preview, public expression tool, no click bar, mobile, reduced motion; no page errors.'
  );
} finally {
  await browser.close();
}
