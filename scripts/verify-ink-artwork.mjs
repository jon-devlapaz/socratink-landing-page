/** Hero ink flows automatically; pause, manual gestures, and still fallbacks agree. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(os.tmpdir(), "socratink-ink-verification");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || (os.platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome"),
  headless: true,
  args: os.platform() === "darwin" ? ["--use-gl=angle", "--use-angle=metal"] : ["--no-sandbox"],
});
const errors = [];

async function ready(page, selector) {
  await page.waitForFunction((selector) => document.querySelector(selector)?.dataset.inkReady === "true", selector);
}

async function restingHero(page) {
  await page.waitForFunction(() => document.querySelector(".ink-render")?.dataset.inkMorphing === "false");
}

async function heroForm(page, form) {
  await page.waitForFunction((form) => document.querySelector(".hero-living-ink")?.getAttribute("aria-label")?.startsWith(`Living ink, ${form}.`), form, { timeout: 12000 });
}

async function verifyPosters(page, theme) {
  const results = await page.evaluate(async (theme) => {
    const posters = [document.querySelector(".ink-poster"), ...document.querySelectorAll("[data-chapter-ink] > :last-child")];
    return Promise.all(posters.map(async (poster) => {
      const style = getComputedStyle(poster);
      const src = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
      if (!src) throw new Error("Missing ink poster background");
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 32) painted++;
      return { src, opacity: Number(style.opacity), painted: painted / (data.length / 4), theme };
    }));
  }, theme);
  assert.equal(results.length, 4);
  for (const result of results) {
    assert.equal(result.opacity, 1, `Poster must be visible: ${result.src}`);
    assert.equal(/-dark(?:-\d+)?\.webp$/.test(result.src), theme === "dark", `Poster theme: ${result.src}`);
    assert.ok(result.painted > 0.005 && result.painted < 0.4, `Ink should leave unpainted space: ${JSON.stringify(result)}`);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.addInitScript(() => {
    localStorage.setItem("socratink-theme", "light");
    window.__inkDraws = 0;
    for (const method of ["drawArrays", "drawElements"]) {
      const draw = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) {
        window.__inkDraws++;
        return draw.apply(this, args);
      };
    }
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await ready(page, ".ink-render");
  await page.waitForTimeout(1500);
  const hero = page.locator(".hero-living-ink");
  const canvas = hero.locator("canvas");
  await page.screenshot({ path: path.join(out, "hero-controls.png") });
  assert.equal(await page.locator('xpath=//*[@id="top"]/div/figure/div/button[2]').count(), 0, "The separate playback button must be removed");
  assert.equal(await page.locator(".hero-subject > button").count(), 1, "Keep the interactive ink itself");
  const resting = await canvas.screenshot();
  const draws = await page.evaluate(() => window.__inkDraws);
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => window.__inkDraws), draws, "Quiet holds should not redraw WebGL");
  await heroForm(page, "droplet");
  const beforeFlow = await canvas.screenshot();
  await page.waitForTimeout(1200);
  const duringFlow = await canvas.screenshot({ path: path.join(out, "automatic-flow.png") });
  assert.ok(!beforeFlow.equals(duringFlow), "Automatic transitions must flow, not jump between stills");

  await hero.focus();
  const beforePauseScroll = await page.evaluate(() => scrollY);
  await page.keyboard.press("Space");
  assert.match(await hero.getAttribute("aria-label"), /Space to resume animation/);
  assert.equal(await page.evaluate(() => scrollY), beforePauseScroll, "Space pauses without scrolling the page");
  await page.waitForTimeout(100);
  const frozen = await canvas.screenshot();
  await page.waitForTimeout(9500);
  assert.ok(frozen.equals(await canvas.screenshot()), "Pause must freeze even a transition already in progress");
  assert.match(await hero.getAttribute("aria-label"), /Living ink, droplet/);
  await page.keyboard.press("Space");
  await restingHero(page);
  await heroForm(page, "ribbon");
  await hero.press("Space");
  console.log("PASS: automatic flowing transitions and keyboard pause/resume");

  await hero.focus();
  await page.keyboard.press("Escape");
  await restingHero(page);
  for (const form of ["droplet", "ribbon", "crescent", "open circle", "branch", "confluence"]) {
    await page.keyboard.press("Enter");
    assert.ok((await hero.getAttribute("aria-label")).includes(`Living ink, ${form}.`));
    await restingHero(page);
    const shot = await canvas.screenshot({ path: path.join(out, `${form.replaceAll(" ", "-")}.png`) });
    if (form === "open circle") {
      const empty = await page.evaluate(async (data) => {
        const image = new Image();
        image.src = data;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const center = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
        ctx.fillRect(0, 0, 1, 1);
        const paper = ctx.getImageData(0, 0, 1, 1).data;
        return center.every((value, i) => Math.abs(value - paper[i]) < 4);
      }, `data:image/png;base64,${shot.toString("base64")}`);
      assert.ok(empty, "The open circle must frame unpainted paper");
    }
  }
  await page.keyboard.press("Escape");
  assert.match(await hero.getAttribute("aria-label"), /Living ink, sphere/);
  await restingHero(page);
  assert.match(await hero.getAttribute("aria-label"), /Space to resume animation/, "Manual gestures must preserve the autoplay pause preference");
  await hero.blur();
  console.log("PASS: manual reshaping while paused, open-circle space, and Escape reset");

  await hero.press("Space");
  await page.evaluate(() => window.scrollTo({ top: document.querySelector(".folio-track-speak").offsetTop, behavior: "instant" }));
  await page.waitForTimeout(10000);
  assert.match(await hero.getAttribute("aria-label"), /Living ink, sphere/, "Covered hero ink must not advance");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  assert.match(await hero.getAttribute("aria-label"), /Living ink, sphere/, "Returning must not skip ahead");
  await heroForm(page, "droplet");
  await hero.press("Space");
  await hero.focus();
  await page.keyboard.press("Escape");
  await restingHero(page);
  await hero.blur();
  console.log("PASS: autoplay suspends behind the folio and resumes without skipping");

  await page.locator("#appearance-toggle").click();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.ok(!resting.equals(await canvas.screenshot()), "Live ink must respond to theme changes");
  await page.screenshot({ path: path.join(out, "hero-dark.png") });

  // A lost WebGL context must reveal a usable still, then recover when restored.
  const canRestore = await canvas.evaluate((element) => {
    const extension = element.getContext("webgl2").getExtension("WEBGL_lose_context");
    if (!extension) return false;
    window.__inkLostContext = extension;
    extension.loseContext();
    return true;
  });
  assert.ok(canRestore, "Browser must support context-loss verification");
  await page.waitForFunction(() => document.querySelector(".hero-living-ink").getAttribute("aria-disabled") === "true");
  assert.equal(await hero.locator(".ink-poster").evaluate((element) => getComputedStyle(element).opacity), "1");
  await page.evaluate(() => window.__inkLostContext.restoreContext());
  await ready(page, ".ink-render");
  console.log("PASS: theme-aware ink and context-loss fallback/recovery");

  for (const [id, study] of [["how-it-works", "map"], ["speak", "speak"], ["keep", "teacher"]]) {
    await page.evaluate((id) => {
      window.scrollTo({ top: 0, behavior: "instant" });
      const top = document.getElementById(id).closest(".folio-section-track").getBoundingClientRect().top;
      window.scrollTo({ top: Math.ceil(top), behavior: "instant" });
    }, id);
    await ready(page, `[data-study="${study}"]`);
    await page.waitForFunction((study) => document.querySelector(`[data-study="${study}"]`)?.dataset.inkEntrance === "settled", study);
    const mark = page.locator(`[data-study="${study}"] canvas`);
    const before = await mark.screenshot();
    await page.waitForTimeout(600);
    assert.ok(before.equals(await mark.screenshot()), `${study} should hold still at rest`);
    await page.screenshot({ path: path.join(out, `${study}-dark.png`) });
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelectorAll(".ink-render canvas, [data-study] canvas").length === 0);
  await verifyPosters(page, "dark");
  assert.equal(await page.locator(".hero-ink-playback").count(), 0, "Reduced motion must not offer an animation control");
  await page.locator("#appearance-toggle").click();
  await verifyPosters(page, "light");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({ path: path.join(out, "reduced-mobile.png") });
  assert.equal(await hero.getAttribute("tabindex"), "-1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await ready(page, ".ink-render");
  await page.waitForFunction(() => document.querySelector(".hero-living-ink").getAttribute("aria-disabled") === "false");
  assert.match(await hero.getAttribute("aria-label"), /Space to resume animation/, "Pause preference must survive a reduced-motion change");
  console.log("PASS: chapter stillness and live reduced-motion changes in both themes");
  await page.close();

  const blocked = await browser.newPage({ colorScheme: "light" });
  await blocked.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.includes("webgl") ? null : getContext.call(this, type, ...args);
    };
  });
  await blocked.goto(url, { waitUntil: "networkidle" });
  await blocked.locator("#keep").scrollIntoViewIfNeeded();
  await blocked.waitForTimeout(500);
  assert.equal(await blocked.locator(".hero-living-ink").getAttribute("aria-disabled"), "true");
  await verifyPosters(blocked, "light");
  assert.equal(await blocked.locator(".hero-ink-playback").count(), 0);
  await blocked.close();

  const noScript = await browser.newPage({ javaScriptEnabled: false, colorScheme: "dark" });
  await noScript.goto(url, { waitUntil: "networkidle" });
  await verifyPosters(noScript, "dark");
  assert.equal(await noScript.locator(".ink-render canvas, [data-study] canvas").count(), 0);
  assert.equal(await noScript.locator(".hero-ink-playback").count(), 0);
  await noScript.close();
  console.log("PASS: WebGL-disabled and JavaScript-disabled artwork fallbacks");
  assert.deepEqual(errors, [], "No runtime or shader errors");
  console.log(`PASS: ink artwork verification; screenshots: ${out}`);
} finally {
  await browser.close();
}
