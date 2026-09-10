import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outDir = "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529";
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
    id: "variant_0_current_kidney",
    badge: "Current Baseline",
    title: "Legacy Asymmetrical Kidney Blob",
    geometry: "4-part off-center cluster: [1.6, 1.75, 1.5] + 3 irregular offset lobes",
    critique: "Distorted bean shape, off-axis rotation, visually disconnected from brand logo dot",
    scene: {
      version: 1,
      name: "Current Kidney Baseline",
      blend: 0.42,
      material: { color: "#08090b", roughness: 0.18, metalness: 0.15 },
      motion: { speed: 0.45, amplitude: 0.12, pointer: 0.3 },
      parts: [
        part([0, 0, 0], [1.6, 1.75, 1.5]),
        part([0.55, 0.25, 0.05], [0.9, 0.95, 0.9]),
        part([-0.4, -0.5, 0.1], [1.1, 0.95, 1]),
        part([-0.3, 0.55, -0.1], [0.95, 0.85, 1]),
      ],
    },
  },
  {
    id: "variant_1_pure_monolith_170",
    badge: "Candidate A (Recommended)",
    title: "Pure Socratic Orb (r=1.70)",
    geometry: "Single monolithic sphere: [1.70, 1.70, 1.70], obsidian black #060709",
    critique: "100% faithful to Socratink ● logo mark. Pure circular silhouette, zero lumpy artifacts, serene organic breathing",
    scene: {
      version: 1,
      name: "Pure Socratic Orb",
      blend: 0.35,
      material: { color: "#060709", roughness: 0.14, metalness: 0.16 },
      motion: { speed: 0.32, amplitude: 0.024, pointer: 0.15 },
      parts: [
        part([0, 0, 0], [1.70, 1.70, 1.70]),
      ],
    },
  },
  {
    id: "variant_2_poised_logo_160",
    badge: "Candidate B",
    title: "Poised Logo Orb (r=1.60)",
    geometry: "Single monolithic sphere: [1.60, 1.60, 1.60] with higher specular gloss",
    critique: "Slightly more breathing margin, crisp specular glint, perfectly balanced in hero scene",
    scene: {
      version: 1,
      name: "Poised Logo Orb",
      blend: 0.35,
      material: { color: "#060709", roughness: 0.11, metalness: 0.18 },
      motion: { speed: 0.32, amplitude: 0.022, pointer: 0.14 },
      parts: [
        part([0, 0, 0], [1.60, 1.60, 1.60]),
      ],
    },
  },
  {
    id: "variant_3_submerged_vorticity",
    badge: "Candidate C",
    title: "Submerged Vorticity Core",
    geometry: "Primary sphere [1.62, 1.62, 1.62] + 4 deeply submerged micro-nodes (r=0.35, offset 0.15, blend 0.52)",
    critique: "Retains 99% circular silhouette while generating subtle internal fluid pressure waves across the liquid surface",
    scene: {
      version: 1,
      name: "Submerged Vorticity Core",
      blend: 0.52,
      material: { color: "#07080a", roughness: 0.14, metalness: 0.15 },
      motion: { speed: 0.35, amplitude: 0.035, pointer: 0.16 },
      parts: [
        part([0, 0, 0], [1.62, 1.62, 1.62]),
        part([0, 0.16, 0.08], [0.36, 0.36, 0.36]),
        part([0.15, -0.09, 0.08], [0.36, 0.36, 0.36]),
        part([-0.15, -0.09, 0.08], [0.36, 0.36, 0.36]),
        part([0, 0, -0.18], [0.36, 0.36, 0.36]),
      ],
    },
  },
  {
    id: "variant_4_capillary_meniscus",
    badge: "Candidate D",
    title: "Capillary Fluid Meniscus",
    geometry: "Slight gravity aspect poise: [1.64, 1.67, 1.64] with high blend (0.45)",
    critique: "Microscopic vertical elongation (1.00 : 1.02) simulating a poised ink droplet in suspended surface tension",
    scene: {
      version: 1,
      name: "Capillary Fluid Meniscus",
      blend: 0.45,
      material: { color: "#060709", roughness: 0.13, metalness: 0.16 },
      motion: { speed: 0.30, amplitude: 0.022, pointer: 0.15 },
      parts: [
        part([0, -0.02, 0], [1.64, 1.67, 1.64]),
        part([0, 0.20, 0], [1.10, 1.12, 1.10]),
        part([0, -0.20, 0], [1.25, 1.22, 1.25]),
      ],
    },
  },
];

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await page.waitForSelector(".hero-subject canvas");
await page.waitForFunction(() => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready);

const renderedCaptures = [];

for (const c of candidates) {
  console.log(`Rendering ${c.id}: ${c.title}...`);
  await page.evaluate((sceneData) => {
    window.socratinkInk?.call("ink_set_scene", { scene: sceneData });
  }, c.scene);

  await page.waitForFunction(() => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning);
  await page.waitForTimeout(400);

  const canvas = await page.$(".hero-subject canvas");
  const canvasFilePath = path.join(outDir, `${c.id}.png`);
  if (canvas) {
    await canvas.screenshot({ path: canvasFilePath });
  }

  // Also capture dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    window.dispatchEvent(new Event("storage"));
  });
  await page.waitForTimeout(250);
  const darkCanvasFilePath = path.join(outDir, `${c.id}_dark.png`);
  if (canvas) {
    await canvas.screenshot({ path: darkCanvasFilePath });
  }

  // Restore light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    window.dispatchEvent(new Event("storage"));
  });
  await page.waitForTimeout(200);

  const base64Light = (await fs.readFile(canvasFilePath)).toString("base64");
  const base64Dark = (await fs.readFile(darkCanvasFilePath)).toString("base64");

  renderedCaptures.push({
    ...c,
    base64Light,
    base64Dark,
    canvasFilePath,
    darkCanvasFilePath,
  });
}

// Build contact sheet
const sheet = await browser.newPage({
  viewport: { width: 1600, height: 920 },
  deviceScaleFactor: 1.5,
});

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 36px 40px;
    background: #fcfbf8;
    color: #1a1a18;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  header {
    margin-bottom: 28px;
    border-bottom: 1px solid #e7e4dc;
    padding-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  h1 {
    font-size: 26px;
    font-weight: 600;
    margin: 0 0 6px 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h1 span.logo-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #08090b;
  }
  p.desc {
    margin: 0;
    color: #66635d;
    font-size: 14px;
    max-width: 860px;
    line-height: 1.5;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }
  .card {
    background: #ffffff;
    border: 1px solid #e8e5dc;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    transition: transform 0.2s ease;
  }
  .card.highlight {
    border: 2px solid #181816;
    box-shadow: 0 6px 24px rgba(0,0,0,0.09);
    position: relative;
  }
  .preview {
    background: #f7f5ef;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    position: relative;
  }
  .preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(0,0,0,0.06);
    color: #444;
  }
  .card.highlight .badge {
    background: #08090b;
    color: #fff;
  }
  .info {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .info h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #88847c;
    margin-bottom: 8px;
    background: #f6f4ee;
    padding: 4px 6px;
    border-radius: 4px;
    line-height: 1.35;
  }
  .info p {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
    color: #55524c;
  }
</style>
</head>
<body>
  <header>
    <div>
      <h1><span class="logo-dot"></span> Socratink Default Living Ink Workshop: Logo Sphere Candidates</h1>
      <p class="desc">Evaluating spherical living ink topologies modeled after the Socratink logo mark (●). Comparing the legacy kidney blob baseline against 4 refined spherical geometries rendered natively in WebGL Raymarcher at 1.0× anti-aliased resolution.</p>
    </div>
  </header>
  <div class="grid">
    ${renderedCaptures
      .map(
        (c) => `
      <div class="card ${c.id.includes("variant_1") ? "highlight" : ""}">
        <div class="preview">
          <span class="badge">${c.badge}</span>
          <img src="data:image/png;base64,${c.base64Light}" alt="${c.title}">
        </div>
        <div class="info">
          <h3>${c.title}</h3>
          <div class="meta">${c.geometry}</div>
          <p>${c.critique}</p>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
</body>
</html>`;

await sheet.setContent(html);
const comparisonSheetPath = path.join(outDir, "logo_sphere_workshop_comparison.png");
await sheet.screenshot({ path: comparisonSheetPath });

// Also create a Dark Mode comparison sheet
const darkHtml = html
  .replace(/background: #fcfbf8;/g, "background: #0d0e11;")
  .replace(/color: #1a1a18;/g, "color: #e5e5ea;")
  .replace(/border-bottom: 1px solid #e7e4dc;/g, "border-bottom: 1px solid #24252a;")
  .replace(/color: #66635d;/g, "color: #92949c;")
  .replace(/background: #ffffff;/g, "background: #16171b;")
  .replace(/border: 1px solid #e8e5dc;/g, "border: 1px solid #28292f;")
  .replace(/background: #f7f5ef;/g, "background: #111215;")
  .replace(/background: rgba\(0,0,0,0\.06\);/g, "background: rgba(255,255,255,0.1);")
  .replace(/color: #444;/g, "color: #ccc;")
  .replace(/background: #f6f4ee;/g, "background: #202126;")
  .replace(/color: #88847c;/g, "color: #aaa;")
  .replace(/color: #55524c;/g, "color: #b0b2b8;")
  .replace(/base64Light/g, "base64Dark");

const darkSheetPath = path.join(outDir, "logo_sphere_workshop_dark_comparison.png");
await sheet.setContent(
  darkHtml.replace(
    /\${renderedCaptures[\s\S]*?\.join\(""\)}/,
    renderedCaptures
      .map(
        (c) => `
      <div class="card ${c.id.includes("variant_1") ? "highlight" : ""}">
        <div class="preview">
          <span class="badge">${c.badge}</span>
          <img src="data:image/png;base64,${c.base64Dark}" alt="${c.title}">
        </div>
        <div class="info">
          <h3>${c.title}</h3>
          <div class="meta">${c.geometry}</div>
          <p>${c.critique}</p>
        </div>
      </div>
    `,
      )
      .join(""),
  ),
);
await sheet.screenshot({ path: darkSheetPath });

await browser.close();
console.log("SUCCESS: Workshop comparison sheets created successfully!");
