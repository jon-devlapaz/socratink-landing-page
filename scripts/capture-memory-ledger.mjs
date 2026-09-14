import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = "/Users/jondev/.gemini/antigravity/brain/d0589e6c-8c45-4a2a-9880-774c2de9bc97/screenshots/memory_ledger";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  // 1. Desktop captures (1440x900)
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(600);

  const memory = desktop.locator("#memory");
  await memory.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(400);

  // Day 01 (default)
  await desktop.mouse.move(0, 0);
  await memory.screenshot({ path: join(outDir, "desktop_day01_baseline.png") });
  console.log("Captured desktop_day01_baseline.png");

  // Day 03
  await desktop.click("#memory-tab-day-03");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "desktop_day03_repair.png") });
  console.log("Captured desktop_day03_repair.png");

  // Day 14
  await desktop.click("#memory-tab-day-14");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "desktop_day14_mastered.png") });
  console.log("Captured desktop_day14_mastered.png");
  await desktop.close();

  // 2. Mobile captures (390x844)
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(600);

  const memoryMobile = mobile.locator("#memory");
  await memoryMobile.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(400);

  // Day 01
  await memoryMobile.screenshot({ path: join(outDir, "mobile_day01_baseline.png") });
  console.log("Captured mobile_day01_baseline.png");

  // Day 14
  await mobile.click("#memory-tab-day-14");
  await mobile.waitForTimeout(300);
  await memoryMobile.screenshot({ path: join(outDir, "mobile_day14_mastered.png") });
  console.log("Captured mobile_day14_mastered.png");
  await mobile.close();
} finally {
  await browser.close();
}
