/**
 * Guards the live landing against workshop leftovers and copy/metadata drift.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}
function pass(msg) {
  console.log("PASS:", msg);
}
async function read(rel) {
  return fs.readFile(path.join(root, rel), "utf8");
}
async function absent(rel) {
  try {
    await fs.access(path.join(root, rel));
    fail(`workshop path still present: ${rel}`);
  } catch {
    pass(`workshop path absent: ${rel}`);
  }
}

await absent("src/app/ink-lab/page.tsx");
await absent("src/components/ink/InkLab.tsx");
await absent("src/lib/ink/tool.ts");
await absent("src/lib/ink/kinematics.ts");
await absent("src/archive/landing/Orbit.tsx");
await absent("src/components/site/EncounterStrip.tsx");
await absent(".agents/skills/cro/SKILL.md");
await absent("docs/north-star-scroll-hillclimb.md");
await absent("spike-report.md");
await absent("public/scrollcraft/scrollcraft.js");
await absent("public/brand/ink-sphere-poster.png");

const [content, page, layout, readme, agents, sphere] = await Promise.all([
  read("src/lib/content.ts"),
  read("src/app/page.tsx"),
  read("src/app/layout.tsx"),
  read("README.md"),
  read("AGENTS.md"),
  read("src/components/ink/InkSphere.tsx"),
]);

if (!content.includes('heroTitle: "Make the thinking')) {
  fail("content.ts lost the live hero title");
} else {
  pass("content.ts still owns the live hero title");
}
if (!content.includes('cue: "404"')) {
  fail("notFound.cue is no longer 404");
} else {
  pass("notFound.cue remains 404");
}
if (!page.includes("<Hero />") || !page.includes("<HowItWorks />") || !page.includes("<Colophon />")) {
  fail("page.tsx is missing the live visitor spine");
} else {
  pass("page.tsx still mounts hero, folio, and colophon");
}
if (page.includes("InkLab") || page.includes("Orbit") || page.includes("Memory")) {
  fail("page.tsx still mounts a retired section");
} else {
  pass("page.tsx has no retired sections");
}
if (/colorScheme:\s*["']light dark["']/.test(layout)) {
  pass('viewport colorScheme is "light dark"');
} else {
  fail('viewport colorScheme is not "light dark"');
}
if (/openGraph:[\s\S]*?images:/.test(layout) && /twitter:[\s\S]*?images:/.test(layout)) {
  pass("social metadata includes images");
} else {
  fail("social metadata is missing images");
}
if (sphere.includes("createInkTool") || sphere.includes("LabInkSphere")) {
  fail("InkSphere still carries the ink-lab tool path");
} else {
  pass("InkSphere is the landing hero only");
}
if (/workshop routes/.test(agents) && /src\/lib\/content\.ts/.test(readme)) {
  pass("agent and human docs describe the live site");
} else {
  fail("AGENTS.md or README.md no longer describe the live site");
}

if (failed > 0) {
  console.error(`\nverify-hygiene: ${failed} failure(s)`);
  process.exit(1);
}
console.log("\nverify-hygiene: all checks passed");
