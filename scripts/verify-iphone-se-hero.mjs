/**
 * iPhone SE title page: CTAs and subline sit above a 49px Safari tab bar
 * on 375×667 and 320×568, light and dark. Rest-form ink stays a disc.
 *
 * INK_URL, INK_ARTIFACTS, CHROME_PATH override defaults.
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = path.resolve(
  process.env.INK_ARTIFACTS ||
    "/Users/jondev/Library/Application Support/Cursor/AgentStores/cursor_agent_stores/bc-edfc75ec-0dca-4fb1-b60b-81343f438eef/files/media/iphone-se",
);
const CHROME_PX = 49;
const CLEARANCE = 8;
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const shots = [
  { name: "375-light", width: 375, height: 667, theme: "light" },
  { name: "375-dark", width: 375, height: 667, theme: "dark" },
  { name: "320-light", width: 320, height: 568, theme: "light" },
  { name: "320-dark", width: 320, height: 568, theme: "dark" },
];

const report = [];

function fail(message) {
  console.error("FAIL:", message);
  throw new Error(message);
}

try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
      colorScheme: shot.theme,
    });
    await page.addInitScript((theme) => {
      localStorage.setItem("socratink-theme", theme);
      document.documentElement.dataset.theme = theme;
    }, shot.theme);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, shot.theme);
    await page.waitForSelector(".hero-actions");
    await page.waitForFunction(
      () => document.querySelector(".hero-living-ink .ink-render")?.dataset.inkReady === "true",
      null,
      { timeout: 8000 },
    ).catch(() => {});
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.waitForTimeout(400);

    const metrics = await page.evaluate((chromePx) => {
      const actions = document.querySelector(".hero-actions");
      const subline = document.querySelector(".hero-subline");
      const primary = document.querySelector(".hero-actions .btn-accent");
      const secondary = document.querySelector(".hero-actions .hero-secondary");
      const blob = document.querySelector(".hero-subject .sphere");
      const ink = document.querySelector(".hero-living-ink");
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          width: r.width,
          text: (el.innerText || "").replace(/\s+/g, " ").trim(),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
        };
      };
      return {
        viewport: { w: innerWidth, h: innerHeight },
        dvh: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("min-height")) || null,
        heroPad: getComputedStyle(document.querySelector(".hero-act")).paddingBottom,
        heroMin: getComputedStyle(document.querySelector(".hero-act")).minHeight,
        actions: box(actions),
        subline: box(subline),
        primary: box(primary),
        secondary: box(secondary),
        blob: box(blob),
        form: ink?.getAttribute("aria-label") ?? "",
        chromeTop: innerHeight - chromePx,
      };
    }, CHROME_PX);

    const limit = metrics.viewport.h - CHROME_PX - CLEARANCE;
    const blobOk =
      metrics.blob &&
      metrics.blob.display !== "none" &&
      metrics.blob.visibility !== "hidden" &&
      Number(metrics.blob.opacity) > 0 &&
      metrics.blob.height >= 80;
    const actionsClear = metrics.actions && metrics.actions.bottom <= limit;
    const sublineClear = metrics.subline && metrics.subline.bottom <= limit;
    const labels =
      metrics.primary?.text.includes("Start learning") &&
      metrics.secondary?.text.includes("See how it works") &&
      metrics.subline?.text.includes("You think · One teacher · It stays");
    const restDisc = /Living ink, sphere/.test(metrics.form) || metrics.form === "Ink sphere";
    const inkBelowCta = metrics.blob && metrics.actions && metrics.blob.top >= metrics.actions.bottom - 4;

    await page.evaluate((chromePx) => {
      const bar = document.createElement("div");
      bar.id = "se-safari-chrome";
      bar.setAttribute("aria-hidden", "true");
      Object.assign(bar.style, {
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "0",
        height: `${chromePx}px`,
        zIndex: "99999",
        pointerEvents: "none",
        background: "color-mix(in srgb, #1c1c1e 92%, transparent)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 1.25rem",
        color: "rgba(255,255,255,0.55)",
        font: "600 11px/1 -apple-system, system-ui, sans-serif",
        letterSpacing: "0.04em",
      });
      bar.textContent = "Safari";
      document.body.appendChild(bar);
    }, CHROME_PX);

    const file = path.join(out, `${shot.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    report.push({ shot: shot.name, metrics, actionsClear, sublineClear, blobOk, labels, restDisc, inkBelowCta, file });

    if (!labels) fail(`${shot.name}: kept copy missing ${JSON.stringify({
      primary: metrics.primary?.text, secondary: metrics.secondary?.text, subline: metrics.subline?.text,
    })}`);
    if (!blobOk) fail(`${shot.name}: blob hidden or too small ${JSON.stringify(metrics.blob)}`);
    if (!actionsClear) {
      fail(`${shot.name}: actions bottom ${metrics.actions?.bottom} under chrome (limit ${limit})`);
    }
    if (!sublineClear) {
      fail(`${shot.name}: subline bottom ${metrics.subline?.bottom} under chrome (limit ${limit})`);
    }
    if (!restDisc) fail(`${shot.name}: rest form is not the disc (${metrics.form})`);
    if (!inkBelowCta) {
      fail(`${shot.name}: ink should sit below the CTAs (blob top ${metrics.blob?.top}, actions bottom ${metrics.actions?.bottom})`);
    }
    console.log(`PASS ${shot.name}`, {
      actionsBottom: Math.round(metrics.actions.bottom),
      sublineBottom: Math.round(metrics.subline.bottom),
      blobTop: Math.round(metrics.blob.top),
      chromeTop: metrics.chromeTop,
      blob: Math.round(metrics.blob.height),
      pad: metrics.heroPad,
      min: metrics.heroMin,
    });
    await page.close();
  }

  await fs.writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  console.log("stills", report.map((row) => row.file));
} finally {
  await browser.close();
}
