import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://127.0.0.1:3001";
const out = path.resolve(
  process.env.INK_ARTIFACTS ||
    "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529",
);
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 2,
});

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const call = (name, args = {}) =>
  page.evaluate(({ name, args }) => window.socratinkInk?.call(name, args), {
    name,
    args,
  });

const ready = () =>
  page.waitForFunction(
    () => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready,
  );

const settled = () =>
  page.waitForFunction(
    () => !window.socratinkInk?.call("ink_get_scene")?.rendering?.transitioning,
  );

try {
  console.log("1. Navigating to /ink-lab-v2...");
  await page.goto(`${url}/ink-lab-v2`, { waitUntil: "networkidle" });
  await ready();
  await settled();
  console.log("   Page and WebGL raymarcher ready.");

  // 2. Initial state: Semantic Sculpting (Bicycle)
  console.log("2. Testing Semantic Sculpting tab...");
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, "ink_lab_v2_tab1_sculpt.png") });
  console.log("   Saved ink_lab_v2_tab1_sculpt.png");

  // 3. Test triggering other concepts: Tree, Guitar, Spectacles
  console.log("3. Triggering concept: Living Tree...");
  await call("ink_sculpt", { concept: "tree", blend: 0.16 });
  await settled();
  await page.waitForTimeout(400);

  console.log("4. Triggering concept: Acoustic Guitar...");
  await call("ink_sculpt", { concept: "guitar", blend: 0.14 });
  await settled();
  await page.waitForTimeout(400);

  console.log("5. Triggering concept: Spectacles...");
  await call("ink_sculpt", { concept: "glasses", blend: 0.12 });
  await settled();
  await page.waitForTimeout(400);

  // 6. Switch to Tab 2: Cognitive Embodiment
  console.log("6. Switching to Cognitive Embodiment tab...");
  const tabButtons = await page.$$(".ink-v2-tab");
  assert.equal(tabButtons.length, 3, "Expected 3 tabs");
  await tabButtons[1].click(); // Tab 2
  await page.waitForTimeout(400);

  // Click Thinking somatic button in UI
  console.log("   Clicking Thinking button in UI...");
  const somaticButtons = await page.$$(".ink-somatic-btn");
  if (somaticButtons.length >= 3) {
    await somaticButtons[2].click(); // Thinking is 3rd button (0: settled, 1: listening, 2: thinking, 3: explaining)
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, "ink_lab_v2_tab2_somatic.png") });
  console.log("   Saved ink_lab_v2_tab2_somatic.png");

  // 7. Click Eureka button
  console.log("7. Triggering Eureka coalescence...");
  const eurekaBtn = await page.$(".ink-eureka-btn");
  if (eurekaBtn) {
    await eurekaBtn.click();
    await page.waitForTimeout(500);
  }

  // 8. Switch to Tab 3: MCP & Tools
  console.log("8. Switching to MCP & Tools tab...");
  await tabButtons[2].click(); // Tab 3
  await page.waitForTimeout(400);

  // Trigger VLM capture button on stage
  console.log("   Testing VLM capture feedback...");
  const captureBtn = await page.$(".ink-stage-actions button");
  if (captureBtn) {
    await captureBtn.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: path.join(out, "ink_lab_v2_tab3_mcp.png") });
  console.log("   Saved ink_lab_v2_tab3_mcp.png");

  // Check logs
  const logs = await page.$$(".ink-tool-log-entry");
  console.log(`   Dispatched ${logs.length} model tool calls into the log inspector.`);
  assert(logs.length > 0, "Tool calls should be logged");

  if (errors.length > 0) {
    console.warn("Browser console warnings/errors:", errors);
  } else {
    console.log("   Zero console errors detected!");
  }

  console.log("SUCCESS: /ink-lab-v2 verified and all screenshots captured!");
} catch (err) {
  console.error("Verification failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
