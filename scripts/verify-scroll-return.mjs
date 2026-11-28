// Run against a built site with INK_URL. Screenshots and report.json go to INK_ARTIFACTS.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices, webkit } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || "artifacts/scroll-return");
const engine = process.env.CHROME_PATH ? chromium : webkit;
const browser = await engine.launch({ executablePath: process.env.CHROME_PATH });
const report = { url, browser: engine.name(), version: browser.version(), checks: [] };
const hero = [".hero-title", ".hero-copy > p", ".hero-subline", ".hero-actions .start-learning", ".hero-secondary"];
const chapters = ["how-it-works", "speak", "keep"];
const closing = "#colophon .start-learning";
await fs.mkdir(out, { recursive: true });

async function checkTheme(theme) {
  const page = await browser.newPage({ ...devices["iPhone 13"], colorScheme: theme });
  function record(step, pass, details) {
    report.checks.push({ theme, step, pass, details });
    console.log(pass ? "PASS" : "FAIL", theme, step);
  }
  async function capture(step, selectors) {
    const elements = await page.evaluate((selectors) => selectors.map((selector) => {
      const el = document.querySelector(selector);
      if (!el) return { selector, visible: false };
      const rect = el.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      let opacity = 1;
      for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      const visible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= innerHeight
        && getComputedStyle(el).visibility === "visible" && opacity >= 0.99 && el.contains(hit);
      return { selector, text: el.innerText, visible, opacity, top: rect.top, bottom: rect.bottom };
    }), selectors);
    await page.screenshot({ path: path.join(out, theme + "-" + step + ".png"), scale: "css" });
    record(step, elements.every((el) => el.visible), elements);
  }
  async function scrollTo(y) {
    await page.evaluate((top) => {
      window.scrollTo({ top, behavior: "instant" });
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, y);
  }
  async function returnToTop(step) {
    // Read in the same frame as the jump, before a stale exit animation can catch up.
    const atTop = await page.evaluate(async () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      const first = { y: scrollY, opacity: getComputedStyle(document.querySelector("h1")).opacity };
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return first;
    });
    record(step + "-immediate", atTop.y === 0 && atTop.opacity === "1", atTop);
    await capture(step, hero);
  }
  try {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await capture("fresh", hero);
    const stops = await page.evaluate(({ chapters, closing }) => ({
      headerCrossing: document.querySelector("h1").getBoundingClientRect().top
        - document.querySelector("header").getBoundingClientRect().bottom + 3,
      chapters: chapters.map((id) => Math.ceil(document.getElementById(id).closest(".folio-section-track").getBoundingClientRect().top)),
      closing: Math.round(document.querySelector(closing).getBoundingClientRect().bottom - innerHeight + 6),
    }), { chapters, closing });
    await scrollTo(stops.headerCrossing);
    const opacity = await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity);
    record("title-clears-header", opacity === "0", { opacity });
    for (const [i, id] of chapters.entries()) {
      // At the last chapter's top the closing action may already have entered the viewport.
      await scrollTo(Math.min(stops.chapters[i], stops.closing));
      await capture("down-" + id, ["#" + id + " h2"]);
    }
    await scrollTo(stops.closing);
    await page.waitForTimeout(1500); // Allow the lazy scroll handler and its entrance animation to settle.
    await capture("closing", [closing]);
    await returnToTop("return");

    await scrollTo(stops.closing);
    // WebKit records the scroll position for history after scrolling stops.
    await page.waitForTimeout(500);
    const before = await page.evaluate(() => scrollY);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    const restored = await page.evaluate(() => scrollY);
    record("reload-restores-scroll", before > 0 && Math.abs(restored - before) <= 1, { before, restored });
    await capture("restored-closing", [closing]);
    await returnToTop("restored-return");

    await scrollTo(stops.chapters.at(-1));
    for (const [i, id] of [...chapters.entries()].reverse()) {
      await scrollTo(stops.chapters[i]);
      await capture("up-" + id, ["#" + id + " h2"]);
    }
    await returnToTop("after-chapters");
  } finally {
    await page.close();
  }
}

try {
  for (const theme of ["light", "dark"]) await checkTheme(theme);
} finally {
  await browser.close();
  await fs.writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
}
if (report.checks.some((check) => !check.pass)) process.exitCode = 1;
