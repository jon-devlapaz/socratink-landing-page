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

  // Key V2
  const R_bow = 0.22;
  const r_bow = 0.055;
  const bowCenter = [0, 0.44];
  const keyStrokes = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (i * Math.PI) / 3;
    const a2 = ((i + 1) * Math.PI) / 3;
    keyStrokes.push({
      from: [bowCenter[0] + R_bow * Math.cos(a1), bowCenter[1] + R_bow * Math.sin(a1), 0],
      to: [bowCenter[0] + R_bow * Math.cos(a2), bowCenter[1] + R_bow * Math.sin(a2), 0],
      radius: r_bow,
      label: `bow-${i}`,
    });
  }
  // Shaft
  keyStrokes.push({
    from: [0, 0.20, 0],
    to: [0, -0.62, 0],
    radius: 0.065,
    label: "shaft",
  });
  // Upper tooth
  keyStrokes.push({
    from: [0, -0.36, 0],
    to: [0.22, -0.36, 0],
    radius: 0.055,
    label: "tooth-1",
  });
  // Lower tooth
  keyStrokes.push({
    from: [0, -0.54, 0],
    to: [0.26, -0.54, 0],
    radius: 0.055,
    label: "tooth-2",
  });
  // Tooth link
  keyStrokes.push({
    from: [0.22, -0.36, 0],
    to: [0.22, -0.46, 0],
    radius: 0.05,
    label: "tooth-link",
  });

  const keyBeads = [
    { center: [0, 0.18, 0], radius: 0.085, label: "collar" },
    { center: [0, -0.64, 0], radius: 0.075, label: "tip" },
    { center: [0.26, -0.54, 0], radius: 0.06, label: "tooth-tip" },
  ];

  const sculpt = { concept: "Key V2", blend: 0.10, strokes: keyStrokes, beads: keyBeads };
  await page.evaluate((s) => window.socratinkInk.call("ink_sculpt", s), sculpt);
  await page.waitForTimeout(1600);
  const res = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
  if (res?.ok && res.image) {
    const b64 = res.image.replace(/^data:image\/png;base64,/, "");
    await fs.writeFile(path.join(outDir, "key_v2.png"), b64, "base64");
    console.log("Saved key_v2.png");
  }
} finally {
  await browser.close();
}
