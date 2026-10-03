import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));
const brand = fileURLToPath(new URL("../public/brand/", import.meta.url));
const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(os.tmpdir(), "socratink-ink-delivery");
await fs.mkdir(out, { recursive: true });

async function samePixels(source, target) {
  const before = await source.ensureAlpha().raw().toBuffer();
  const after = await sharp(path.join(brand, target)).ensureAlpha().raw().toBuffer();
  assert.equal(after.length, before.length, `${target}: preserve dimensions`);
  for (let i = 0; i < before.length; i += 4) {
    assert.equal(after[i + 3], before[i + 3], `${target}: preserve alpha at ${i / 4}`);
    if (before[i + 3]) {
      for (let c = 0; c < 3; c++) assert.equal(after[i + c], before[i + c], `${target}: preserve visible color at ${i / 4}`);
    }
  }
}

for (const theme of ["light", "dark"]) {
  const original = path.join(brand, `living-ink-poster${theme === "dark" ? "-dark" : ""}.png`);
  for (const size of [512, 768, 1120]) {
    const name = `living-ink-${theme}-${size}.webp`;
    await samePixels(sharp(original).resize(size), name);
    assert.ok((await fs.stat(path.join(brand, name))).size < (size === 512 ? 50000 : 200000), `${name}: image budget`);
  }
  for (const study of ["map", "speak", "teacher"]) {
    await samePixels(sharp(path.join(brand, `ink-${study}-${theme}.png`)), `ink-${study}-${theme}.webp`);
  }
}
for (const study of ["map", "speak", "teacher"]) {
  const original = await sharp(path.join(brand, `ink-${study}-light.png`)).resize(144, 108).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  const mask = path.join(brand, `signature-${study}.webp`);
  const optimized = await sharp(mask).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  assert.ok(original.equals(optimized), `${study}: signature must preserve the resized silhouette exactly`);
  assert.ok((await fs.stat(mask)).size < 3000, `${study}: signature mask must be miniature`);
}
console.log("PASS: lossless image pixels, original mask silhouettes, and asset budgets");

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || (os.platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome"),
  headless: true,
});
const errors = [];
const cases = [
  { width: 375, height: 667, dpr: 2, system: "light", theme: "light", size: 512 },
  { width: 375, height: 667, dpr: 2, system: "dark", theme: "dark", size: 512 },
  { width: 375, height: 667, dpr: 3, system: "dark", theme: "light", stored: "light", size: 768 },
  { width: 1440, height: 1000, dpr: 1, system: "light", theme: "dark", stored: "dark", size: 1120 },
  { width: 1440, height: 1000, dpr: 2, system: "dark", theme: "light", stored: "light", size: 1120 },
  { width: 320, height: 568, dpr: 2, system: "dark", theme: "dark", size: 512, noScript: true },
];
try {
  for (const c of cases) {
    const page = await browser.newPage({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: c.dpr,
      colorScheme: c.system, reducedMotion: "reduce", javaScriptEnabled: !c.noScript });
    page.on("pageerror", error => errors.push(error.message));
    if (c.stored) await page.addInitScript(theme => localStorage.setItem("socratink-theme", theme), c.stored);
    const requests = [];
    page.on("request", request => requests.push(new URL(request.url()).pathname));
    await page.goto(url, { waitUntil: "networkidle" });
    if (c === cases[0]) {
      const scripts = await page.locator("script[src]").evaluateAll(nodes => nodes.map(node => node.src));
      for (const src of scripts) {
        const response = await page.request.get(src);
        assert.ok(!(await response.text()).includes("Softness where parts merge, in scene units."), "Keep scene validation out of the initial page scripts");
      }
    }
    const expected = `/brand/living-ink-${c.theme}-${c.size}.webp`;
    const poster = page.locator(".ink-poster");
    assert.ok((await poster.evaluate(el => getComputedStyle(el).backgroundImage)).includes(expected), "Select the correct theme and responsive size");
    assert.deepEqual(requests.filter(src => src.startsWith("/brand/living-ink")), [expected], "Load just one correctly themed hero image");
    assert.ok(!requests.some(src => /^\/brand\/(?:ink-|living-ink).*\.png$/.test(src)), "Do not download original full-size PNGs");
    assert.equal(await page.locator(".ink-render canvas").count(), 0, "Still fallbacks must not initialize WebGL");
    if (!c.noScript) {
      assert.equal(await page.locator("link[data-ink-preload]").getAttribute("href"), expected);
      assert.equal(await page.locator("link[data-ink-preload]").getAttribute("fetchpriority"), "high");
      await page.locator("#appearance-toggle").click();
      const opposite = c.theme === "light" ? "dark" : "light";
      await page.waitForFunction(theme => getComputedStyle(document.querySelector(".ink-poster")).backgroundImage.includes(`living-ink-${theme}-`), opposite);
      await page.setViewportSize({ width: c.width < 768 ? 1440 : 375, height: 1000 });
      const resized = c.width < 768 ? 1120 : c.dpr > 2 ? 768 : 512;
      await page.waitForFunction(size => getComputedStyle(document.querySelector(".ink-poster")).backgroundImage.includes(`-${size}.webp`), resized);
    }
    await page.screenshot({ path: path.join(out, `${c.width}-${c.system}-${c.theme}-${c.dpr}${c.noScript ? "-no-js" : ""}.png`) });
    await page.close();
  }
  console.log("PASS: one prioritized hero image, saved/system themes, resizing, Retina, and no-JS delivery");

  for (const mode of ["paint", "cancel", "missing"]) {
    const cancel = mode === "cancel";
    const page = await browser.newPage({ viewport: { width: 375, height: 667 }, colorScheme: "light" });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      window.requestIdleCallback = undefined;
      window.__inkContexts = 0;
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type.includes("webgl")) window.__inkContexts++;
        return getContext.call(this, type, ...args);
      };
    });
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route("**/brand/living-ink-*.webp", async route => {
      await held;
      if (mode === "missing") await route.abort("failed");
      else await route.continue();
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    assert.equal(await page.evaluate(() => window.__inkContexts), 0, "The poster must get a chance to paint before WebGL initializes");
    if (cancel) await page.emulateMedia({ reducedMotion: "reduce" });
    release();
    if (cancel) {
      await page.waitForTimeout(800);
      assert.equal(await page.evaluate(() => window.__inkContexts), 0, "Cancel pending startup when reduced motion changes");
    } else {
      await page.waitForFunction(() => document.querySelector(".ink-render")?.dataset.inkReady === "true");
      assert.equal(await page.locator(".hero-living-ink").getAttribute("aria-disabled"), "false");
      if (mode === "paint") {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.waitForFunction(() => !document.querySelector(".ink-render canvas"));
        await page.evaluate(() => {
          const decode = HTMLImageElement.prototype.decode;
          HTMLImageElement.prototype.decode = function () {
            return new Promise(resolve => {
              window.__resumeInkPoster = async () => { await decode.call(this); resolve(); };
            });
          };
        });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.waitForFunction(() => typeof window.__resumeInkPoster === "function");
        assert.equal(await page.locator(".ink-poster").evaluate(el => getComputedStyle(el).opacity), "1", "Keep the still visible while animation restarts");
        assert.equal(await page.locator(".hero-living-ink").getAttribute("aria-disabled"), "true");
        await page.evaluate(() => window.__resumeInkPoster());
        await page.waitForFunction(() => document.querySelector(".ink-render")?.dataset.inkReady === "true");
      }
    }
    await page.close();
  }
  console.log("PASS: paint-first startup, idle-callback fallback, cancellation, and missing-image recovery");
  for (const action of ["restore", "cancel", "chapter"]) {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 }, colorScheme: "light",
      reducedMotion: action === "chapter" ? "reduce" : "no-preference" });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__shaderQueries = 0;
      window.__allowShaderReady = false;
      let completion;
      const extension = WebGL2RenderingContext.prototype.getExtension;
      WebGL2RenderingContext.prototype.getExtension = function (name) {
        const value = extension.call(this, name);
        if (name === "KHR_parallel_shader_compile" && value) completion = value.COMPLETION_STATUS_KHR;
        return value;
      };
      const parameter = WebGL2RenderingContext.prototype.getProgramParameter;
      WebGL2RenderingContext.prototype.getProgramParameter = function (program, name) {
        if (name === completion) {
          window.__shaderQueries++;
          if (!window.__allowShaderReady) return false;
        }
        return parameter.call(this, program, name);
      };
    });
    await page.goto(url, { waitUntil: "networkidle" });
    if (action === "chapter") {
      await page.evaluate(() => scrollTo({ top: Math.ceil(document.querySelector(".folio-track-how").getBoundingClientRect().top), behavior: "instant" }));
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.waitForFunction(() => window.__shaderQueries > 2);
      assert.equal(await page.locator('[data-chapter-ink="map"] > :last-child').evaluate(el => getComputedStyle(el).opacity), "1", "Do not blank a completed chapter while animation restarts");
      await page.evaluate(() => { window.__allowShaderReady = true; });
      await page.waitForFunction(() => document.querySelector('[data-study="map"]').dataset.inkReady === "true");
      assert.equal(await page.locator('[data-study="map"]').getAttribute("data-ink-progress"), "1.000");
      await page.close();
      continue;
    }
    await page.waitForFunction(() => window.__shaderQueries > 2);
    assert.equal(await page.locator(".ink-render").getAttribute("data-ink-ready"), "false", "Do not draw while shaders are still compiling");
    assert.equal(await page.locator(".ink-poster").evaluate(el => getComputedStyle(el).opacity), "1", "Keep the poster visible during compilation");
    if (action === "cancel") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() => !document.querySelector(".ink-render canvas"));
      const queries = await page.evaluate(() => window.__shaderQueries);
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => window.__shaderQueries), queries, "Cancel shader polling on disposal");
    } else {
      await page.locator(".ink-render canvas").evaluate(canvas => {
        window.__lostInkContext = canvas.getContext("webgl2").getExtension("WEBGL_lose_context");
        window.__lostInkContext.loseContext();
      });
      await page.waitForTimeout(100);
      const queries = await page.evaluate(() => window.__shaderQueries);
      await page.evaluate(() => window.__lostInkContext.restoreContext());
      await page.waitForFunction(count => window.__shaderQueries > count, queries);
      await page.evaluate(() => { window.__allowShaderReady = true; });
      await page.waitForFunction(() => document.querySelector(".ink-render").dataset.inkReady === "true");
    }
    await page.close();
  }
  console.log("PASS: non-blocking shader warmup, still-art handoff, cancellation, and context recovery during compilation");
  const anchor = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  anchor.on("pageerror", error => errors.push(error.message));
  await anchor.addInitScript(() => {
    const Observer = IntersectionObserver;
    window.IntersectionObserver = class extends Observer {
      constructor(callback, options) {
        super((entries, observer) => callback(entries.map(entry =>
          !options && entry.target.matches("[data-study], .ink-render")
            ? new Proxy(entry, { get: (target, key) => key === "isIntersecting" ? false : Reflect.get(target, key, target) })
            : entry), observer), options);
      }
    };
  });
  await anchor.goto(url, { waitUntil: "networkidle" });
  await anchor.getByRole("link", { name: "See how it works", exact: true }).click();
  await anchor.waitForFunction(() => {
    const ink = document.querySelector('[data-study="map"]');
    return ink.dataset.inkReady === "true" && ink.dataset.inkProgress === "1.000";
  }, null, { timeout: 8000 });
  await anchor.close();
  console.log("PASS: anchor navigation draws visible ink even when intersection notifications lag");
  const legal = await browser.newPage();
  await legal.goto(new URL("/privacy", url).href, { waitUntil: "networkidle" });
  assert.equal(await legal.locator("link[data-ink-preload]").count(), 0, "Legal pages must not preload hero artwork");
  await legal.close();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
