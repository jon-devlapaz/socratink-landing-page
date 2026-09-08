/**
 * Production Encounter smoke — contract-slip Bound + NON-INFERENCES.
 *
 * Prerequisite: `pnpm dev` on :3000
 * Run: node scripts/verify-encounter-bound.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000/";

let failed = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}

function pass(msg) {
  console.log("PASS:", msg);
}

async function scrollEncounterFraction(page, fraction) {
  await page.evaluate((fraction) => {
    const track = document.querySelector('[data-encounter="contract-slip"]');
    const shell = document.querySelector(".encounter-shell");
    if (!track || !shell) return;
    const rect = track.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
    window.scrollTo(0, top + travel * fraction);
  }, fraction);
  await page.waitForTimeout(450);
}

async function waitForBoundComplete(page) {
  await page.waitForFunction(
    () => document.querySelector(".encounter-panel.is-live")?.dataset.panel === "contract",
    { timeout: 12000 },
  );
  await page.waitForFunction(
    () => {
      const list = document.getElementById("nonInferenceList");
      return (
        list &&
        !list.hidden &&
        list.querySelectorAll("[data-non-inference]").length >= 3
      );
    },
    { timeout: 12000 },
  );
  await page.waitForFunction(
    () => document.querySelectorAll(".encounter-noninf li.is-revealed").length >= 3,
    { timeout: 12000 },
  );
}

async function assertSingleRefuseSurface(page) {
  const stampRefused = await page.evaluate(
    () => document.querySelectorAll(".encounter-claim-stamp.is-refused").length,
  );
  if (stampRefused > 0) {
    fail(`production: stamp refuse echo (${stampRefused} is-refused stamps)`);
  } else {
    pass("production: no duplicate stamp refuse (single climax surface)");
  }

  const readable = await page.evaluate(() =>
    /does not establish/i.test(document.body.innerText),
  );
  if (!readable) {
    fail("production: missing readable NON-INFERENCE copy");
  } else {
    pass("production: NON-INFERENCES readable in DOM");
  }
}

async function assertNoGhostStamp(page) {
  const stamp = await page.evaluate(() => {
    const text = document.body.innerText;
    return /AI FLUENCY/i.test(text) || !!document.querySelector(".ghost-stamp");
  });
  if (stamp) {
    fail("production: Ghost stamp present (should be cut)");
  } else {
    pass("production: no Ghost stamp");
  }
}

async function testSamplePath(page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await scrollEncounterFraction(page, 0.45);
  await page.click("#sampleBtn");

  const badgeOnInk = await page.evaluate(() =>
    document.getElementById("demoBadge")?.classList.contains("show"),
  );
  if (!badgeOnInk) fail("sample: badge not visible on ink");
  else pass("sample: badge visible on ink");

  await scrollEncounterFraction(page, 0.72);
  await waitForBoundComplete(page);
  await assertSingleRefuseSurface(page);

  const badgeOnBound = await page.evaluate(() =>
    document.getElementById("demoBadge")?.classList.contains("show"),
  );
  if (!badgeOnBound) fail("sample: badge not visible through Bound");
  else pass("sample: badge persists through Bound");

  const condText = await page.evaluate(
    () => document.getElementById("contractCond")?.textContent?.trim() ?? "",
  );
  if (condText) fail(`sample: footer twin honesty should be cut (got "${condText}")`);
  else pass("sample: no footer twin honesty on contract line");

  const boundHint = await page.evaluate(() => {
    const panel = document.getElementById("panelContract");
    return panel?.querySelector(".encounter-hint")?.textContent?.trim() ?? "";
  });
  if (/claims try to land/i.test(boundHint)) {
    fail("sample: Bound hint should not appear on Sample Trace path");
  } else {
    pass("sample: Bound hint cut on Sample Trace path");
  }

  const slipStoresNothing = await page.evaluate(() => {
    const slip = document.getElementById("slip");
    return /stores nothing/i.test(slip?.textContent ?? "");
  });
  if (slipStoresNothing) {
    fail("sample: stores-nothing should not peak on Sample Trace slip");
  } else {
    pass("sample: stores-nothing off Sample Trace slip");
  }

  const count = await page.evaluate(
    () => document.querySelectorAll("[data-non-inference]").length,
  );
  if (count < 3) fail(`sample: expected ≥3 non-inference nodes, got ${count}`);
  else pass(`sample: NON-INFERENCES in DOM (${count})`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await assertNoGhostStamp(page);
  await testSamplePath(page);
} catch (err) {
  fail(String(err?.message ?? err));
} finally {
  await browser.close();
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log("\nverify-encounter-bound: all checks passed");
process.exit(0);
