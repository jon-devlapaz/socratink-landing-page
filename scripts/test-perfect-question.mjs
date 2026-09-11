import path from "node:path";
import { chromium } from "playwright-core";

const out = "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 2,
});

await page.goto("http://127.0.0.1:3001/ink-lab-v2", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready);
await page.evaluate(() => window.socratinkInk?.call("ink_control", { resolution: 1.0 }));

const vertices = [
  [-0.32,  0.38, -0.04, 0.082],
  [-0.26,  0.54, -0.01, 0.105],
  [-0.12,  0.68,  0.03, 0.130],
  [ 0.06,  0.72,  0.05, 0.142],
  [ 0.26,  0.64,  0.06, 0.132],
  [ 0.38,  0.48,  0.05, 0.118],
  [ 0.36,  0.32,  0.03, 0.102],
  [ 0.24,  0.18,  0.01, 0.088],
  [ 0.12,  0.04, -0.01, 0.076],
  [ 0.04, -0.12, -0.02, 0.068],
  [ 0.00, -0.27, -0.01, 0.056],
];

const strokes = [];
for (let i = 0; i < vertices.length - 1; i++) {
  const v1 = vertices[i];
  const v2 = vertices[i + 1];
  // stroke radius is average or target
  const r = (v1[3] + v2[3]) / 2;
  strokes.push({
    from: [v1[0], v1[1], v1[2]],
    to: [v2[0], v2[1], v2[2]],
    radius: r,
    label: `seg-${i}`
  });
}

const beads = [
  { center: [0.0, -0.66, 0.0], radius: 0.138, label: "nucleus-droplet" }
];

// Test blend = 0.18
console.log("Rendering perfect question (blend 0.18)...");
await page.evaluate(({ strokes, beads }) => {
  window.socratinkInk?.call("ink_sculpt", {
    concept: "Question Perfect",
    strokes,
    beads,
    blend: 0.18
  });
}, { strokes, beads });

await page.waitForFunction(() => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "perfect_question_k18.png") });

// Test blend = 0.21
console.log("Rendering perfect question (blend 0.21)...");
await page.evaluate(({ strokes, beads }) => {
  window.socratinkInk?.call("ink_sculpt", {
    concept: "Question Perfect",
    strokes,
    beads,
    blend: 0.21
  });
}, { strokes, beads });

await page.waitForFunction(() => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "perfect_question_k21.png") });

await browser.close();
console.log("Done test-perfect-question!");
