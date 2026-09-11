import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const ARTIFACTS_DIR = "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529";
const outDir = path.join(ARTIFACTS_DIR, "emojis");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 2,
});

try {
  await page.goto("http://127.0.0.1:3001/ink-lab-v2", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // 1. Lightbulb V3: with iconic radiant rays!
  const bulbStrokes = [
    // 3 Radiant rays shining out of the bulb
    { from: [0, 0.65, 0], to: [0, 0.82, 0], radius: 0.045, label: "ray-top" },
    { from: [-0.40, 0.50, 0], to: [-0.55, 0.65, 0], radius: 0.045, label: "ray-tl" },
    { from: [0.40, 0.50, 0], to: [0.55, 0.65, 0], radius: 0.045, label: "ray-tr" },
    // Tapering neck
    { from: [-0.18, 0.02, 0], to: [-0.11, -0.18, 0], radius: 0.075, label: "neck-l" },
    { from: [0.18, 0.02, 0], to: [0.11, -0.18, 0], radius: 0.075, label: "neck-r" },
    // Screw plinths
    { from: [-0.14, -0.24, 0], to: [0.14, -0.24, 0], radius: 0.065, label: "plinth-1" },
    { from: [-0.11, -0.34, 0], to: [0.11, -0.34, 0], radius: 0.06, label: "plinth-2" },
  ];
  const bulbBeads = [
    { center: [0, 0.22, 0], radius: 0.33, label: "glass-dome" },
    { center: [0, -0.44, 0], radius: 0.055, label: "contact" },
  ];

  // 2. Lightning Bolt V3: real dramatic zig-zag
  const boltStrokes = [
    // Upper wide blade
    { from: [0.22, 0.70, 0], to: [-0.18, 0.12, 0], radius: 0.10, label: "upper-blade" },
    // Long horizontal shelf cutting back across
    { from: [-0.22, 0.12, 0], to: [0.18, 0.12, 0], radius: 0.08, label: "mid-shelf" },
    // Lower descending spear
    { from: [0.18, 0.12, 0], to: [-0.14, -0.68, 0], radius: 0.075, label: "lower-blade" },
    { from: [-0.14, -0.68, 0], to: [-0.18, -0.80, 0], radius: 0.035, label: "spear-tip" },
  ];
  const boltBeads = [
    { center: [0.24, 0.74, 0], radius: 0.085, label: "top-crown" },
    { center: [-0.20, 0.12, 0], radius: 0.09, label: "left-elbow" },
    { center: [0.18, 0.12, 0], radius: 0.085, label: "right-elbow" },
  ];

  // 3. Target V3: cleaner 8-segment ring with arrow fletching and bullseye
  const R_out = 0.56;
  const r_out = 0.06;
  const targetStrokes = [];
  for (let i = 0; i < 8; i++) {
    const a1 = (i * Math.PI) / 4;
    const a2 = ((i + 1) * Math.PI) / 4;
    targetStrokes.push({
      from: [R_out * Math.cos(a1), R_out * Math.sin(a1), 0],
      to: [R_out * Math.cos(a2), R_out * Math.sin(a2), 0],
      radius: r_out,
      label: `ring-${i}`,
    });
  }
  targetStrokes.push({
    from: [0.60, 0.60, 0.08],
    to: [0.08, 0.08, 0.02],
    radius: 0.042,
    label: "arrow-shaft",
  });
  targetStrokes.push({
    from: [0.55, 0.55, 0.08],
    to: [0.70, 0.62, 0.14],
    radius: 0.035,
    label: "arrow-vane1",
  });
  targetStrokes.push({
    from: [0.55, 0.55, 0.08],
    to: [0.62, 0.70, 0.14],
    radius: 0.035,
    label: "arrow-vane2",
  });
  const targetBeads = [
    { center: [0, 0, 0], radius: 0.18, label: "bullseye" },
  ];

  const tests = [
    { id: "lightbulb_v3", sculpt: { concept: "Lightbulb V3", blend: 0.11, strokes: bulbStrokes, beads: bulbBeads } },
    { id: "bolt_v3", sculpt: { concept: "Bolt V3", blend: 0.08, strokes: boltStrokes, beads: boltBeads } },
    { id: "target_v3", sculpt: { concept: "Target V3", blend: 0.10, strokes: targetStrokes, beads: targetBeads } },
  ];

  for (const t of tests) {
    console.log(`Rendering ${t.id}...`);
    await page.evaluate((sculpt) => window.socratinkInk.call("ink_sculpt", sculpt), t.sculpt);
    await page.waitForTimeout(1600);
    const res = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
    if (res?.ok && res.image) {
      const b64 = res.image.replace(/^data:image\/png;base64,/, "");
      await fs.writeFile(path.join(outDir, `${t.id}.png`), b64, "base64");
      console.log(`Saved ${t.id}.png`);
    }
  }

  console.log("V3 renders complete!");
} finally {
  await browser.close();
}
