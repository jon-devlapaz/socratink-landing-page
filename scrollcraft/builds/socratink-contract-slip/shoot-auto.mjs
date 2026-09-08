import { chromium } from "playwright-core";
import path from "path";
const out = "scrollcraft/builds/socratink-contract-slip/shots";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:4502/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const travel = await p.evaluate(() => document.getElementById("pinWrap").offsetHeight - innerHeight);
async function go(f) {
  await p.evaluate(({ travel, f }) => window.scrollTo(0, travel * f), { travel, f });
  await p.waitForTimeout(200);
}
await go(0.32);
await p.waitForTimeout(200);
await p.screenshot({ path: path.join(out, "auto-01-void.png") });
const voidInfo = await p.evaluate(() => ({
  panel: document.querySelector(".panel.is-live")?.dataset.panel,
  stamp: getComputedStyle(document.getElementById("stamp")).opacity,
  badge: document.getElementById("demoBadge")?.classList.contains("show"),
}));
console.log("void", voidInfo);

await go(0.45);
// wait for mid typing without scrubbing
await p.waitForTimeout(1200);
await p.screenshot({ path: path.join(out, "auto-02-type.png") });
const mid = await p.evaluate(() => ({
  panel: document.querySelector(".panel.is-live")?.dataset.panel,
  len: document.getElementById("inkInput")?.value?.length,
  badge: document.getElementById("demoBadge")?.classList.contains("show"),
  val: document.getElementById("inkInput")?.value,
}));
console.log("type", mid);

// stay on ink until commit completes
await p.waitForFunction(() => {
  const btn = document.getElementById("commitBtn");
  const v = document.getElementById("inkInput")?.value || "";
  return btn?.classList.contains("is-press") && v.length > 70;
}, { timeout: 8000 });
await p.screenshot({ path: path.join(out, "auto-03-commit.png") });
const committed = await p.evaluate(() => ({
  len: document.getElementById("inkInput")?.value?.length,
  press: document.getElementById("commitBtn")?.classList.contains("is-press"),
  badge: document.getElementById("demoBadge")?.classList.contains("show"),
  hint: document.getElementById("inkHint")?.textContent,
}));
console.log("commit", committed);

await go(0.72);
await p.waitForTimeout(250);
await p.screenshot({ path: path.join(out, "auto-04-bound.png") });
const bound = await p.evaluate(() => ({
  panel: document.querySelector(".panel.is-live")?.dataset.panel,
  badge: document.getElementById("demoBadge")?.classList.contains("show"),
  badgeText: document.getElementById("demoBadge")?.textContent,
  contract: document.getElementById("contractInk")?.textContent,
  cond: document.getElementById("contractCond")?.textContent,
}));
console.log("bound", bound);
await b.close();
