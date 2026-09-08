/**
 * Delta A gate — stranger falsifiers §10.2–4 on :4502
 *
 * Prerequisite: serve the spike
 *   cd scrollcraft/builds/socratink-contract-slip && python3 serve.py
 *
 * Run from repo root:
 *   node scrollcraft/builds/socratink-contract-slip/verify-bound.mjs
 */
import { chromium } from "playwright-core";

const BASE = "http://127.0.0.1:4502/";
const NON_INF_RE = /does not establish/i;

let failed = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failed += 1;
}

function pass(msg) {
  console.log("PASS:", msg);
}

async function scrollFraction(page, fraction) {
  const travel = await page.evaluate(
    () => document.getElementById("pinWrap").offsetHeight - innerHeight,
  );
  await page.evaluate(
    ({ travel, fraction }) => window.scrollTo(0, travel * fraction),
    { travel, fraction },
  );
  await page.waitForTimeout(350);
}

async function waitForNonInferences(page) {
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
}

async function assertNonInferences(page, label) {
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (!NON_INF_RE.test(bodyText)) {
    fail(`${label}: DOM missing readable NON-INFERENCE copy (/does not establish/i)`);
    return;
  }
  const count = await page.evaluate(
    () => document.querySelectorAll("[data-non-inference]").length,
  );
  if (count < 3) {
    fail(`${label}: expected ≥3 [data-non-inference] nodes, got ${count}`);
    return;
  }
  pass(`${label}: NON-INFERENCES instrumented (${count} nodes)`);
}

async function assertClaimsRefused(page, label) {
  const refused = await page.evaluate(
    () => document.querySelectorAll(".claim-stamp.is-refused").length,
  );
  if (refused < 3) {
    fail(`${label}: expected 3 refused claim stamps, got ${refused}`);
    return;
  }
  pass(`${label}: Bound claim refusal played (${refused} stamps)`);
}

async function driveToBound(page) {
  await scrollFraction(page, 0.45);
  await scrollFraction(page, 0.72);
  await waitForNonInferences(page);
  await page.waitForTimeout(400);
}

async function testSamplePath(page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await scrollFraction(page, 0.45);

  await page.click("#sampleBtn");
  const badgeOnInk = await page.evaluate(() => {
    const badge = document.getElementById("demoBadge");
    return (
      badge?.classList.contains("show") &&
      /sample trace/i.test(badge.textContent ?? "")
    );
  });
  if (!badgeOnInk) {
    fail("sample: Sample Trace badge not visible after Show a sample");
  } else {
    pass("sample: badge visible on ink beat");
  }

  await driveToBound(page);

  const badgeOnBound = await page.evaluate(() =>
    document.getElementById("demoBadge")?.classList.contains("show"),
  );
  if (!badgeOnBound) {
    fail("sample: Sample Trace badge not visible through Bound");
  } else {
    pass("sample: badge persists through Bound");
  }

  await assertClaimsRefused(page, "sample");
  await assertNonInferences(page, "sample");
}

async function testRefusePath(page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await scrollFraction(page, 0.45);

  await page.click("#refuseBtn");
  const refusalRecorded = await page.evaluate(() => {
    const hint = document.getElementById("inkHint")?.textContent ?? "";
    return /refusal recorded/i.test(hint);
  });
  if (!refusalRecorded) {
    fail("refuse: refusal not recorded on ink beat");
  } else {
    pass("refuse: first-class ink recorded");
  }

  await driveToBound(page);

  const contractRefuse = await page.evaluate(() => {
    const ink = document.getElementById("contractInk");
    return (
      ink?.dataset.inkKind === "refuse" &&
      /don.t know yet/i.test(ink.textContent ?? "")
    );
  });
  if (!contractRefuse) {
    fail("refuse: contract panel missing refuse ink");
  } else {
    pass("refuse: contract shows refuse ink");
  }

  await assertClaimsRefused(page, "refuse");
  await assertNonInferences(page, "refuse");
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await testSamplePath(page);
  await testRefusePath(page);
} catch (err) {
  fail(String(err?.message ?? err));
} finally {
  await browser.close();
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log("\nverify-bound: all checks passed");
process.exit(0);
