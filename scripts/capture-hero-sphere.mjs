/**
 * Capture hero sphere screenshots for paper and ink themes.
 * Requires dev server at http://127.0.0.1:3001
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "artifacts", "sphere");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function capture(theme, name) {
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await page.evaluate((t) => {
    localStorage.setItem("socratink-theme", t);
    document.documentElement.dataset.theme = t;
  }, theme);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const hero = page.locator(".hero-subject");
  await hero.screenshot({ path: join(outDir, `${name}.png`) });
  console.log(`Wrote ${name}.png (${theme})`);
}

await capture("light", "hero-sphere-paper");
await capture("dark", "hero-sphere-ink");

// Update reduced-motion poster from ink theme still (matches reference ground)
await page.evaluate(() => {
  localStorage.setItem("socratink-theme", "dark");
  document.documentElement.dataset.theme = "dark";
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const sphere = page.locator(".hero-subject .sphere-render canvas");
const box = await sphere.boundingBox();
if (box) {
  await page.locator(".hero-subject").screenshot({
    path: join(__dirname, "..", "public", "brand", "ink-sphere-poster.png"),
  });
  console.log("Updated public/brand/ink-sphere-poster.png");
}

await browser.close();
