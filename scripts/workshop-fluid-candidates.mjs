import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outDir = "/Users/jondev/.gemini/antigravity/brain/5b23e982-da42-4327-8a79-9cc7edf11d6c/workshop";
await fs.mkdir(outDir, { recursive: true });

const part = (position, scale, shape = "sphere", rotation = [0, 0, 0]) => ({
  shape,
  operation: "union",
  position,
  scale,
  rotation,
});

const candidates = [
  {
    id: "candidate_a_breathing_meniscus",
    badge: "Candidate A",
    title: "The Breathing Meniscus",
    subtitle: "Poised Obsidian Droplet",
    ethos: "Serene, meditative presence. Monolithic circular contour with microscopic vertical gravity aspect, breathing in a slow harmonic rhythm.",
    scene: {
      version: 1,
      name: "The Breathing Meniscus",
      blend: 0.38,
      material: { color: "#060709", roughness: 0.13, metalness: 0.16 },
      motion: { speed: 0.22, amplitude: 0.018, pointer: 0.12 },
      parts: [
        part([0, -0.05, 0], [1.68, 1.76, 1.68], "capsule"),
        part([0, 0.42, 0], [1.12, 1.12, 1.12], "sphere"),
      ],
    },
  },
  {
    id: "candidate_b_submerged_vorticity",
    badge: "Candidate B",
    title: "Submerged Vorticity Core",
    subtitle: "Sub-surface Capillary Currents",
    ethos: "Preserves the clean circular silhouette of the Socratink logo dot, but conceals submerged orbital micro-nodes that ripple specular reflections across the liquid skin.",
    scene: {
      version: 1,
      name: "Submerged Vorticity Core",
      blend: 0.52,
      material: { color: "#050608", roughness: 0.12, metalness: 0.18 },
      motion: { speed: 0.38, amplitude: 0.038, pointer: 0.16 },
      parts: [
        part([0, 0, 0], [1.60, 1.60, 1.60], "sphere"),
        part([0.18, 0.20, 0.10], [0.42, 0.42, 0.42], "sphere"),
        part([-0.20, -0.16, 0.08], [0.38, 0.38, 0.38], "sphere"),
        part([0.08, -0.18, -0.14], [0.44, 0.44, 0.44], "sphere"),
        part([-0.12, 0.26, -0.08], [0.32, 0.32, 0.32], "sphere"),
      ],
    },
  },
  {
    id: "candidate_c_magnetic_ferrofluid",
    badge: "Candidate C",
    title: "Magnetic Ferrofluid Nib",
    subtitle: "Attentive Tapered Crest",
    ethos: "Dynamic, alert, and receptive. Features an asymmetrical calligraphic stylus with a hovering satellite micro-droplet, leaning eagerly toward cursor interactions.",
    scene: {
      version: 1,
      name: "Magnetic Ferrofluid Nib",
      blend: 0.28,
      material: { color: "#07080b", roughness: 0.15, metalness: 0.28 },
      motion: { speed: 0.36, amplitude: 0.026, pointer: 0.38 },
      parts: [
        part([0, -0.28, 0], [1.45, 1.45, 1.45], "sphere"),
        part([0.10, 0.18, 0.05], [0.72, 1.25, 0.72], "capsule", [0, 0, -18]),
        part([0.26, 0.72, 0.08], [0.36, 0.85, 0.36], "capsule", [0, 0, -28]),
        part([0.42, 1.15, 0.12], [0.18, 0.18, 0.18], "sphere"),
      ],
    },
  },
  {
    id: "candidate_d_synaptic_coalescence",
    badge: "Candidate D",
    title: "Synaptic Coalescence",
    subtitle: "Stokes Liquid Bridge Deliberation",
    ethos: "The embodiment of active learning and reasoning: opposing binary lobes engaged in a capillary tug-of-war across an anti-phase stretching fluid waist.",
    scene: {
      version: 1,
      name: "Synaptic Coalescence",
      blend: 0.24,
      material: { color: "#060709", roughness: 0.14, metalness: 0.16 },
      motion: { speed: 0.65, amplitude: 0.055, pointer: 0.06 },
      kinematics: "stokes-bridge",
      parts: [
        part([-0.52, -0.06, 0], [0.98, 1.18, 0.98], "capsule", [0, 0, 16]),
        part([0.52, 0.08, 0], [0.92, 1.12, 0.92], "capsule", [0, 0, -20]),
        part([0, 0.02, 0], [0.28, 1.05, 0.28], "capsule", [0, 0, 78]),
        part([0.06, 0.68, 0.10], [0.24, 0.36, 0.24], "capsule", [0, 0, 30]),
      ],
    },
  },
];

console.log(`Starting fluid candidates workshop rendering into: ${outDir}`);

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

const results = [];

for (const candidate of candidates) {
  console.log(`Rendering ${candidate.badge}: ${candidate.title}...`);
  
  // Set candidate scene
  const setRes = await page.evaluate((sc) => window.socratinkInk.call("ink_set_scene", { scene: sc }), candidate.scene);
  if (!setRes.ok) {
    throw new Error(`Failed to set scene for ${candidate.id}: ${setRes.error}`);
  }

  // Wait for transition to settle
  await page.waitForFunction(() => !window.socratinkInk.call("ink_get_scene").rendering.transitioning);
  // Allow animation cycle to breathe for a moment
  await delay(800);

  // Capture high-res PNG
  const captureRes = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
  if (!captureRes.ok || !captureRes.image) {
    throw new Error(`Failed to capture ${candidate.id}`);
  }

  const filename = `${candidate.id}.png`;
  const filepath = path.join(outDir, filename);
  const base64Data = captureRes.image.replace(/^data:image\/png;base64,/, "");
  await fs.writeFile(filepath, Buffer.from(base64Data, "base64"));
  console.log(`Saved: ${filepath}`);

  results.push({
    ...candidate,
    imagePath: filepath,
    filename,
  });
}

await browser.close();

// Write candidate metadata JSON
await fs.writeFile(
  path.join(outDir, "candidates.json"),
  JSON.stringify(results, null, 2),
);

console.log("All candidates successfully rendered and saved!");
