import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://127.0.0.1:3001";
const out = path.resolve(
  process.env.INK_ARTIFACTS ||
    "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529",
);
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 2,
});

const call = (name, args = {}) =>
  page.evaluate(({ name, args }) => window.socratinkInk?.call(name, args), {
    name,
    args,
  });

const ready = () =>
  page.waitForFunction(
    () => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready,
  );

const settled = () =>
  page.waitForFunction(
    () => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning,
  );

try {
  console.log("1. Navigating to /ink-lab-v2...");
  await page.goto(`${url}/ink-lab-v2`, { waitUntil: "networkidle" });
  await ready();
  await settled();

  // Baseline 0: Current Legacy 2D Question Mark
  console.log("2. Capturing Legacy 2D Question Mark...");
  await call("ink_express", { expression: "question" });
  await settled();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "workshop_question_0_legacy.png") });

  // Candidate 1: Calligraphic 3D Question Sweep
  console.log("3. Capturing Candidate 1: Calligraphic 3D Question Sweep...");
  await call("ink_sculpt", { concept: "question_sweep", blend: 0.16 });
  await settled();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "workshop_question_1_sweep.png") });

  // Candidate 2: Maieutic Aperture (Iris)
  console.log("4. Capturing Candidate 2: Maieutic Aperture (Iris)...");
  await call("ink_sculpt", { concept: "maieutic_iris", blend: 0.20 });
  await settled();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "workshop_question_2_iris.png") });

  // Candidate 3: Inquisitive Monocle (Loop)
  console.log("5. Capturing Candidate 3: Inquisitive Monocle (Loop)...");
  await call("ink_sculpt", { concept: "inquiry_loop", blend: 0.17 });
  await settled();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "workshop_question_3_loop.png") });

  // Also capture with pointer interaction (tilt / angle highlights)
  console.log("6. Capturing Candidate 1 with 3D pointer parallax tilt...");
  await call("ink_sculpt", { concept: "question_sweep", blend: 0.16 });
  await settled();
  // Move mouse over canvas to tilt 3D perspective and catch specular glint
  const stage = await page.$(".ink-lab-stage");
  if (stage) {
    const box = await stage.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.35);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, "workshop_question_1_sweep_tilted.png") });
    }
  }

  console.log("SUCCESS: All question aperture candidates captured!");
} catch (err) {
  console.error("Workshop script failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
