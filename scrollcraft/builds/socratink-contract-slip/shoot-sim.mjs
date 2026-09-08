import { chromium } from "playwright-core";
import path from "path";
const out = "scrollcraft/builds/socratink-contract-slip/shots";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:4502/", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const travel = await p.evaluate(() => document.getElementById("pinWrap").offsetHeight - innerHeight);
const fracs = [
  ["sim-01-void", 0.34],
  ["sim-02-type-mid", 0.48],
  ["sim-03-type-full", 0.56],
  ["sim-04-commit", 0.60],
  ["sim-05-contract", 0.70],
  ["sim-06-exit", 0.90],
];
for (const [name, f] of fracs) {
  await p.evaluate(({ travel, f }) => window.scrollTo(0, travel * f), { travel, f });
  await p.waitForTimeout(320);
  await p.screenshot({ path: path.join(out, name + ".png") });
  const info = await p.evaluate(() => ({
    panel: document.querySelector(".panel.is-live")?.dataset.panel,
    val: document.getElementById("inkInput")?.value?.slice(0, 40),
    badge: document.getElementById("demoBadge")?.textContent,
    cond: document.getElementById("contractCond")?.textContent,
  }));
  console.log(name, info);
}
await b.close();
