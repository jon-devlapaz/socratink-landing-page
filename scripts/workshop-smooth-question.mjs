import fs from "node:fs/promises";
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

// Let us test several spline formulations:
// Variant 1: 9-point Catmull-Rom smoothed spine (8 segments, 1 bead) with blend 0.16
// Variant 2: 9-point spline with blend 0.20
// Variant 3: 11-point spline with blend 0.18
// Variant 4: Pure 6-point optimized minimal-kink spine

const candidates = [
  {
    id: "smooth_v1_8seg_k16",
    blend: 0.16,
    strokes: [
      { from: [-0.32, 0.38, -0.04], to: [-0.24, 0.56, -0.02], radius: 0.090 },
      { from: [-0.24, 0.56, -0.02], to: [-0.08, 0.69,  0.02], radius: 0.120 },
      { from: [-0.08, 0.69,  0.02], to: [ 0.12, 0.71,  0.05], radius: 0.135 },
      { from: [ 0.12, 0.71,  0.05], to: [ 0.32, 0.58,  0.06], radius: 0.125 },
      { from: [ 0.32, 0.58,  0.06], to: [ 0.38, 0.38,  0.04], radius: 0.105 },
      { from: [ 0.38, 0.38,  0.04], to: [ 0.24, 0.18,  0.01], radius: 0.088 },
      { from: [ 0.24, 0.18,  0.01], to: [ 0.08, 0.00, -0.02], radius: 0.075 },
      { from: [ 0.08, 0.00, -0.02], to: [ 0.01, -0.26, -0.01], radius: 0.060 },
    ],
    beads: [
      { center: [0.0, -0.66, 0.0], radius: 0.138, label: "droplet" }
    ]
  },
  {
    id: "smooth_v2_8seg_k20",
    blend: 0.20,
    strokes: [
      { from: [-0.32, 0.38, -0.04], to: [-0.24, 0.56, -0.02], radius: 0.090 },
      { from: [-0.24, 0.56, -0.02], to: [-0.08, 0.69,  0.02], radius: 0.120 },
      { from: [-0.08, 0.69,  0.02], to: [ 0.12, 0.71,  0.05], radius: 0.135 },
      { from: [ 0.12, 0.71,  0.05], to: [ 0.32, 0.58,  0.06], radius: 0.125 },
      { from: [ 0.32, 0.58,  0.06], to: [ 0.38, 0.38,  0.04], radius: 0.105 },
      { from: [ 0.38, 0.38,  0.04], to: [ 0.24, 0.18,  0.01], radius: 0.088 },
      { from: [ 0.24, 0.18,  0.01], to: [ 0.08, 0.00, -0.02], radius: 0.075 },
      { from: [ 0.08, 0.00, -0.02], to: [ 0.01, -0.26, -0.01], radius: 0.060 },
    ],
    beads: [
      { center: [0.0, -0.66, 0.0], radius: 0.138, label: "droplet" }
    ]
  },
  {
    id: "smooth_v3_10seg_k18",
    blend: 0.18,
    strokes: [
      { from: [-0.30, 0.36, -0.04], to: [-0.26, 0.50, -0.02], radius: 0.085 },
      { from: [-0.26, 0.50, -0.02], to: [-0.14, 0.64,  0.01], radius: 0.110 },
      { from: [-0.14, 0.64,  0.01], to: [ 0.02, 0.72,  0.04], radius: 0.135 },
      { from: [ 0.02, 0.72,  0.04], to: [ 0.20, 0.68,  0.06], radius: 0.135 },
      { from: [ 0.20, 0.68,  0.06], to: [ 0.35, 0.54,  0.05], radius: 0.120 },
      { from: [ 0.35, 0.54,  0.05], to: [ 0.38, 0.35,  0.03], radius: 0.100 },
      { from: [ 0.38, 0.35,  0.03], to: [ 0.26, 0.18,  0.01], radius: 0.085 },
      { from: [ 0.26, 0.18,  0.01], to: [ 0.12, 0.04, -0.01], radius: 0.075 },
      { from: [ 0.12, 0.04, -0.01], to: [ 0.03, -0.12, -0.02], radius: 0.068 },
      { from: [ 0.03, -0.12, -0.02], to: [ 0.00, -0.27, -0.01], radius: 0.058 },
    ],
    beads: [
      { center: [0.0, -0.66, 0.0], radius: 0.138, label: "droplet" }
    ]
  }
];

for (const c of candidates) {
  console.log(`Rendering candidate ${c.id}...`);
  await page.evaluate(({ strokes, beads, blend }) => {
    window.socratinkInk?.call("ink_sculpt", {
      concept: "Question Smooth",
      strokes,
      beads,
      blend
    });
  }, c);
  await page.waitForFunction(() => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, `${c.id}.png`) });
}

await browser.close();
console.log("Finished smooth rendering!");
