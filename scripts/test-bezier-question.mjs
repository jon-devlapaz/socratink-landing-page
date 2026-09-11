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

// Mathematical C1 Bezier spline with continuous radius profile
const points = [
  [-0.300,  0.380, -0.040, 0.082],
  [-0.224,  0.562, -0.007, 0.108],
  [-0.060,  0.652,  0.019, 0.134],
  [ 0.129,  0.649,  0.036, 0.136],
  [ 0.283,  0.552,  0.040, 0.122],
  [ 0.340,  0.360,  0.030, 0.106],
  [ 0.303,  0.215,  0.018, 0.090],
  [ 0.226,  0.101,  0.007, 0.078],
  [ 0.133, -0.003, -0.002, 0.068],
  [ 0.049, -0.120, -0.008, 0.060],
  [ 0.000, -0.270, -0.010, 0.052],
];

const strokes = [];
for (let i = 0; i < points.length - 1; i++) {
  const p1 = points[i];
  const p2 = points[i + 1];
  const r = (p1[3] + p2[3]) / 2;
  strokes.push({
    from: [Number(p1[0].toFixed(3)), Number(p1[1].toFixed(3)), Number(p1[2].toFixed(3))],
    to: [Number(p2[0].toFixed(3)), Number(p2[1].toFixed(3)), Number(p2[2].toFixed(3))],
    radius: Number(r.toFixed(3)),
    label: `arc-${i}`
  });
}

const beads = [
  { center: [0.0, -0.66, 0.0], radius: 0.138, label: "nucleus-droplet" }
];

console.log("Rendering C1 Bezier question...");
await page.evaluate(({ strokes, beads }) => {
  window.socratinkInk?.call("ink_sculpt", {
    concept: "C1 Bezier Question",
    strokes,
    beads,
    blend: 0.19
  });
}, { strokes, beads });

await page.waitForFunction(() => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, "bezier_question_k19.png") });

await browser.close();
console.log("Done test-bezier-question!");
