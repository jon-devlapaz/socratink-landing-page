import { chromium } from "playwright-core";
import { join } from "node:path";

const outDir = "/Users/jondev/dev/active/socratink-landing/docs/north-star-scroll-hillclimb-reviews/phase-3-2";
const url = "http://127.0.0.1:3101/";

const browser = await chromium.launch({ headless: true });

async function captureSet({ width, height, isMobile = false, reducedMotion = "no-preference", prefix }) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile,
    reducedMotion: reducedMotion === "reduce" ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Measure #material section absolute position
  const sectionTop = await page.evaluate(() => {
    const el = document.getElementById("material");
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return window.scrollY + rect.top;
  });

  if (sectionTop === null) throw new Error("Could not find #material");

  // On entry: #material is just entering viewport bottom
  // scrollY such that section top is near bottom of screen
  const entryY = Math.max(0, sectionTop - height * 0.85);
  // Middle: section top is entering upper half of screen
  const middleY = Math.max(0, sectionTop - height * 0.45);
  // Rest: section is comfortably in view (top aligned below nav)
  const navOffset = width >= 768 ? 80 : 64;
  const restY = Math.max(0, sectionTop - navOffset);

  async function scrollTo(y) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(600);
  }

  // 1. Entry state
  await scrollTo(entryY);
  await page.screenshot({ path: join(outDir, `${prefix}-entry.png`) });
  console.log(`Captured ${prefix}-entry.png`);

  // 2. Middle state
  await scrollTo(middleY);
  await page.screenshot({ path: join(outDir, `${prefix}-middle.png`) });
  console.log(`Captured ${prefix}-middle.png`);

  // 3. Rest state
  await scrollTo(restY);
  await page.screenshot({ path: join(outDir, `${prefix}-rest.png`) });
  console.log(`Captured ${prefix}-rest.png`);

  // 4. Reverse state (scroll past, then scroll back to middle state)
  await scrollTo(restY + 200);
  await scrollTo(middleY);
  await page.screenshot({ path: join(outDir, `${prefix}-reverse.png`) });
  console.log(`Captured ${prefix}-reverse.png`);

  await context.close();
}

try {
  console.log("Capturing Desktop 1440...");
  await captureSet({ width: 1440, height: 900, prefix: "desktop-1440" });

  console.log("Capturing Phone 390...");
  await captureSet({ width: 390, height: 844, isMobile: true, prefix: "phone-390" });

  console.log("Capturing Reduced Motion 1440...");
  await captureSet({ width: 1440, height: 900, reducedMotion: "reduce", prefix: "reduced-1440" });

  console.log("All Phase 3.2 captures complete!");
} finally {
  await browser.close();
}
