import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const ARTIFACTS_DIR = "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529";
const outDir = path.join(ARTIFACTS_DIR, "candidates");
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

  const candidates = [
    { id: "rest", type: "express", key: "rest", label: "The Socratic Teardrop (Rest)", kin: "respiration" },
    { id: "question", type: "sculpt", key: "question_aperture", label: "The Question Aperture", kin: "serpentine" },
    { id: "aporia", type: "sculpt", key: "aporia", label: "The Aporia Knot", kin: "pulse" },
    { id: "iris", type: "sculpt", key: "maieutic_iris", label: "The Maieutic Iris", kin: "vortex" },
    { id: "nib", type: "sculpt", key: "quill", label: "The Dipped Nib", kin: "none" },
    { id: "bridge", type: "sculpt", key: "synaptic_bridge", label: "The Synaptic Bridge", kin: "stokes-bridge" },
    { id: "balance", type: "sculpt", key: "balance", label: "The Dialectic Balance", kin: "none" },
    { id: "codex", type: "sculpt", key: "codex", label: "The Living Codex", kin: "respiration" },
  ];

  for (const c of candidates) {
    console.log(`Rendering ${c.id}: ${c.label}...`);
    if (c.type === "express") {
      await page.evaluate((key) => window.socratinkInk.call("ink_express", { expression: key }), c.key);
    } else {
      await page.evaluate((key) => window.socratinkInk.call("ink_sculpt", { concept: key }), c.key);
    }

    // Wait for transition to settle
    await page.waitForTimeout(1400);

    // Capture resting screenshot
    const res = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
    if (res && res.ok && res.image) {
      const base64Data = res.image.replace(/^data:image\/png;base64,/, "");
      await fs.writeFile(path.join(outDir, `${c.id}.png`), base64Data, "base64");
      console.log(`Saved ${c.id}.png`);
    }
  }

  console.log("All candidate images captured successfully!");
} finally {
  await browser.close();
}
