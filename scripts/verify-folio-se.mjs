/**
 * iPhone SE folio sheets: titles clear the nav,
 * marks and colophon footer links clear of a 49px Safari tab bar.
 *
 * INK_URL, INK_ARTIFACTS, CHROME_PATH override defaults.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const cloudStore = "/cursor/stores/bc-edfc75ec-0dca-4fb1-b60b-81343f438eef/media/iphone-se";
const macStore =
  "/Users/jondev/Library/Application Support/Cursor/AgentStores/cursor_agent_stores/bc-edfc75ec-0dca-4fb1-b60b-81343f438eef/files/media/iphone-se";
const out = path.resolve(
  process.env.INK_ARTIFACTS ||
    (await fs.access(cloudStore).then(() => cloudStore).catch(() => macStore)),
);
const CHROME_PX = 49;
const CLEARANCE = 8;
const isMac = os.platform() === "darwin";
await fs.mkdir(out, { recursive: true });

const sheets = [
  { id: "how-it-works", name: "map" },
  { id: "speak", name: "speak" },
  { id: "keep", name: "keep" },
  { id: "colophon", name: "colophon" },
];

const shots = [
  { width: 375, height: 667, theme: "light" },
  { width: 375, height: 667, theme: "dark" },
  { width: 320, height: 568, theme: "light" },
];

function fail(message) {
  console.error("FAIL:", message);
  throw new Error(message);
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    (isMac
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome"),
  headless: true,
  args: isMac
    ? ["--use-gl=angle", "--use-angle=metal"]
    : ["--no-sandbox", "--disable-dev-shm-usage"],
});

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
    await page.evaluate(async (theme) => {
      document.documentElement.dataset.theme = theme;
      if (document.fonts?.ready) await document.fonts.ready;
    }, shot.theme);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    for (const sheet of sheets) {
      await page.evaluate((id) => {
        window.scrollTo({ top: 0, behavior: "instant" });
        const top = document.getElementById(id).closest(".folio-section-track").getBoundingClientRect().top;
        window.scrollTo({ top: Math.ceil(top), behavior: "instant" });
      }, sheet.id);
      await page.waitForTimeout(350);
      if (sheet.id !== "colophon") {
        await page.waitForFunction((id) => {
          const mark = document.querySelector(`#${id} [data-study]`);
          return mark?.dataset.inkReady === "true" && mark.dataset.inkEntrance === "settled";
        }, sheet.id);
      }
      const metrics = await page.evaluate(({ id, chromePx }) => {
        const nav = document.querySelector("header");
        const heading = document.querySelector(`#${id} h2, #${id} a`);
        const mark = document.querySelector(`#${id} .how-map, #${id} [data-chapter-ink]`);
        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        };
        return {
          navBottom: nav?.getBoundingClientRect().bottom ?? 0,
          heading: box(heading),
          mark: box(mark),
          chromeTop: innerHeight - chromePx,
        };
      }, { id: sheet.id, chromePx: CHROME_PX });

      const titleClear = metrics.heading && metrics.heading.top >= metrics.navBottom + 12;
      if (!titleClear) {
        fail(`${sheet.name} ${shot.width} ${shot.theme}: heading under nav (top ${metrics.heading?.top}, nav ${metrics.navBottom})`);
      }
      const limit = metrics.chromeTop - CLEARANCE;
      if (metrics.heading && metrics.heading.bottom > limit) {
        fail(`${sheet.name} ${shot.width} ${shot.theme}: heading under chrome (${metrics.heading.bottom} > ${limit})`);
      }
      if (metrics.mark && metrics.mark.bottom > limit) {
        fail(`${sheet.name} ${shot.width} ${shot.theme}: mark under chrome (${metrics.mark.bottom} > ${limit})`);
      }
      const footerLinks = await page.evaluate(() => {
        if (!document.getElementById("colophon")) return null;
        const links = [...document.querySelectorAll("#colophon footer a")];
        return links.map((a) => a.getBoundingClientRect().bottom);
      });
      if (sheet.id === "colophon") {
        const bottoms = footerLinks ?? [];
        if (!bottoms.length) fail("colophon: no footer links");
        const worst = Math.max(...bottoms);
        if (worst > limit) fail(`colophon ${shot.width}: footer links under chrome (${worst} > ${limit})`);
        const signature = await page.locator("[data-printers-mark]").evaluate((mark) => {
          const rect = mark.getBoundingClientRect();
          const text = mark.previousElementSibling.getBoundingClientRect();
          return { gap: rect.top - text.bottom, inset: rect.left - text.left, bottom: rect.bottom, right: rect.right };
        });
        if (signature.gap < 20 || signature.gap > 32 || signature.inset < -16 || signature.inset > 0) {
          fail(`colophon ${shot.width}: signature must sit below and align with the closing copy ${JSON.stringify(signature)}`);
        }
        if (signature.bottom > limit || signature.right > shot.width) fail(`colophon ${shot.width}: signature outside usable viewport`);
      }

      await page.evaluate((chromePx) => {
        let bar = document.getElementById("se-safari-chrome");
        if (!bar) {
          bar = document.createElement("div");
          bar.id = "se-safari-chrome";
          bar.setAttribute("aria-hidden", "true");
          Object.assign(bar.style, {
            position: "fixed", left: "0", right: "0", bottom: "0", height: `${chromePx}px`,
            zIndex: "99999", pointerEvents: "none",
            background: "color-mix(in srgb, #1c1c1e 92%, transparent)",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.55)",
            font: "600 11px/1 -apple-system, system-ui, sans-serif",
          });
          bar.textContent = "Safari";
          document.body.appendChild(bar);
        }
      }, CHROME_PX);

      const file = path.join(out, `folio-${sheet.name}-${shot.width}-${shot.theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("PASS", path.basename(file), {
        headingTop: Math.round(metrics.heading?.top ?? 0),
        markBottom: Math.round(metrics.mark?.bottom ?? 0),
        navBottom: Math.round(metrics.navBottom),
        chromeTop: metrics.chromeTop,
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
