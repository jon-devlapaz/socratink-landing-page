/**
 * iPhone SE folio sheets: no step numerals, titles clear the nav,
 * copy clear of a 49px Safari tab bar.
 *
 * INK_URL, INK_ARTIFACTS, CHROME_PATH override defaults.
 */
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

const sheets = [
  { id: "how-it-works", name: "map", heading: "A map of the work" },
  { id: "speak", name: "speak", heading: "You speak. It teaches." },
  { id: "keep", name: "keep", heading: "A teacher you keep" },
  { id: "colophon", name: "colophon", heading: null },
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
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
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
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, shot.theme);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    for (const sheet of sheets) {
      await page.locator(`#${sheet.id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const metrics = await page.evaluate(({ id, chromePx }) => {
        const nav = document.querySelector("header");
        const heading = document.querySelector(`#${id} h2, #${id} a`);
        const section = document.getElementById(id);
        const cue = document.querySelector(`#${id} .how-chapter-cue`);
        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, text: (el.innerText || "").replace(/\s+/g, " ").trim() };
        };
        return {
          navBottom: nav?.getBoundingClientRect().bottom ?? 0,
          heading: box(heading),
          section: box(section),
          cue: cue ? cue.textContent : null,
          body: section?.innerText ?? "",
          chromeTop: innerHeight - chromePx,
        };
      }, { id: sheet.id, chromePx: CHROME_PX });

      if (metrics.cue) fail(`${sheet.name}: cue still in DOM (${metrics.cue})`);
      if (/^\s*0[123]\b/m.test(metrics.body) || /\b0[123]\s/.test(metrics.body.slice(0, 80))) {
        fail(`${sheet.name}: step numeral still visible`);
      }
      if (sheet.heading && !metrics.heading?.text.replace(/\s+/g, " ").includes(sheet.heading.replace(/\s+/g, " "))) {
        fail(`${sheet.name}: heading missing (${metrics.heading?.text})`);
      }
      const titleClear = metrics.heading && metrics.heading.top >= metrics.navBottom + 12;
      if (!titleClear) {
        fail(`${sheet.name} ${shot.width} ${shot.theme}: heading under nav (top ${metrics.heading?.top}, nav ${metrics.navBottom})`);
      }
      const limit = metrics.chromeTop - CLEARANCE;
      if (metrics.heading && metrics.heading.bottom > limit) {
        fail(`${sheet.name} ${shot.width} ${shot.theme}: heading under chrome (${metrics.heading.bottom} > ${limit})`);
      }
      const footerLinks = await page.evaluate((chromePx) => {
        if (!document.getElementById("colophon")) return null;
        const links = [...document.querySelectorAll("#colophon .footerLinks a, #colophon footer a")];
        if (!links.length) {
          const any = [...document.querySelectorAll("footer a")];
          return any.map((a) => a.getBoundingClientRect().bottom);
        }
        return links.map((a) => a.getBoundingClientRect().bottom);
      }, CHROME_PX);
      if (sheet.id === "colophon") {
        const bottoms = footerLinks ?? [];
        if (!bottoms.length) fail("colophon: no footer links");
        const worst = Math.max(...bottoms);
        if (worst > limit) fail(`colophon ${shot.width}: footer links under chrome (${worst} > ${limit})`);
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
        navBottom: Math.round(metrics.navBottom),
        chromeTop: metrics.chromeTop,
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
