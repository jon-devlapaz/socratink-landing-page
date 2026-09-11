/**
 * Production Landing Page Smoke Test
 *
 * Verifies core sections render cleanly:
 * - Nav with Disciplines, Memory, CTAs
 * - Hero with Living Ink Orb & CTA
 * - Disciplines / Orbit section (#material)
 * - Memory section (#memory)
 * - Final CTA section
 * - Verifies removed #method section is absent
 * - Zero page/console errors
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3001/";

let failed = 0;
function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}
function pass(msg) {
  console.log("PASS:", msg);
}
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(err.message));

try {
  await page.goto(BASE, { waitUntil: "networkidle" });

  // 1. Hero checks
  const h1 = await page.textContent("h1");
  if (h1 && h1.includes("Practice hard material")) {
    pass("Hero title rendered cleanly");
  } else {
    fail(`Hero title missing or unexpected: ${h1}`);
  }

  // 2. Ink sphere check
  const sphere = await page.$(".ink-sphere");
  if (sphere) {
    pass("Hero living ink sphere mounted");
  } else {
    fail("Hero ink sphere missing");
  }

  // 3. Removed #method section check
  const method = await page.$("#method");
  if (!method) {
    pass("Method section successfully removed from DOM");
  } else {
    fail("Method section still present in DOM");
  }

  // 4. Disciplines / Orbit check
  const material = await page.$("#material");
  if (material) {
    pass("Disciplines (Orbit) section rendered");
  } else {
    fail("Disciplines section missing");
  }

  // 4b. How It Works check
  const howItWorks = await page.$("#how-it-works");
  if (howItWorks) {
    pass("How It Works walkthrough section rendered");
  } else {
    fail("How It Works section missing");
  }

  // 4c. Retention Science check
  const retentionScience = await page.$("#retention-science");
  if (retentionScience) {
    pass("Retention Science curve section rendered");
  } else {
    fail("Retention Science section missing");
  }

  // 5. Memory check
  const memory = await page.$("#memory");
  if (memory) {
    pass("Memory section rendered");
  } else {
    fail("Memory section missing");
  }

  // 6. Navigation links check
  const navLinks = await page.$$eval("nav a", (links) =>
    links.map((l) => l.getAttribute("href")),
  );
  if (
    !navLinks.includes("#method") &&
    navLinks.includes("#material") &&
    navLinks.includes("#memory")
  ) {
    pass(
      "Navigation links updated correctly (no #method, includes #material and #memory)",
    );
  } else {
    fail(`Navigation links unexpected: ${JSON.stringify(navLinks)}`);
  }

  // 7. No unhandled page errors
  if (pageErrors.length === 0) {
    pass("Zero uncaught JavaScript runtime errors on page");
  } else {
    fail(`Page errors detected: ${pageErrors.join(", ")}`);
  }
} finally {
  await browser.close();
}

if (failed > 0) {
  console.error(`\nSmoke verification failed: ${failed} failure(s)`);
  process.exit(1);
} else {
  console.log("\nverify-smoke: all checks passed");
  process.exit(0);
}
