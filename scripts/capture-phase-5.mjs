import { chromium } from "playwright-core";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const outDir = "/Users/jondev/dev/active/socratink-landing/docs/socratink-engram-hillclimb-reviews/phase-5";
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
const url = "http://127.0.0.1:3101/";

const browser = await chromium.launch({ headless: true });

async function captureSectionFlow({ width, height, isMobile = false, reducedMotion = "no-preference", prefix }) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile,
    reducedMotion: reducedMotion === "reduce" ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const sections = [
    { id: "top", name: "01-hero" },
    { id: "how-it-works", name: "02-how-it-works" },
    { id: "material", name: "03-orbit-material" },
    { id: "retention-science", name: "04-retention-science" },
    { id: "memory", name: "05-memory-ledger" },
    { id: "faq", name: "06-faq" },
    { id: "takeaway", name: "07-final-cta" },
  ];

  for (const s of sections) {
    const el = await page.$(`#${s.id}`);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const filename = `${prefix}-${s.name}.png`;
      await page.screenshot({ path: join(outDir, filename) });
      console.log(`Captured ${filename}`);
    }
  }

  // Also test FAQ interactive toggle
  const secondFaq = await page.$("#faq details:nth-of-type(2) summary");
  if (secondFaq) {
    await secondFaq.click();
    await page.waitForTimeout(400);
    const filename = `${prefix}-06-faq-expanded.png`;
    await page.screenshot({ path: join(outDir, filename) });
    console.log(`Captured ${filename}`);
  }

  await context.close();
}

try {
  console.log("Capturing Phase 5 Desktop 1440...");
  await captureSectionFlow({ width: 1440, height: 900, prefix: "desktop-1440" });

  console.log("Capturing Phase 5 Phone 390...");
  await captureSectionFlow({ width: 390, height: 844, isMobile: true, prefix: "phone-390" });

  console.log("Capturing Phase 5 Reduced Motion 1440...");
  await captureSectionFlow({ width: 1440, height: 900, reducedMotion: "reduce", prefix: "reduced-1440" });

  console.log("All Phase 5 captures complete!");
} finally {
  await browser.close();
}
