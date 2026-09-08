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
  await p.waitForTimeout(220);
}
await go(0.02);
await p.screenshot({ path: path.join(out, "rail-01-cold.png") });
await go(0.33);
await p.screenshot({ path: path.join(out, "rail-02-void.png") });
await go(0.45);
await p.waitForTimeout(1400);
await p.screenshot({ path: path.join(out, "rail-03-type.png") });
await p.waitForFunction(() => document.getElementById("commitBtn")?.classList.contains("is-press"), { timeout: 8000 }).catch(() => {});
await p.screenshot({ path: path.join(out, "rail-04-commit.png") });
await go(0.72);
await p.waitForTimeout(250);
await p.screenshot({ path: path.join(out, "rail-05-bound.png") });
const info = await p.evaluate(() => ({
  hasRail: !!document.querySelector(".rail-stage"),
  label: document.querySelector(".rail-label")?.textContent,
  panel: document.querySelector(".panel.is-live")?.dataset.panel,
  badge: document.getElementById("demoBadge")?.classList.contains("show"),
}));
console.log(info);
await b.close();
