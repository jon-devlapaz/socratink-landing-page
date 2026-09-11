import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outDir = "/Users/jondev/.gemini/antigravity/brain/5b23e982-da42-4327-8a79-9cc7edf11d6c/gyre";
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1200, height: 1200 },
  deviceScaleFactor: 2,
});

await page.goto("http://127.0.0.1:3001/ink-lab");
await page.waitForFunction(() => window.socratinkInk?.call("ink_get_scene").rendering?.ready);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("Setting Celestial Gyre preset...");

// Read current vortex from preset
const part = (position, scale, shape = "sphere", rotation = [0, 0, 0]) => ({
  shape,
  operation: "union",
  position,
  scale,
  rotation,
});

const vortexScene = {
  version: 1,
  name: "Celestial Gyre",
  blend: 0.38,
  material: { color: "#050608", roughness: 0.13, metalness: 0.20 },
  motion: { speed: 0.44, amplitude: 0.045, pointer: 0.28 },
  kinematics: "vortex",
  parts: [
    part([0, 0, 0], [1.26, 1.26, 1.26], "sphere"),
    part([0.33, 0.55, 0], [0.42, 0.72, 0.42], "capsule"),
    part([-0.40, 0.65, 0], [0.38, 0.68, 0.38], "capsule"),
    part([-0.86, -0.01, 0], [0.35, 0.62, 0.35], "capsule"),
    part([-0.50, -0.85, 0], [0.32, 0.56, 0.32], "capsule"),
    part([0.55, -0.95, 0], [0.28, 0.52, 0.28], "capsule"),
    part([1.22, -0.02, 0], [0.24, 0.46, 0.24], "capsule"),
  ],
};

await page.evaluate((sc) => window.socratinkInk.call("ink_set_scene", { scene: sc }), vortexScene);
await page.waitForFunction(() => !window.socratinkInk.call("ink_get_scene").rendering.transitioning);

// 1. Ambient capture (no mouse interaction)
await delay(1200);
const capAmbient = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
const pathAmbient = path.join(outDir, "gyre_streamers_ambient.png");
await fs.writeFile(pathAmbient, Buffer.from(capAmbient.image.replace(/^data:image\/png;base64,/, ""), "base64"));
console.log(`Saved ambient streamers: ${pathAmbient}`);

// 2. Interactive hover capture: dispatch pointermove over the canvas element
const canvasBox = await page.locator(".ink-render canvas").boundingBox();
if (canvasBox) {
  // Move pointer toward upper right (accelerates spin, contracts disk, tilts plane)
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.8, canvasBox.y + canvasBox.height * 0.25);
  await delay(1000);
}

const capInteractive = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
const pathInteractive = path.join(outDir, "gyre_interactive_pull.png");
await fs.writeFile(pathInteractive, Buffer.from(capInteractive.image.replace(/^data:image\/png;base64,/, ""), "base64"));
console.log(`Saved interactive gravitational pull: ${pathInteractive}`);

await browser.close();
console.log("Gyre captures complete!");
