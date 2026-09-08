import { chromium } from "playwright-core";
import path from "path";
const out = "scrollcraft/builds/socratink-contract-slip/shots";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:4502/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const travel = await p.evaluate(() => document.getElementById("pinWrap").offsetHeight - innerHeight);
const fracs = [["v4-03b-void-stamp", 0.375], ["v4-03c-void-late", 0.379]];
for (const [name, f] of fracs) {
  await p.evaluate(({ travel, f }) => window.scrollTo(0, travel * f), { travel, f });
  await p.waitForTimeout(350);
  await p.screenshot({ path: path.join(out, name + ".png") });
  const info = await p.evaluate(() => ({
    panel: document.querySelector(".panel.is-live")?.dataset.panel,
    hint: document.getElementById("ghostHint")?.textContent,
    stampOp: getComputedStyle(document.getElementById("stamp")).opacity,
  }));
  console.log(name, info);
}
await b.close();
