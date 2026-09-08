import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://127.0.0.1:4502/", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const travel = await p.evaluate(() => document.getElementById("pinWrap").offsetHeight - innerHeight);
for (const f of [0.50, 0.58, 0.61, 0.70]) {
  await p.evaluate(({ travel, f }) => window.scrollTo(0, travel * f), { travel, f });
  await p.waitForTimeout(250);
  const info = await p.evaluate(() => ({
    panel: document.querySelector(".panel.is-live")?.dataset.panel,
    len: document.getElementById("inkInput")?.value?.length,
    full: document.getElementById("inkInput")?.value,
    press: document.getElementById("commitBtn")?.classList.contains("is-press"),
    contract: document.getElementById("contractInk")?.textContent,
  }));
  console.log(f, info.panel, "len=" + info.len, "press=" + info.press);
  console.log("TEXT", info.full);
  console.log("BOUND", info.contract);
}
await b.close();
