import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = "/Users/jondev/.gemini/antigravity/brain/d0589e6c-8c45-4a2a-9880-774c2de9bc97/screenshots/prototypes_spike";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(600);

  const memory = desktop.locator("#memory");
  await memory.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(400);

  // --- PROTOTYPE 1: INK TRANSFORMATION ---
  // Default Day 1
  await desktop.mouse.move(0, 0);
  await memory.screenshot({ path: join(outDir, "p1_ink_day01.png") });
  console.log("Captured p1_ink_day01.png");

  // Day 14
  await desktop.click("button:has-text('Day 14 · Unaided')");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "p1_ink_day14.png") });
  console.log("Captured p1_ink_day14.png");

  // --- PROTOTYPE 2: CAUSAL REASONING MAP ---
  await desktop.click("button:has-text('2 · Causal Reasoning Map')");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  // Default Day 1 Entangled
  await memory.screenshot({ path: join(outDir, "p2_graph_day01.png") });
  console.log("Captured p2_graph_day01.png");

  // Day 14 Decoupled
  await desktop.click("button:has-text('Day 14 · Decoupled')");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "p2_graph_day14.png") });
  console.log("Captured p2_graph_day14.png");

  // --- PROTOTYPE 3: ARCHIVAL CARD STACK ---
  await desktop.click("button:has-text('3 · Archival Card Stack')");
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "p3_stack_default.png") });
  console.log("Captured p3_stack_default.png");

  // Click Day 14 slip
  await desktop.click("button[aria-label='View Day 14 Unaided Check slip']", { force: true });
  await desktop.mouse.move(0, 0);
  await desktop.waitForTimeout(300);
  await memory.screenshot({ path: join(outDir, "p3_stack_day14.png") });
  console.log("Captured p3_stack_day14.png");

  // --- MOBILE SCREENSHOT (Prototype 1 & 3) ---
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(600);
  const memoryMobile = mobile.locator("#memory");
  await memoryMobile.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(400);

  // Mobile P1
  await memoryMobile.screenshot({ path: join(outDir, "mobile_p1_ink.png") });
  console.log("Captured mobile_p1_ink.png");

  // Mobile P2
  await mobile.click("button:has-text('2 · Causal Reasoning Map')");
  await mobile.waitForTimeout(300);
  await memoryMobile.screenshot({ path: join(outDir, "mobile_p2_graph.png") });
  console.log("Captured mobile_p2_graph.png");

  // Mobile P3
  await mobile.click("button:has-text('3 · Archival Card Stack')");
  await mobile.waitForTimeout(300);
  await memoryMobile.screenshot({ path: join(outDir, "mobile_p3_stack.png") });
  console.log("Captured mobile_p3_stack.png");

  await mobile.close();
  await desktop.close();
} finally {
  await browser.close();
}
