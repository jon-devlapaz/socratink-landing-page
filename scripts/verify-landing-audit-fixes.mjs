/**
 * Guards the Sept 2026 landing audit fix batch (Playwright design audit):
 * - mobile nav exposes section links + login behind a disclosure
 * - retention chart end-labels clamp inside the canvas
 * - hero figcaption no longer repeats the trust microcopy terms
 * - footer index lists every page section
 * - orbit discipline picker precedes the dossier on small screens
 * - takeaway act no longer pools viewport void between CTA and footer
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

// 1. Mobile nav disclosure.
const navSrc = await read("src/components/site/Nav.tsx");
if (navSrc.includes("aria-expanded") && navSrc.includes("aria-controls")) {
  pass("nav has a menu disclosure (aria-expanded + aria-controls)");
} else {
  fail("nav lacks a mobile menu disclosure");
}
if (navSrc.includes("md:hidden")) {
  pass("nav has mobile-only menu UI");
} else {
  fail("nav has no mobile-only (md:hidden) menu UI");
}
if ((navSrc.match(/nav\.links\.map/g) ?? []).length >= 2) {
  pass("nav renders section links in desktop and mobile menus");
} else {
  fail("nav does not render section links in a second (mobile) menu");
}
if ((navSrc.match(/nav\.login\.label/g) ?? []).length >= 2) {
  pass("nav exposes login in the mobile menu");
} else {
  fail("nav does not expose login in the mobile menu");
}

// 2. Chart end-label clamp.
const curveSrc = await read("src/components/site/RetentionCurve.tsx");
if (curveSrc.includes("Math.min(endX")) {
  pass("retention end-labels clamp against the canvas edge");
} else {
  fail("retention end-labels have no right-edge clamp");
}

// 3. Hero copy dedup.
const content = await read("src/lib/content.ts");
const heroNote = content.match(/heroNote: "([^"]*)"/)?.[1] ?? "";
const heroTrust = content.match(/heroTrust: "([^"]*)"/)?.[1] ?? "";
if (heroNote && !/account|sign-up/i.test(heroNote)) {
  pass(`heroNote avoids trust terms ("${heroNote}")`);
} else {
  fail(`heroNote repeats trust terms ("${heroNote}")`);
}
if (/No sign-up required/.test(heroTrust)) {
  pass("heroTrust still carries the no-sign-up terms");
} else {
  fail("heroTrust lost the no-sign-up terms");
}

// 4. Footer index covers every section.
const indexBlock = content.match(/index: \[(.*?)\]/s)?.[1] ?? "";
const indexCount = (indexBlock.match(/\{ label:/g) ?? []).length;
if (indexCount >= 4) {
  pass(`footer index lists ${indexCount} sections`);
} else {
  fail(`footer index lists only ${indexCount} sections`);
}
for (const anchor of ["#retention-science", "#how-it-works", "#material", "#memory"]) {
  if (indexBlock.includes(anchor)) {
    pass(`footer index links ${anchor}`);
  } else {
    fail(`footer index missing ${anchor}`);
  }
}

// 5. Disciplines / Orbit order on small screens (introduction precedes specimen/sheaf).
const orbitSrc = await read("src/components/site/Orbit.tsx");
let orbitCss = "";
try {
  orbitCss = await read("src/components/site/orbit.module.css");
} catch {
  // Optional fallback
}
const orbitHasSmallScreenOrder =
  (orbitSrc.includes("styles.selector") &&
    orbitCss.includes(".selector { grid-column: 1; grid-row: 2; }") &&
    orbitCss.includes(".example { grid-row: 3;")) ||
  (orbitSrc.indexOf("lg:col-span-5") !== -1 &&
    orbitSrc.indexOf("lg:col-span-5") < orbitSrc.indexOf("lg:col-span-7")) ||
  (orbitSrc.includes("styles.introduction") &&
    (orbitSrc.includes("styles.sheafContainer") || orbitSrc.includes("styles.celestialStage")) &&
    (orbitSrc.indexOf("styles.introduction") < orbitSrc.indexOf("styles.sheafContainer") ||
      orbitSrc.indexOf("styles.introduction") < orbitSrc.indexOf("styles.celestialStage")));

if (orbitHasSmallScreenOrder) {
  pass("orbit picker / introduction precedes the specimen on small screens");
} else {
  fail("orbit picker does not precede the specimen on small screens");
}

// 6. Takeaway act keeps CTA and footer together (never centered).
const css = await read("src/app/globals.css");
const shellBlock =
  css.match(/\.folio-track-takeaway \.folio-section-shell \{([^}]*)\}/)?.[1] ?? "";
if (!/space-between/.test(shellBlock)) {
  pass("takeaway shell no longer space-between (no pooled void)");
} else {
  fail("takeaway shell still pools void via space-between");
}
if (!/justify-content:\s*center/.test(shellBlock)) {
  pass("takeaway shell respects the never-center constraint");
} else {
  fail("takeaway shell violates the never-center constraint");
}
const takeawayFooter =
  css.match(/\.folio-track-takeaway \.site-footer \{([^}]*)\}/)?.[1] ?? "";
if (/margin-top:\s*0/.test(takeawayFooter)) {
  pass("takeaway footer follows the CTA instead of bottom-pinning");
} else {
  fail("takeaway footer still bottom-pins via margin-top: auto");
}

// 7. Hero ink stage clips its fixed-size canvas (768px no-overflow guard).
const heroSubject =
  css.match(/\.hero-subject \{ position: relative;([^}]*)\}/)?.[1] ?? "";
if (/overflow:\s*clip/.test(heroSubject)) {
  pass("hero-subject clips canvas overflow (tablet widths)");
} else {
  fail("hero-subject lacks overflow: clip (tablet overflow risk)");
}

// 8. Orbit responsive adaptation (prevents viewport overflow on mobile).
const orbitPhone = css.match(/\.orbit-phone \{([^}]*)\}/)?.[1] ?? "";
const orbitHasMobileAdaptation =
  orbitCss.includes("overflow-x: auto") ||
  orbitPhone.includes("container-type: inline-size");

if (orbitHasMobileAdaptation) {
  pass("orbit adapts to small viewports without overflow");
} else {
  fail("orbit lacks mobile overflow adaptation");
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
} else {
  console.log("\nAll landing audit fix checks passed.");
}
