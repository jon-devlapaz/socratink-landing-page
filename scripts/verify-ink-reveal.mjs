/** Inspect every drawn entrance frame, not just the finished silhouette. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";
import { chapterRange, scrollChapter, settledScroll, drawWithScroll } from "./lib/ink-scroll.mjs";

const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(os.tmpdir(), "socratink-ink-reveal");
const deviceScaleFactor = Number(process.env.INK_DPR || 1);
assert.ok([1, 2].includes(deviceScaleFactor), "INK_DPR must be 1 or 2");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || (os.platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome"),
  headless: true,
  args: os.platform() === "darwin" ? ["--use-gl=angle", "--use-angle=metal"] : ["--no-sandbox"],
});
const failures = [];
const errors = [];

try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: theme, deviceScaleFactor });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.addInitScript((theme) => {
      localStorage.setItem("socratink-theme", theme);
      window.__inkFrames = {};
      const last = {};
      const copy = document.createElement("canvas");
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) => raf((time) => {
        callback(time);
        for (const mount of document.querySelectorAll('[data-study="map"], [data-study="speak"]')) {
          const { study, inkReady, inkProgress } = mount.dataset;
          const canvas = mount.querySelector("canvas");
          if (!canvas || inkReady !== "true" || last[study] === inkProgress) continue;
          last[study] = inkProgress;
          copy.width = canvas.width;
          copy.height = canvas.height;
          // Read before the WebGL drawing buffer is discarded at compositing.
          ctx.drawImage(canvas, 0, 0);
          const rgba = ctx.getImageData(0, 0, copy.width, copy.height).data;
          const alpha = new Uint8Array(rgba.length / 4);
          for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
          (window.__inkFrames[study] ??= []).push({
            progress: Number(inkProgress), alpha, width: copy.width, height: copy.height,
          });
        }
      });
    }, theme);
    await page.goto(url, { waitUntil: "networkidle" });
    for (const [track, study] of [["how", "map"], ["speak", "speak"]]) {
      const range = await chapterRange(page, track, study);
      await scrollChapter(page, range, 0);
      await settledScroll(page, study);
      await drawWithScroll(page, range);
      await settledScroll(page, study);
      await page.waitForFunction((study) => document.querySelector(`[data-study="${study}"]`)?.dataset.inkEntrance === "settled", study);
      const result = await page.evaluate((study) => {
        const frames = window.__inkFrames[study];
        const final = frames.at(-1);
        const { width, height } = final;
        const support = new Uint8Array(width * height);
        // Allow a two-pixel antialiasing fringe around the finished artwork.
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          if (final.alpha[y * width + x] <= 32) continue;
          for (let yy = Math.max(0, y - 2); yy <= Math.min(height - 1, y + 2); yy++) {
            for (let xx = Math.max(0, x - 2); xx <= Math.min(width - 1, x + 2); xx++) support[yy * width + xx] = 1;
          }
        }
        const measurements = frames.map((frame, index) => {
          let outside = 0, erased = 0, fragments = 0;
          const seen = new Uint8Array(width * height);
          for (let i = 0; i < frame.alpha.length; i++) {
            if (frame.alpha[i] > 32 && !support[i]) outside++;
            if (index && frames[index - 1].alpha[i] > 160 && frame.alpha[i] < 32) erased++;
            if (seen[i] || frame.alpha[i] <= 32) continue;
            const queue = [i];
            seen[i] = 1;
            for (let j = 0; j < queue.length; j++) {
              const p = queue[j], x = p % width, y = Math.floor(p / width);
              for (let yy = Math.max(0, y - 1); yy <= Math.min(height - 1, y + 1); yy++) {
                for (let xx = Math.max(0, x - 1); xx <= Math.min(width - 1, x + 1); xx++) {
                  const n = yy * width + xx;
                  if (!seen[n] && frame.alpha[n] > 32) { seen[n] = 1; queue.push(n); }
                }
              }
            }
            if (queue.length > 4) fragments++;
          }
          return { index, progress: frame.progress, outside, erased, fragments };
        });
        const worst = measurements.reduce((a, b) => b.outside > a.outside ? b : a);
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        const image = ctx.createImageData(width, height);
        frames[worst.index].alpha.forEach((alpha, i) => {
          image.data[i * 4] = 16; image.data[i * 4 + 1] = 15; image.data[i * 4 + 2] = 15; image.data[i * 4 + 3] = alpha;
        });
        ctx.putImageData(image, 0, 0);
        const coverage = final.alpha.reduce((count, alpha) => count + Number(alpha > 32), 0) / final.alpha.length;
        return { frames: frames.length, finished: final.progress, coverage, measurements, worstFrame: canvas.toDataURL() };
      }, study);
      const { worstFrame, ...report } = result;
      await fs.writeFile(path.join(out, `${study}-${theme}.json`), JSON.stringify(report, null, 2));
      await fs.writeFile(path.join(out, `${study}-${theme}-worst.png`), Buffer.from(worstFrame.split(",")[1], "base64"));
      assert.ok(result.frames >= 50, `${study}: need dense frame coverage, got ${result.frames}`);
      assert.equal(result.finished, 1, `${study}: capture the settled reference`);
      assert.ok(result.coverage > 0.005 && result.coverage < 0.4, `${study}: the reference must contain ink and unpainted space`);
      const outside = Math.max(...result.measurements.map((m) => m.outside));
      const erased = Math.max(...result.measurements.map((m) => m.erased));
      const stray = result.measurements.filter((m) => m.fragments > (study === "speak" && m.progress >= 0.73 ? 2 : 1));
      if (outside > 4) failures.push(`${study}/${theme}: ${outside} pixels escaped the finished silhouette`);
      if (erased > 8) failures.push(`${study}/${theme}: ${erased} opaque pixels disappeared between frames`);
      if (stray.length) failures.push(`${study}/${theme}: ${stray.length} frames contained detached fragments`);
      console.log(`${study}/${theme}: ${result.frames} frames, ${outside} stray pixels, ${erased} erased pixels, ${stray.length} fragmented frames`);
    }
    await page.close();
  }
  assert.deepEqual(errors, [], "No browser or shader errors");
  assert.deepEqual(failures, [], "Ink should reveal continuously without spikes, fragments, or erasing drawn strokes");
  console.log(`PASS: frame-by-frame ink reveals; evidence: ${out}`);
} finally {
  await browser.close();
}
