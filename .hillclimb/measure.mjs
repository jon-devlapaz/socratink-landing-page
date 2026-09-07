#!/usr/bin/env node
/**
 * Frozen layout-debt harness for the homepage hillclimb.
 *
 * Metric `debt` (lower is better):
 *   at 390px:  sum(max(0, junctionGap - 96)) + sum(max(0, headingToCard - 56))
 *   at 1280px: same with caps 128 and 72, weighted 0.5
 *   + 1000 * horizontalOverflowPx at 320px
 *
 * Stop when debt === 0 (and the run's iteration floor is met in decision.tsv).
 *
 * Usage:
 *   node .hillclimb/measure.mjs --json
 *   node .hillclimb/measure.mjs --json --probe-inflate
 *   BASE_URL=http://127.0.0.1:3120 node .hillclimb/measure.mjs --json
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3120";
const json = process.argv.includes("--json");
const inflate = process.argv.includes("--probe-inflate");

function pageMetrics(didInflate) {
  const decorative = (el) => {
    const s = getComputedStyle(el);
    return s.position === "fixed" || (s.position === "absolute" && s.pointerEvents === "none");
  };
  const visibleBoxes = (root, selector) =>
    [...root.querySelectorAll(selector)].filter((el) => {
      if (decorative(el)) return false;
      const r = el.getBoundingClientRect();
      return r.height > 4 && r.width > 4;
    });
  const lastBottom = (section) => {
    const els = visibleBoxes(section, "h1,h2,h3,p,a,button,li,.card,.tile,ul,ol,span");
    let max = section.getBoundingClientRect().top;
    for (const el of els) max = Math.max(max, el.getBoundingClientRect().bottom);
    return max;
  };
  const firstTop = (section) => {
    const els = visibleBoxes(section, "h1,h2,h3,.eyebrow,p,.card");
    let min = section.getBoundingClientRect().bottom;
    for (const el of els) min = Math.min(min, el.getBoundingClientRect().top);
    return min;
  };
  const headingToCard = (section) => {
    const h = section.querySelector("h2");
    const card = section.querySelector(".card");
    if (!h || !card) return null;
    return Math.round(card.getBoundingClientRect().top - h.getBoundingClientRect().bottom);
  };
  const sections = [...document.querySelectorAll("main > section")];
  const junctions = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const from =
      sections[i].id || sections[i].querySelector(".eyebrow,.h-sans")?.textContent?.slice(0, 40) || String(i);
    const to =
      sections[i + 1].id ||
      sections[i + 1].querySelector(".eyebrow,.h-sans")?.textContent?.slice(0, 40) ||
      String(i + 1);
    junctions.push({
      from: String(from).trim(),
      to: String(to).trim(),
      gap: Math.round(firstTop(sections[i + 1]) - lastBottom(sections[i])),
    });
  }
  const headingGaps = sections.map((s, i) => ({
    id: s.id || String(i),
    gap: headingToCard(s),
  }));
  return {
    inflate: didInflate,
    overflowX: Math.max(0, Math.round(document.documentElement.scrollWidth - window.innerWidth)),
    junctions,
    headingGaps,
  };
}

function p90(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.ceil(0.9 * s.length) - 1);
  return s[i];
}

function debtFor(sample, junctionCap, headingCap, weight) {
  const j = sample.junctions.reduce((n, x) => n + Math.max(0, x.gap - junctionCap), 0);
  const h = sample.headingGaps.reduce((n, x) => n + Math.max(0, (x.gap ?? 0) - headingCap), 0);
  return weight * (j + h);
}

async function sampleViewport(browser, width, height, extraCss) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => {
    sessionStorage.setItem("socratink-intro-seen", "1");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(400);
  if (extraCss) await page.addStyleTag({ content: extraCss });
  await page.waitForTimeout(extraCss ? 200 : 0);
  const raw = await page.evaluate(pageMetrics, Boolean(extraCss));
  await page.close();
  return raw;
}

async function runOnce(extraCss) {
  const browser = await chromium.launch({ headless: true });
  try {
    const v390 = await sampleViewport(browser, 390, 844, extraCss);
    const v1280 = await sampleViewport(browser, 1280, 800, extraCss);
    const v320 = await sampleViewport(browser, 320, 720, extraCss);
    const debt =
      debtFor(v390, 96, 56, 1) + debtFor(v1280, 128, 72, 0.5) + 1000 * v320.overflowX;
    return {
      debt: Math.round(debt),
      overflowX: v320.overflowX,
      p90_390: p90(v390.junctions.map((j) => j.gap)),
      p90_1280: p90(v1280.junctions.map((j) => j.gap)),
      v390,
      v1280,
      v320: { overflowX: v320.overflowX },
    };
  } finally {
    await browser.close();
  }
}

const measured = await runOnce(null);
let out = { ...measured, sensitive: false };
if (inflate) {
  const blown = await runOnce(
    "main > section { padding-top: 160px !important; padding-bottom: 160px !important; }",
  );
  out = {
    ...measured,
    inflateDebt: blown.debt,
    sensitive: blown.debt > measured.debt + 80,
  };
}

writeFileSync(join(here, inflate ? "probe.json" : "latest.json"), JSON.stringify(out, null, 2));
if (json) {
  process.stdout.write(JSON.stringify(out) + "\n");
} else {
  process.stdout.write(
    `debt=${out.debt} overflowX=${out.overflowX} p90_390=${out.p90_390} p90_1280=${out.p90_1280}` +
      (inflate ? ` inflateDebt=${out.inflateDebt} sensitive=${out.sensitive}` : "") +
      "\n",
  );
}
