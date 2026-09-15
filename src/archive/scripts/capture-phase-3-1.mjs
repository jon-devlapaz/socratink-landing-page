import { chromium } from "playwright-core";
import { join } from "node:path";

const outDir = "/Users/jondev/dev/active/socratink-landing/docs/north-star-scroll-hillclimb-reviews/phase-3-1";
const url = "http://127.0.0.1:3101/";

const browser = await chromium.launch({ headless: true });

async function captureSet({ width, height, isMobile = false, reducedMotion = "no-preference", prefix }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reducedMotion === "reduce" ? "reduce" : "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Measure section bounds
  const bounds = await page.evaluate(() => {
    const track = document.getElementById("how-it-works");
    if (!track) return null;
    const sticky = track.querySelector(".how-sticky");
    const rect = track.getBoundingClientRect();
    const navTop = window.innerWidth >= 768 ? 80 : 64;
    const stickyHeight = sticky ? sticky.offsetHeight : window.innerHeight - navTop;
    const stickyTop = Math.min(navTop, window.innerHeight - stickyHeight - 12);
    const totalTravel = rect.height - stickyHeight;
    const trackAbsTop = window.scrollY + rect.top;
    return { trackAbsTop, stickyTop, totalTravel };
  });

  if (!bounds) throw new Error("Could not find #how-it-works");

  async function scrollToProgress(p) {
    const scrollY = bounds.trackAbsTop - bounds.stickyTop + (bounds.totalTravel * p);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(600);
  }

  // 1. Entry state (p = 0.05)
  await scrollToProgress(0.05);
  await page.screenshot({ path: join(outDir, `${prefix}-entry.png`) });
  console.log(`Captured ${prefix}-entry.png`);

  // 2. Middle state (p = 0.45)
  await scrollToProgress(0.45);
  await page.screenshot({ path: join(outDir, `${prefix}-middle.png`) });
  console.log(`Captured ${prefix}-middle.png`);

  // 3. Rest state (p = 0.85)
  await scrollToProgress(0.85);
  await page.screenshot({ path: join(outDir, `${prefix}-rest.png`) });
  console.log(`Captured ${prefix}-rest.png`);

  // 4. Reverse state (scroll back to p = 0.45)
  await scrollToProgress(0.45);
  await page.screenshot({ path: join(outDir, `${prefix}-reverse.png`) });
  console.log(`Captured ${prefix}-reverse.png`);

  await context.close();
}

try {
  console.log("Capturing Desktop 1440...");
  await captureSet({ width: 1440, height: 900, prefix: "desktop-1440" });

  console.log("Capturing Phone 390...");
  await captureSet({ width: 390, height: 844, isMobile: true, prefix: "phone-390" });

  console.log("Capturing Reduced Motion 1440...");
  await captureSet({ width: 1440, height: 900, reducedMotion: "reduce", prefix: "reduced-1440" });

  console.log("All captures complete!");
} finally {
  await browser.close();
}
