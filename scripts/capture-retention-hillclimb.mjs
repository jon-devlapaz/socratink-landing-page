import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = "/Users/jondev/.gemini/antigravity/brain/d0589e6c-8c45-4a2a-9880-774c2de9bc97/screenshots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  // 1. Desktop captures
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktopPage.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);

  const retentionSection = desktopPage.locator("#retention-science");
  await retentionSection.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(500);

  // Scroll to Day 1 (just entered)
  await desktopPage.evaluate(() => {
    const el = document.getElementById("retention-science");
    const rect = el.getBoundingClientRect();
    window.scrollBy(0, rect.top - (window.innerHeight * 0.45));
  });
  await desktopPage.waitForTimeout(600);
  await retentionSection.screenshot({ path: join(outDir, "hillclimb_day1_light.png") });
  console.log("Captured hillclimb_day1_light.png");

  // Scroll to Day 7
  await desktopPage.evaluate(() => {
    const el = document.getElementById("retention-science");
    const rect = el.getBoundingClientRect();
    window.scrollBy(0, rect.top - (window.innerHeight * 0.15));
  });
  await desktopPage.waitForTimeout(600);
  await retentionSection.screenshot({ path: join(outDir, "hillclimb_day7_light.png") });
  console.log("Captured hillclimb_day7_light.png");

  // Scroll to Day 30
  await desktopPage.evaluate(() => {
    const el = document.getElementById("retention-science");
    const rect = el.getBoundingClientRect();
    window.scrollBy(0, rect.top - (window.innerHeight * -0.05));
  });
  await desktopPage.waitForTimeout(600);
  await retentionSection.screenshot({ path: join(outDir, "hillclimb_day30_light.png") });
  console.log("Captured hillclimb_day30_light.png");

  // Dark mode Day 7
  await desktopPage.evaluate(() => {
    localStorage.setItem("socratink-theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  await desktopPage.reload({ waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.evaluate(() => {
    const el = document.getElementById("retention-science");
    const rect = el.getBoundingClientRect();
    window.scrollBy(0, rect.top - (window.innerHeight * 0.15));
  });
  await desktopPage.waitForTimeout(600);
  await desktopPage.locator("#retention-science").screenshot({ path: join(outDir, "hillclimb_day7_dark.png") });
  console.log("Captured hillclimb_day7_dark.png");

  // 2. Mobile 320px Viewport Check
  const mobilePage = await browser.newPage({ viewport: { width: 320, height: 720 } });
  await mobilePage.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(800);

  const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  console.log(`Mobile (320px) document scrollWidth: ${scrollWidth}px`);
  if (scrollWidth > 320) {
    console.error(`ERROR: Horizontal overflow detected! scrollWidth = ${scrollWidth}`);
  } else {
    console.log("PASS: Zero horizontal overflow at 320px viewport.");
  }

  const mobileSection = mobilePage.locator("#retention-science");
  await mobileSection.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(600);
  await mobileSection.screenshot({ path: join(outDir, "hillclimb_mobile_320.png") });
  console.log("Captured hillclimb_mobile_320.png");

  // Full viewport desktop capture
  await desktopPage.setViewportSize({ width: 1440, height: 960 });
  await desktopPage.evaluate(() => {
    localStorage.setItem("socratink-theme", "light");
    document.documentElement.dataset.theme = "light";
  });
  await desktopPage.reload({ waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.evaluate(() => {
    const el = document.getElementById("retention-science");
    const rect = el.getBoundingClientRect();
    window.scrollBy(0, rect.top - 120);
  });
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: join(outDir, "hillclimb_full_context.png") });
  console.log("Captured hillclimb_full_context.png");

} finally {
  await browser.close();
}
