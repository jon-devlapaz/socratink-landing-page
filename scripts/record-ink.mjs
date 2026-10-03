/** Record actual WebGL frames against the paper token. Requires local ffmpeg. */
import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chapterRange, scrollChapter, settledScroll, drawWithScroll } from "./lib/ink-scroll.mjs";

const url = process.env.INK_URL || "http://localhost:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || path.join(os.tmpdir(), "socratink-ink-recordings"));
const theme = process.env.INK_THEME || "light";
const studies = (process.env.INK_STUDIES || "map,speak,teacher,hero").split(",");
const tracks = { map: "how", speak: "speak", teacher: "keep" };
assertInputs();
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || (os.platform() === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome"),
  headless: true,
  args: os.platform() === "darwin" ? ["--use-gl=angle", "--use-angle=metal"] : ["--no-sandbox"],
});

function assertInputs() {
  if (!["light", "dark"].includes(theme)) throw new Error("INK_THEME must be light or dark");
  if (studies.some((study) => !["map", "speak", "teacher", "hero"].includes(study))) throw new Error("Unknown INK_STUDIES entry");
}

try {
  for (const study of studies) {
    const framesDir = path.join(out, `${study}-${theme}-frames`);
    await fs.mkdir(framesDir, { recursive: true });
    const frames = [];
    const writes = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: theme });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.exposeFunction("saveInkFrame", (time, png) => {
      const file = path.join(framesDir, `${String(frames.length).padStart(5, "0")}.png`);
      frames.push({ time, file });
      writes.push(fs.writeFile(file, Buffer.from(png.split(",")[1], "base64")));
    });
    await page.addInitScript(({ theme, study }) => {
      localStorage.setItem("socratink-theme", theme);
      const selector = study === "hero" ? ".ink-render canvas" : `[data-study="${study}"] canvas`;
      const copy = document.createElement("canvas");
      const ctx = copy.getContext("2d");
      let drawn = null;
      for (const method of ["drawArrays", "drawElements"]) {
        const draw = WebGL2RenderingContext.prototype[method];
        WebGL2RenderingContext.prototype[method] = function (...args) {
          const result = draw.apply(this, args);
          if (this.canvas instanceof HTMLCanvasElement && this.canvas.matches(selector)) drawn = this.canvas;
          return result;
        };
      }
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) => raf((time) => {
        callback(time);
        if (!drawn) return;
        copy.width = drawn.width;
        copy.height = drawn.height;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
        ctx.fillRect(0, 0, copy.width, copy.height);
        ctx.drawImage(drawn, 0, 0);
        // The buffer is only valid until compositing; capture in the same frame.
        window.saveInkFrame(time, copy.toDataURL("image/png"));
        drawn = null;
      });
    }, { theme, study });
    await page.goto(url, { waitUntil: "networkidle" });
    if (study === "hero") {
      await page.waitForTimeout(66000);
    } else {
      const range = await chapterRange(page, tracks[study], study);
      await scrollChapter(page, range, 0);
      await settledScroll(page, study);
      await drawWithScroll(page, range, study === "teacher" ? 2200 : 4200);
      await settledScroll(page, study);
      await page.waitForFunction((study) => document.querySelector(`[data-study="${study}"]`)?.dataset.inkEntrance === "settled", study);
      await page.waitForTimeout(1200);
    }
    await page.close();
    await Promise.all(writes);
    if (errors.length) throw new Error(errors.join("\n"));
    if (frames.length < 2) throw new Error(`No animation frames captured for ${study}`);
    const list = frames.map((frame, index) => {
      const seconds = index + 1 < frames.length ? Math.max(1 / 120, (frames[index + 1].time - frame.time) / 1000) : 1.2;
      return `file '${frame.file.replaceAll("'", "'\\''")}'\noption framerate 1000\nduration ${seconds}\n`;
    }).join("") + `file '${frames.at(-1).file.replaceAll("'", "'\\''")}'\noption framerate 1000\n`;
    const manifest = path.join(framesDir, "frames.ffconcat");
    await fs.writeFile(manifest, list);
    const video = path.join(out, `${study}-${theme}.mp4`);
    execFileSync(process.env.FFMPEG_PATH || "ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", manifest,
      "-vf", "fps=60,scale=iw*2:ih*2:flags=lanczos", "-c:v", "libx264", "-crf", "16",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", video,
    ]);
    console.log(`${study}: ${frames.length} frames → ${video}`);
  }
} finally {
  await browser.close();
}
