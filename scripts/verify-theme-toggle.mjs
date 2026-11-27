/**
 * Appearance toggle: a click that lands on the system scheme clears the stored
 * override, so the page follows the OS again. A real override survives the OS
 * later switching to match it. Writes report.json and screenshots per step.
 *
 * INK_URL, INK_ARTIFACTS, CHROME_PATH override defaults.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || "artifacts/theme-toggle");
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const report = [];

async function state(page) {
  return page.evaluate(() => ({
    stored: localStorage.getItem("socratink-theme"),
    dataTheme: document.documentElement.dataset.theme ?? null,
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    pressed: document.querySelector("#appearance-toggle")?.getAttribute("aria-pressed"),
    themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  }));
}

async function step(page, name, expected) {
  await page.waitForTimeout(150);
  const actual = await state(page);
  const mismatches = Object.entries(expected).filter(([key, value]) => actual[key] !== value);
  await page.screenshot({ path: path.join(out, `${report.length + 1}-${name}.png`) });
  report.push({ step: name, expected, actual, pass: mismatches.length === 0 });
  if (mismatches.length) {
    throw new Error(`${name}: ${mismatches.map(([k]) => `${k}=${actual[k]} (want ${expected[k]})`).join(", ")}`);
  }
}

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const toggle = page.locator("#appearance-toggle");
  await toggle.waitFor();

  await step(page, "os-light-default", { stored: null, dataTheme: null, colorScheme: "light", pressed: "false" });

  await toggle.click();
  await step(page, "override-dark", { stored: "dark", dataTheme: "dark", colorScheme: "dark", pressed: "true", themeColor: "#100f0f" });

  await page.emulateMedia({ colorScheme: "dark" });
  await step(page, "os-turns-dark-override-kept", { stored: "dark", dataTheme: "dark", colorScheme: "dark", pressed: "true" });

  await page.emulateMedia({ colorScheme: "light" });
  await step(page, "os-back-light-still-dark", { stored: "dark", dataTheme: "dark", colorScheme: "dark", pressed: "true" });

  await page.reload({ waitUntil: "domcontentloaded" });
  await toggle.waitFor();
  await step(page, "reload-keeps-override", { stored: "dark", dataTheme: "dark", colorScheme: "dark", pressed: "true" });

  await toggle.click();
  await step(page, "toggle-to-system-clears", { stored: null, dataTheme: null, colorScheme: "light", pressed: "false", themeColor: "#fffcf0" });

  await page.emulateMedia({ colorScheme: "dark" });
  await step(page, "follows-os-dark-again", { stored: null, dataTheme: null, colorScheme: "dark", pressed: "true" });

  await toggle.click();
  await step(page, "override-light-on-dark-os", { stored: "light", dataTheme: "light", colorScheme: "light", pressed: "false" });

  await toggle.click();
  await step(page, "back-to-system-dark", { stored: null, dataTheme: null, colorScheme: "dark", pressed: "true" });

  console.log(`PASS: ${report.length} steps. Artifacts in ${out}`);
} finally {
  await fs.writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
