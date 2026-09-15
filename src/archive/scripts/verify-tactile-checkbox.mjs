import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "lab/tactile_ref");
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--use-gl=angle", "--use-angle=metal", "--no-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log("Navigating to http://localhost:3001/checkbox ...");
  await page.goto("http://localhost:3001/checkbox", { waitUntil: "networkidle" });
  await page.waitForSelector(".tactile-3d-checkbox-shell canvas");
  await page.waitForTimeout(1000);

  // 1. Initial checked state (Plum reference)
  console.log("Capturing checked state (Plum)...");
  await page.screenshot({ path: path.join(outDir, "01_checked_plum.png") });

  // 2. Mouse hover tilt kinematics
  console.log("Testing hover tilt...");
  const box = await page.locator(".tactile-3d-checkbox-shell").boundingBox();
  if (box) {
    // Hover at top-left
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, "02_hover_tilt_top_left.png") });

    // Hover at bottom-right
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, "03_hover_tilt_bottom_right.png") });

    // 3. Click to uncheck
    console.log("Clicking to toggle unchecked...");
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    // Wait for stroke retract animation
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, "04_unchecked_plum.png") });

    // 4. Click to check again
    console.log("Clicking to toggle checked...");
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, "05_checked_again.png") });
  }

  // 5. Palette switch: Socratink Teal
  console.log("Testing Socratink palette...");
  await page.getByRole("button", { name: "Socratink Teal" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "06_palette_socratink.png") });

  // 6. Palette switch: Midnight
  console.log("Testing Midnight palette...");
  await page.getByRole("button", { name: "Midnight" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "07_palette_midnight.png") });

  // 7. Homepage showcase section
  console.log("Navigating to homepage showcase...");
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
  await page.waitForSelector(".tactile-3d-checkbox-shell canvas");
  const showcase = page.locator("section:has(.tactile-3d-checkbox-shell)");
  await showcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "08_homepage_showcase.png") });

  console.log("All screenshots captured successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
