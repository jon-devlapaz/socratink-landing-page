/** Scroll draws; pauses hold; returning never erases what has been drawn. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import { chapterRange, scrollChapter, settledScroll } from "./lib/ink-scroll.mjs";

const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(os.tmpdir(), "socratink-chapter-verification");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || (os.platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome"),
  headless: true,
  args: os.platform() === "darwin" ? ["--use-gl=angle", "--use-angle=metal"] : ["--no-sandbox"],
});
const errors = [];
const chapters = [["how", "map"], ["speak", "speak"], ["keep", "teacher"]];

async function makePage(theme, viewport = { width: 1440, height: 1000 }, options = {}) {
  const page = await browser.newPage({ viewport, colorScheme: theme, ...options });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.addInitScript((theme) => {
    localStorage.setItem("socratink-theme", theme);
    window.__chapterDraws = {};
    for (const method of ["drawArrays", "drawElements"]) {
      const draw = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) {
        const study = this.canvas.parentElement?.dataset.study;
        if (study) window.__chapterDraws[study] = (window.__chapterDraws[study] || 0) + 1;
        return draw.apply(this, args);
      };
    }
  }, theme);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.mouse.move(10, 80);
  return page;
}

async function amount(page, study) {
  return Number(await page.locator(`[data-study="${study}"]`).getAttribute("data-ink-progress"));
}

try {
  for (const theme of ["light", "dark"]) {
    const page = await makePage(theme);
    for (const [track, study] of chapters) {
      const mount = page.locator(`[data-study="${study}"]`);
      const beforeEntry = await mount.getAttribute("data-ink-progress");
      assert.ok(beforeEntry === null || Number(beforeEntry) === 0, `${study}: do not draw during prefetch`);
      const figure = page.locator(`[data-chapter-ink="${study}"]`);
      assert.equal(await figure.getAttribute("data-ink-state"), "preparing");
      assert.equal(await figure.locator(":scope > :last-child").evaluate((poster) => getComputedStyle(poster).opacity), "0", "Do not flash the finished poster before drawing");
      const range = await chapterRange(page, track, study);
      assert.ok(range.end - range.start < 600, "Use the existing arrival, not an extra pinned chapter");
      await scrollChapter(page, range, 0);
      await settledScroll(page, study);
      await page.waitForTimeout(1100);
      assert.equal(await amount(page, study), 0, "Waiting at the start must not autoplay");

      await scrollChapter(page, range, 0.3);
      await settledScroll(page, study);
      const partial = await amount(page, study);
      assert.ok(partial >= 0.3 && partial < 0.32, `${study}: scroll chooses the amount drawn, got ${partial}`);
      const canvas = mount.locator("canvas");
      const early = await canvas.screenshot();
      const draws = await page.evaluate((study) => window.__chapterDraws[study], study);
      await page.waitForTimeout(800);
      assert.equal(await amount(page, study), partial, "Stopping must pause the drawing after a brief catch-up");
      assert.ok(early.equals(await canvas.screenshot()), "Paused ink must remain visually unchanged");
      assert.equal(await page.evaluate((study) => window.__chapterDraws[study], study), draws, "A partial drawing must stop repainting, not just look still");

      await scrollChapter(page, range, 0.1);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), partial, "Upward scrolling must never erase ink");
      await scrollChapter(page, range, 0.25);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), partial, "Repeated scrolling inside the same range must not accumulate progress");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(650);
      assert.equal(await amount(page, study), partial, "Hidden ink must not finish behind the hero");
      await scrollChapter(page, range, 0.3);
      await settledScroll(page, study);
      assert.ok(early.equals(await canvas.screenshot()), "Returning must preserve the partial composition");

      await scrollChapter(page, range, 0.58);
      await settledScroll(page, study);
      assert.ok(!early.equals(await canvas.screenshot()), `${study}: further scroll must visibly continue the composition`);
      if (study === "speak") {
        const silence = await canvas.screenshot();
        await scrollChapter(page, range, 0.68);
        await settledScroll(page, study);
        assert.ok(silence.equals(await canvas.screenshot()), "The pause between voices is a real stretch of scroll");
        await scrollChapter(page, range, 0.88);
        await settledScroll(page, study);
        assert.ok(!silence.equals(await canvas.screenshot()), "Further scroll must draw the answering stroke");
      }

      await scrollChapter(page, range, 1);
      await settledScroll(page, study);
      assert.equal(await mount.getAttribute("data-ink-entrance"), "settled");
      const settled = await canvas.screenshot();
      const settledDraws = await page.evaluate((study) => window.__chapterDraws[study], study);
      await page.waitForTimeout(650);
      assert.ok(settled.equals(await canvas.screenshot()), `${study}: hold the finished composition still`);
      assert.equal(await page.evaluate((study) => window.__chapterDraws[study], study), settledDraws, "Completed ink needs no idle GPU work");
      await page.screenshot({ path: path.join(out, `${study}-${theme}.png`) });
      await scrollChapter(page, range, 0.4);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), 1, "Completed art must stay complete on re-entry");
      assert.ok(settled.equals(await canvas.screenshot()), "Completed art must not replay");
      console.log(`PASS: ${study}/${theme}: scroll, pause, rewind protection, resume and quiet completion`);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => document.querySelectorAll("[data-study] canvas").length === 0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const [track, study] of chapters) {
      await page.evaluate((track) => {
        window.scrollTo({ top: 0, behavior: "instant" });
        window.scrollTo({ top: document.querySelector(`.folio-track-${track}`).offsetTop, behavior: "instant" });
      }, track);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), 1, "A motion preference change must not replay finished art");
    }
    await page.close();
  }

  // Failures and layout changes must not resurrect a partly drawn illustration.
  const recovery = await makePage("light");
  const range = await chapterRange(recovery, "how", "map");
  await scrollChapter(recovery, range, 0.4);
  await settledScroll(recovery, "map");
  const partial = await amount(recovery, "map");
  await recovery.locator("#appearance-toggle").click();
  await recovery.waitForTimeout(1200);
  assert.equal(await amount(recovery, "map"), partial, "Changing theme must not advance a stopped drawing");
  await recovery.setViewportSize({ width: 1280, height: 900 });
  await settledScroll(recovery, "map");
  assert.ok(await amount(recovery, "map") >= partial, "Resizing must not erase existing ink");
  await recovery.locator('[data-study="map"] canvas').evaluate((canvas) => {
    window.__chapterContext = canvas.getContext("webgl2").getExtension("WEBGL_lose_context");
    window.__chapterContext.loseContext();
  });
  await recovery.waitForFunction(() => document.querySelector('[data-chapter-ink="map"]').dataset.inkState === "fallback");
  assert.equal(await recovery.locator('[data-chapter-ink="map"] > :last-child').evaluate((p) => getComputedStyle(p).opacity), "1");
  await recovery.evaluate(() => window.__chapterContext.restoreContext());
  await settledScroll(recovery, "map");
  assert.equal(await amount(recovery, "map"), 1, "Recovery must agree with the finished fallback");
  await recovery.close();

  const preference = await makePage("dark");
  const preferenceRange = await chapterRange(preference, "how", "map");
  await scrollChapter(preference, preferenceRange, 0.4);
  await settledScroll(preference, "map");
  await preference.emulateMedia({ reducedMotion: "reduce" });
  await preference.waitForFunction(() => document.querySelectorAll("[data-study] canvas").length === 0);
  await preference.emulateMedia({ reducedMotion: "no-preference" });
  await settledScroll(preference, "map");
  assert.equal(await amount(preference, "map"), 1, "A finished reduced-motion poster must not become a partial drawing again");
  await preference.close();
  console.log("PASS: theme changes, resize, partial context loss, and live reduced-motion changes");

  for (const [width, height, theme] of [[375, 667, "light"], [320, 568, "dark"]]) {
    const page = await makePage(theme, { width, height });
    for (const [track, study] of chapters) {
      const range = await chapterRange(page, track, study);
      await scrollChapter(page, range, 0.4);
      await settledScroll(page, study);
      const partial = await amount(page, study);
      assert.ok(partial >= 0.4 && partial < 0.43, `${study}/${width}: meaningful partial mobile drawing`);
      await page.waitForTimeout(450);
      assert.equal(await amount(page, study), partial, "Mobile scroll stop must pause");
      await scrollChapter(page, range, 0.1);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), partial, "Mobile upward scroll must preserve ink");
      await scrollChapter(page, range, 1);
      await settledScroll(page, study);
      assert.equal(await amount(page, study), 1);
      await page.screenshot({ path: path.join(out, `${study}-${width}-${theme}.png`) });
    }
    await page.close();
    console.log(`PASS: ${width}×${height}/${theme}: mobile scroll control and completion`);
  }

  for (const touch of [false, true]) {
    const page = await makePage("light", touch ? { width: 375, height: 667 } : { width: 1440, height: 1000 }, { hasTouch: touch, isMobile: touch });
    const range = await chapterRange(page, "how", "map");
    await scrollChapter(page, range, 0.3);
    await settledScroll(page, "map");
    const start = await amount(page, "map");
    const cdp = await page.context().newCDPSession(page);
    if (touch) {
      await cdp.send("Input.synthesizeScrollGesture", { x: 180, y: 400, yDistance: -40, speed: 100, gestureSourceType: "touch" });
    } else {
      await page.mouse.wheel(0, 100);
    }
    await page.waitForTimeout(1500);
    await settledScroll(page, "map");
    const forward = await amount(page, "map");
    assert.ok(forward > start + 0.05 && forward < 0.95, `Real ${touch ? "touch" : "wheel"} scrolling must advance a partial drawing`);
    const forwardY = await page.evaluate(() => scrollY);
    if (touch) {
      await cdp.send("Input.synthesizeScrollGesture", { x: 180, y: 400, yDistance: 35, speed: 100, gestureSourceType: "touch" });
    } else {
      await page.mouse.wheel(0, -60);
    }
    await page.waitForTimeout(1500);
    await settledScroll(page, "map");
    assert.ok(await page.evaluate(() => scrollY) < forwardY - 5, "The reverse gesture must actually move the page upward");
    assert.equal(await amount(page, "map"), forward, "Real upward gestures must preserve the ink");
    await cdp.detach();
    await page.close();
    console.log(`PASS: actual ${touch ? "touch" : "wheel"} gestures control drawing without erasing`);
  }

  const navigation = await makePage("light");
  await navigation.getByRole("link", { name: "See how it works", exact: true }).click();
  await settledScroll(navigation, "map");
  await navigation.waitForFunction(() => Number(document.querySelector('[data-study="map"]').dataset.inkProgress) === 1);
  await navigation.keyboard.press("End");
  await navigation.waitForFunction(() => Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)) <= 1);
  await navigation.waitForFunction(() => getComputedStyle(document.querySelector("[data-colophon]")).opacity === "1");
  const signature = await navigation.locator("[data-printers-mark]").evaluate(async (mark) => {
    const parts = [...mark.children];
    await Promise.all(parts.map(async (part) => {
      const image = new Image();
      image.src = getComputedStyle(part).maskImage.match(/url\(["']?(.*?)["']?\)/)[1];
      await image.decode();
    }));
    const rect = mark.getBoundingClientRect();
    const text = mark.previousElementSibling.getBoundingClientRect();
    return { count: parts.length, hidden: mark.getAttribute("aria-hidden"), gap: rect.top - text.bottom, inset: rect.left - text.left, right: rect.right, width: innerWidth };
  });
  assert.equal(signature.count, 3);
  assert.equal(signature.hidden, "true", "The printer's signature is decorative, not a fake progress control");
  assert.ok(signature.gap >= 20 && signature.gap <= 32, "Leave a deliberate gap below the closing copy");
  assert.ok(signature.inset >= -16 && signature.inset <= 0, "Optically align the signature with the text, allowing for the image's transparent margin");
  assert.ok(signature.right <= signature.width, "The signature must fit inside the page");
  await navigation.screenshot({ path: path.join(out, "colophon-signature-light.png") });
  await navigation.keyboard.press("Home");
  await navigation.waitForFunction(() => scrollY === 0);
  await navigation.keyboard.press("End");
  await navigation.waitForTimeout(600);
  await navigation.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: Math.ceil(document.querySelector(".folio-track-speak").getBoundingClientRect().top), behavior: "instant" });
  });
  await settledScroll(navigation, "speak");
  assert.equal(await amount(navigation, "speak"), 1, "Skipped chapters must return as finished artwork");
  await navigation.close();
  console.log("PASS: anchor links, keyboard navigation, fast skips, and the closing printer's signature");
  assert.deepEqual(errors, [], "No runtime or shader errors");
} finally {
  await browser.close();
}
