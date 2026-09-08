import { chromium } from "playwright-core";
import path from "path";
const out = "scrollcraft/builds/socratink-contract-slip/shots";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:4502/", { waitUntil: "networkidle" });
await p.waitForTimeout(300);
const travel = await p.evaluate(() => document.getElementById("pinWrap").offsetHeight - innerHeight);
await p.evaluate(({ travel }) => window.scrollTo(0, travel * 0.335), { travel });
await p.waitForTimeout(350);
await p.screenshot({ path: path.join(out, "auto-01b-stamp.png") });
console.log(await p.evaluate(() => ({
  panel: document.querySelector(".panel.is-live")?.dataset.panel,
  stamp: getComputedStyle(document.getElementById("stamp")).opacity,
  hint: document.getElementById("ghostHint")?.textContent,
})));
await b.close();
