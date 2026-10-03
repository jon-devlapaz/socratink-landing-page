import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || "/tmp/socratink-cursor");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const report = [];

async function verifyDot(page, selector) {
  const target = page.locator(selector).first();
  await target.hover();
  await page.waitForFunction(() => {
    const cursor = document.querySelector("[data-ink-cursor]");
    return cursor && getComputedStyle(cursor).opacity === "1";
  });
  const metrics = await target.evaluate((element) => {
    const cursor = document.querySelector("[data-ink-cursor]");
    const dot = cursor.firstElementChild;
    const style = getComputedStyle(dot);
    const rect = dot.getBoundingClientRect();
    return {
      nativeCursor: getComputedStyle(element).cursor,
      dotOpacity: style.opacity,
      dotWidth: rect.width,
      dotHeight: rect.height,
      borderRadius: style.borderRadius,
      pointerEvents: getComputedStyle(cursor).pointerEvents,
      children: cursor.children.length,
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
  });
  assert.equal(metrics.nativeCursor, "none", `${selector}: native cursor must be hidden`);
  assert.equal(metrics.dotOpacity, "1", `${selector}: dot must remain visible`);
  assert.equal(metrics.dotWidth, 10);
  assert.equal(metrics.dotHeight, 10);
  assert.equal(metrics.borderRadius, "50%");
  assert.equal(metrics.pointerEvents, "none");
  assert.equal(metrics.children, 1, "No caret or alternate cursor");
  report.push({ selector, ...metrics });
}

try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
    await page.goto(url);
    await page.waitForSelector("[data-ink-cursor]", { state: "attached" });
    for (const selector of ["h1", ".hero-actions a", "header button", ".hero-subject > button"]) {
      await verifyDot(page, selector);
    }
    await page.mouse.move(500, 400);
    await page.waitForFunction(() => {
      const rect = document.querySelector("[data-ink-cursor]").firstElementChild.getBoundingClientRect();
      return Math.abs(rect.x + rect.width / 2 - 500) < 1 && Math.abs(rect.y + rect.height / 2 - 400) < 1;
    });
    await page.screenshot({ path: path.join(out, `${theme}.png`) });
    await page.evaluate(() => document.dispatchEvent(new MouseEvent("mouseleave")));
    assert.equal(await page.locator("body").evaluate(el => el.classList.contains("custom-cursor-active")), false);
    assert.equal(await page.locator("[data-ink-cursor]").evaluate(el => getComputedStyle(el).opacity), "0");
    await verifyDot(page, "h1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await verifyDot(page, "h1");
    await page.screenshot({ path: path.join(out, `${theme}-reduced-motion.png`) });
    await page.getByRole("link", { name: "Privacy", exact: true }).click();
    await page.waitForURL("**/privacy");
    assert.equal(await page.locator("body").evaluate(el => el.classList.contains("custom-cursor-active")), false);
    assert.equal(await page.locator("[data-ink-cursor]").count(), 0);
    await page.close();
  }
  const touch = await browser.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  await touch.goto(url);
  await touch.waitForSelector(".hero-actions");
  await touch.locator("header button").first().tap();
  assert.equal(await touch.locator("[data-ink-cursor]").count(), 0);
  assert.equal(await touch.locator("body").evaluate(el => el.classList.contains("custom-cursor-active")), false);
  await touch.screenshot({ path: path.join(out, "touch.png") });
  report.push({ touch: "No custom cursor or native-cursor suppression" });
  await fs.writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  console.log(`PASS cursor: text, links, buttons, tracking, leave/re-entry, reduced motion, route cleanup, touch. Artifacts: ${out}`);
} finally {
  await browser.close();
}
