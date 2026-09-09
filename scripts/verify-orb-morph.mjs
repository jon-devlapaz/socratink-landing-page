import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "lab/orb_morph_ref");
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--use-gl=angle", "--use-angle=metal", "--no-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log("Navigating to http://localhost:3001/ ...");
  await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-scene canvas");
  await page.waitForTimeout(800);

  // Verify hero morph buttons are gone
  const heroButtonBar = await page.$('[aria-label="Ink orb morph shapes"]');
  if (heroButtonBar) {
    throw new Error("Hero morph button bar still exists! Should be completely removed.");
  }
  console.log("Verified: hero morph buttons are completely removed.");

  // 1. Initial Sphere
  console.log("Capturing 01_sphere...");
  await page.screenshot({ path: path.join(outDir, "01_sphere.png") });

  // 2. Advance to Checkbox
  console.log("Clicking sphere directly to advance to Checkbox...");
  await page.locator(".hero-subject .sphere").click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, "02_checkbox.png") });

  // 3. Advance to Fingerprint
  console.log("Clicking sphere directly to advance to Fingerprint...");
  await page.locator(".hero-subject .sphere").click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, "03_fingerprint.png") });

  // 4. Advance to S-Seal
  console.log("Clicking sphere directly to advance to S-Seal...");
  await page.locator(".hero-subject .sphere").click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, "04_seal.png") });

  // 5. Advance to Code Brackets
  console.log("Clicking sphere directly to advance to Code Brackets...");
  await page.locator(".hero-subject .sphere").click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, "05_code.png") });

  // 6. Advance to Magnifying Glass
  console.log("Clicking sphere directly to advance to Magnifying Glass...");
  await page.locator(".hero-subject .sphere").click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(outDir, "06_lens.png") });

  // 7. Let the organic loop cycle back to Sphere autonomously
  console.log("Waiting for autonomous loop to cycle back to Sphere...");
  await page.waitForTimeout(4600);
  await page.screenshot({ path: path.join(outDir, "07_sphere_looped.png") });

  console.log("All morph screenshots captured!");
  await browser.close();
}

run().catch((err) => {
  console.error("Orb morph test failed:", err);
  process.exit(1);
});
