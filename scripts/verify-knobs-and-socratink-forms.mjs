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
  console.log("   Page ready.");

  // 2. Verify initial sculpt is now Dipped Nib
  const initScene = await call("ink_get_scene");
  console.log(`   Initial scene: "${initScene.scene.name}" (blend: ${initScene.scene.blend})`);
  assert(initScene.scene.name.includes("Dipped Nib"), "Expected initial scene to be Dipped Nib");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "sculpt_socratink_quill.png") });
  console.log("   Saved sculpt_socratink_quill.png");

  // 3. Test and capture each Socratink concept:
  const socratinkForms = [
    { key: "balance", file: "sculpt_socratink_balance.png", expected: "Dialectic Balance" },
    { key: "aporia", file: "sculpt_socratink_aporia.png", expected: "Aporia Knot" },
    { key: "codex", file: "sculpt_socratink_codex.png", expected: "Open Codex" },
    { key: "chiral", file: "sculpt_socratink_chiral.png", expected: "Chiral Specimen" },
  ];

  for (const item of socratinkForms) {
    console.log(`   Clicking concept: ${item.expected}...`);
    // Find the button with this label in the UI
    await page.evaluate((k) => {
      const buttons = Array.from(document.querySelectorAll(".ink-sculpt-actions button"));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes(k.expected) || b.getAttribute("title")?.includes(k.expected));
      if (btn) btn.click();
    }, item);

    await settled();
    await page.waitForTimeout(400);
    const currScene = await call("ink_get_scene");
    console.log(`     Active scene: "${currScene.scene.name}"`);
    assert(currScene.scene.name.includes(item.expected), `Expected scene to include ${item.expected}`);
    await page.screenshot({ path: path.join(out, item.file) });
    console.log(`     Saved ${item.file}`);
  }

  // 4. CRITICAL VERIFICATION: Knobs must NOT revert to bicycle!
  console.log("\n4. TESTING SURFACE TENSION SLIDER KNOB BEHAVIOR...");

  // Select "balance" (Dialectic Balance)
  console.log("   Selecting 'Dialectic Balance'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll(".ink-sculpt-actions button"));
    const btn = buttons.find((b) => b.textContent?.includes("Dialectic Balance"));
    if (btn) btn.click();
  });
  await settled();

  let sceneBefore = await call("ink_get_scene");
  console.log(`   Before slider movement: "${sceneBefore.scene.name}" (blend: ${sceneBefore.scene.blend})`);
  assert(sceneBefore.scene.name.includes("Dialectic Balance"));

  // Helper to trigger React range slider input correctly
  const setSlider = async (val) => {
    await page.evaluate((v) => {
      const el = document.querySelector("#blend-slider");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, val);
    await page.waitForTimeout(300);
  };

  // Move the blend slider to 0.28
  console.log("   Dragging blend slider to 0.28...");
  await setSlider("0.28");

  let sceneAfterSlider = await call("ink_get_scene");
  console.log(`   After slider to 0.28: "${sceneAfterSlider.scene.name}" (blend: ${sceneAfterSlider.scene.blend})`);
  assert(
    sceneAfterSlider.scene.name.includes("Dialectic Balance"),
    `BUG REGRESSION! Scene reverted to: ${sceneAfterSlider.scene.name}`,
  );
  assert.equal(sceneAfterSlider.scene.blend, 0.28, "Blend should have updated to 0.28");

  // Move slider to 0.10
  console.log("   Dragging blend slider to 0.10...");
  await setSlider("0.10");

  sceneAfterSlider = await call("ink_get_scene");
  console.log(`   After slider to 0.10: "${sceneAfterSlider.scene.name}" (blend: ${sceneAfterSlider.scene.blend})`);
  assert(
    sceneAfterSlider.scene.name.includes("Dialectic Balance"),
    `BUG REGRESSION! Scene reverted to: ${sceneAfterSlider.scene.name}`,
  );
  assert.equal(sceneAfterSlider.scene.blend, 0.10, "Blend should have updated to 0.10");

  // Now test with another concept: "Aporia Knot"
  console.log("   Switching to 'Aporia Knot'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll(".ink-sculpt-actions button"));
    const btn = buttons.find((b) => b.textContent?.includes("Aporia Knot"));
    if (btn) btn.click();
  });
  await settled();

  let aporiaBefore = await call("ink_get_scene");
  console.log(`   Aporia scene active: "${aporiaBefore.scene.name}"`);
  assert(aporiaBefore.scene.name.includes("Aporia Knot"));

  // Move slider to 0.35
  console.log("   Dragging blend slider to 0.35...");
  await setSlider("0.35");

  let aporiaAfter = await call("ink_get_scene");
  console.log(`   After slider to 0.35: "${aporiaAfter.scene.name}" (blend: ${aporiaAfter.scene.blend})`);
  assert(
    aporiaAfter.scene.name.includes("Aporia Knot"),
    `BUG REGRESSION! Scene reverted to: ${aporiaAfter.scene.name}`,
  );
  assert.equal(aporiaAfter.scene.blend, 0.35, "Blend should have updated to 0.35");

  console.log("\n   ✅ KNOB TEST PASSED: Dial preserves active concept perfectly with zero reversion!");

  if (errors.length > 0) {
    console.warn("Browser console errors:", errors);
  } else {
    console.log("   Zero console errors detected!");
  }

  console.log("\nALL TESTS SUCCEEDED!");
} catch (err) {
  console.error("Verification failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
