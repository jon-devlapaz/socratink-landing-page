/**
 * Site hygiene regression check (no browser required).
 *
 * Guards the Sept 2026 touch-up batch:
 * - dead Method section stays deleted (EncounterStrip, its CSS, LandingInkDirector, contractSlip)
 * - docs stay in sync (no live claims about the removed section)
 * - viewport supports both color schemes with matching theme-colors
 * - social metadata ships an image (no platform-generated fallback)
 * - WebGL test orb skips SSR prerendering
 * - InkLab randomize stays memoized with complete effect deps
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
    fail(`dead file still present: ${rel}`);
  } catch {
    pass(`dead file absent: ${rel}`);
  }
}

// 1. Dead files stay deleted.
await absent("src/components/site/EncounterStrip.tsx");
await absent("src/components/site/encounter-strip.css");
await absent("src/components/site/LandingInkDirector.tsx");

// 2. No live references to the removed section.
const [content, memory, hero, layout, inkLab, readme] = await Promise.all([
  read("src/lib/content.ts"),
  read("src/components/site/Memory.tsx"),
  read("src/components/site/Hero.tsx"),
  read("src/app/layout.tsx"),
  read("src/components/ink/InkLab.tsx"),
  read("README.md"),
]);
for (const [name, text] of [
  ["src/lib/content.ts", content],
  ["src/components/site/Memory.tsx", memory],
]) {
  if (/(EncounterStrip|contractSlip)/.test(text)) {
    fail(`${name} still references the removed section`);
  } else {
    pass(`${name} has no removed-section references`);
  }
}
const liveSrc = await Promise.all(
  ["src/app/page.tsx", "src/components/site/Nav.tsx", "src/components/site/Footer.tsx"].map(read),
);
if (liveSrc.some((t) => /(EncounterStrip|LandingInkDirector|contractSlip)/.test(t))) {
  fail("live component still imports the removed section");
} else {
  pass("live components have no removed-section imports");
}
if (/EncounterStrip/.test(readme) && /primary interactive/.test(readme)) {
  fail("README still documents EncounterStrip as the page spine");
} else {
  pass("README no longer documents the removed spine");
}

// 3. Viewport supports the app's actual theme range.
if (/colorScheme:\s*["']light dark["']/.test(layout)) {
  pass('viewport colorScheme is "light dark"');
} else {
  fail('viewport colorScheme is not "light dark"');
}
if (
  /prefers-color-scheme: light/.test(layout) &&
  /prefers-color-scheme: dark/.test(layout) &&
  /#fffcf0/.test(layout) &&
  /#100f0f/.test(layout)
) {
  pass("viewport themeColor covers light and dark");
} else {
  fail("viewport themeColor does not cover light and dark");
}

// 4. Social metadata ships a real image.
if (/openGraph:[\s\S]*?images:/.test(layout) && /twitter:[\s\S]*?images:/.test(layout)) {
  pass("openGraph and twitter metadata include images");
} else {
  fail("social metadata is missing images");
}

// 5. WebGL test orb skips SSR prerendering.
if (/\{\s*ssr:\s*false\s*\}/.test(hero)) {
  pass("Hero dynamic orb import uses ssr: false");
} else {
  fail("Hero dynamic orb import is missing ssr: false");
}

// 6. InkLab randomize stays memoized with complete deps.
if (/const randomize = useCallback\(/.test(inkLab)) {
  pass("InkLab randomize is memoized");
} else {
  fail("InkLab randomize is not memoized");
}
if (/autoMorph,\s*tool,\s*paused,\s*randomize/.test(inkLab) && /\[\s*triggerSomatic,\s*randomize\s*\]/.test(inkLab)) {
  pass("InkLab effects depend on randomize");
} else {
  fail("InkLab effects have incomplete deps");
}

if (failed > 0) {
  console.error(`\nverify-hygiene: ${failed} failure(s)`);
  process.exit(1);
} else {
  console.log("\nverify-hygiene: all checks passed");
}
