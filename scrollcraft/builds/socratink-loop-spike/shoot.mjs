import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const out = path.join(root, "shots");
fs.mkdirSync(out, { recursive: true });

const served = process.env.SHOOT_URL || "http://127.0.0.1:4502/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
await page.goto(served, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);

async function pinShell() {
  for (let y = 0; y < 12000; y += 40) {
    await page.evaluate((yy) => scrollTo(0, yy), y);
    const t = await page.evaluate(() =>
      document.getElementById("shell").getBoundingClientRect().top
    );
    if (t <= 56.5 && t >= 50) return;
  }
}

async function advanceUntil(pred, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.evaluate(() => scrollBy(0, 55));
    await page.waitForTimeout(40);
    if (await pred()) return true;
  }
  return false;
}

async function beat() {
  return page.locator("#shell").getAttribute("data-beat");
}

async function costP() {
  return page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cost-p")) || 0
  );
}

async function returnP() {
  return page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--return-p")) || 0
  );
}

await pinShell();
await page.waitForTimeout(140);
await page.screenshot({ path: path.join(out, "01-target.png") });

// Fluency Ghost mid (cost-p ~0.35–0.5)
await advanceUntil(async () => (await beat()) === "cost");
await advanceUntil(async () => {
  const p = await costP();
  return p >= 0.35 && p <= 0.55;
}, 40);
await page.waitForTimeout(120);
await page.screenshot({ path: path.join(out, "02-fluency-ghost-mid.png") });

// Fluency Ghost dissolved (cost-p high)
await advanceUntil(async () => (await costP()) >= 0.82, 40);
await page.waitForTimeout(120);
await page.screenshot({ path: path.join(out, "03-fluency-ghost-dissolved.png") });

await advanceUntil(async () => (await beat()) === "attempt");
await page.waitForTimeout(140);
await page.screenshot({ path: path.join(out, "04-attempt.png") });

await page
  .getByRole("button", { name: "Bias is about how you sample, not how many." })
  .click();
await page.waitForTimeout(200);

await advanceUntil(async () => (await beat()) === "provenance");
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, "05-provenance-ink.png") });

await advanceUntil(async () => (await beat()) === "bound");
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, "06-contract.png") });

await advanceUntil(async () => (await beat()) === "return");
await advanceUntil(async () => {
  const p = await returnP();
  return p >= 0.35 && p <= 0.55;
}, 50);
await page.waitForTimeout(140);
await page.screenshot({ path: path.join(out, "07-timelapse-mid.png") });

await advanceUntil(async () => (await returnP()) >= 0.95, 60);
await page.waitForTimeout(180);
await page.screenshot({ path: path.join(out, "08-return-naked.png") });

const metrics = await page.evaluate(() => {
  const s = document.getElementById("shell").getBoundingClientRect();
  return {
    stickyTop: Math.round(s.top),
    shellH: Math.round(s.height),
    vh: innerHeight,
    fits: s.bottom <= innerHeight + 2,
    beat: document.getElementById("shell").dataset.beat,
    cue: document.getElementById("cue").textContent,
    costP: getComputedStyle(document.documentElement).getPropertyValue("--cost-p").trim(),
    returnP: getComputedStyle(document.documentElement).getPropertyValue("--return-p").trim(),
    ghostOp: getComputedStyle(document.documentElement).getPropertyValue("--ghost-op").trim(),
    sampleBadge: document.getElementById("sample-badge")?.classList.contains("show"),
    choicePressed: document.querySelector('.choices button[aria-pressed="true"]')?.dataset.choice ?? null,
    tlDay: document.getElementById("tl-day")?.textContent ?? null,
  };
});
fs.writeFileSync(path.join(out, "metrics.json"), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
await browser.close();
