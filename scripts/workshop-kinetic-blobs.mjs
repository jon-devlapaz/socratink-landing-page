import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outDir = "/Users/jondev/.gemini/antigravity/brain/5b23e982-da42-4327-8a79-9cc7edf11d6c/kinetic";
await fs.mkdir(outDir, { recursive: true });

const part = (position, scale, shape = "sphere", rotation = [0, 0, 0]) => ({
  shape,
  operation: "union",
  position,
  scale,
  rotation,
});

const base = {
  version: 1,
  blend: 0.35,
  material: { color: "#060709", roughness: 0.14, metalness: 0.16 },
  motion: { speed: 0.35, amplitude: 0.04, pointer: 0.15 },
};

const candidates = [
  {
    id: "kinetic_lotus",
    title: "The Breathing Lotus",
    subtitle: "Pulmonary Respiration Bloom",
    ethos: "Living pulmonary rhythm: obsidian core inhales and elevates while 5 symmetrical fluid petals blossom outward in harmonic breath.",
    scene: {
      ...base,
      name: "Breathing Lotus",
      blend: 0.32,
      material: { color: "#060709", roughness: 0.13, metalness: 0.16 },
      motion: { speed: 0.35, amplitude: 0.032, pointer: 0.15 },
      kinematics: "respiration",
      parts: [
        part([0, 0, 0], [1.38, 1.38, 1.38], "sphere"),
        part([0, 0.72, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 0]),
        part([0.68, 0.22, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, -72]),
        part([0.42, -0.58, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, -144]),
        part([-0.42, -0.58, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 144]),
        part([-0.68, 0.22, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 72]),
      ],
    },
  },
  {
    id: "kinetic_vortex",
    title: "The Celestial Gyre",
    subtitle: "Liquid Obsidian Whirlpool",
    ethos: "Fluid vorticity around an inclined precession axis. Molten obsidian droplets swirl with Keplerian angular velocity, tracing continuous glistening specular streaks.",
    scene: {
      ...base,
      name: "Celestial Gyre",
      blend: 0.36,
      material: { color: "#050608", roughness: 0.13, metalness: 0.20 },
      motion: { speed: 0.42, amplitude: 0.045, pointer: 0.16 },
      kinematics: "vortex",
      parts: [
        part([0, 0, 0], [1.25, 1.25, 1.25], "sphere"),
        part([0.33, 0.58, 0], [0.52, 0.52, 0.52], "sphere"),
        part([-0.40, 0.68, 0], [0.48, 0.48, 0.48], "sphere"),
        part([-0.91, -0.01, 0], [0.44, 0.44, 0.44], "sphere"),
        part([-0.51, -0.90, 0], [0.40, 0.40, 0.40], "sphere"),
        part([0.56, -1.00, 0], [0.36, 0.36, 0.36], "sphere"),
        part([1.27, -0.02, 0], [0.32, 0.32, 0.32], "sphere"),
      ],
    },
  },
  {
    id: "kinetic_systole",
    title: "The Living Systole",
    subtitle: "Capillary Cardiovascular Pulse",
    ethos: "A palpable, beating cardiovascular pulse in pure obsidian ink. Strict volume conservation: vertical compression induces equatorial fluid bulge as the crown droplet bounces in anti-phase.",
    scene: {
      ...base,
      name: "Living Systole",
      blend: 0.34,
      material: { color: "#07080a", roughness: 0.14, metalness: 0.18 },
      motion: { speed: 0.38, amplitude: 0.042, pointer: 0.12 },
      kinematics: "pulse",
      parts: [
        part([0, -0.22, 0], [1.54, 1.62, 1.54], "capsule"),
        part([0, 0.72, 0.05], [0.46, 0.62, 0.46], "capsule"),
        part([0.62, -0.15, 0.05], [0.38, 0.38, 0.38], "sphere"),
        part([-0.62, -0.15, 0.05], [0.38, 0.38, 0.38], "sphere"),
      ],
    },
  },
  {
    id: "kinetic_serpentine",
    title: "The Calligraphic Wave",
    subtitle: "Undulating Silk S-Curve",
    ethos: "A continuous traveling sine wave propagating through a chain of fluid capsules, swimming like black silk ribbon through deep water.",
    scene: {
      ...base,
      name: "Calligraphic Wave",
      blend: 0.35,
      material: { color: "#060709", roughness: 0.12, metalness: 0.22 },
      motion: { speed: 0.40, amplitude: 0.038, pointer: 0.25 },
      kinematics: "serpentine",
      parts: [
        part([-0.38, 0.62, 0], [0.55, 1.05, 0.55], "capsule", [0, 0, -32]),
        part([0.05, 0.32, 0.05], [0.52, 1.15, 0.52], "capsule", [0, 0, 24]),
        part([0.36, -0.05, 0], [0.48, 1.10, 0.48], "capsule", [0, 0, -22]),
        part([0.10, -0.42, -0.05], [0.42, 1.05, 0.42], "capsule", [0, 0, 35]),
        part([-0.28, -0.72, 0], [0.32, 0.75, 0.32], "capsule", [0, 0, -45]),
      ],
    },
  },
];

console.log(`Starting kinetic workshop rendering into: ${outDir}`);

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

for (const candidate of candidates) {
  console.log(`Rendering ${candidate.title}...`);

  const setRes = await page.evaluate((sc) => window.socratinkInk.call("ink_set_scene", { scene: sc }), candidate.scene);
  if (!setRes.ok) throw new Error(`Failed to set scene: ${setRes.error}`);

  // Let the form settle and run through dynamic kinematics
  await page.waitForFunction(() => !window.socratinkInk.call("ink_get_scene").rendering.transitioning);
  await delay(1200);

  // Capture primary frame
  const cap1 = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
  const filepath1 = path.join(outDir, `${candidate.id}_frame1.png`);
  await fs.writeFile(filepath1, Buffer.from(cap1.image.replace(/^data:image\/png;base64,/, ""), "base64"));

  // Advance time during motion
  await delay(900);
  const cap2 = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
  const filepath2 = path.join(outDir, `${candidate.id}_frame2.png`);
  await fs.writeFile(filepath2, Buffer.from(cap2.image.replace(/^data:image\/png;base64,/, ""), "base64"));

  console.log(`Captured frames for ${candidate.title}: ${filepath1} & ${filepath2}`);
}

await browser.close();
console.log("All kinetic candidates successfully rendered and saved!");
