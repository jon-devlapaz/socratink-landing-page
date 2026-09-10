import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://127.0.0.1:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || "lab/ink-symbols");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const call = (name, args = {}) =>
  page.evaluate(({ name, args }) => window.socratinkInk.call(name, args), {
    name,
    args,
  });
const ready = () =>
  page.waitForFunction(
    () => window.socratinkInk?.call("ink_get_scene").rendering?.ready,
  );
const settled = () =>
  page.waitForFunction(
    () => !window.socratinkInk.call("ink_get_scene").rendering.transitioning,
  );
const moments = [
  ["rest", "At rest", "Ink droplet", "Ink droplet"],
  ["question", "A question opens", "Question mark", "Question mark"],
  ["nib", "In your own words", "Dipped nib", "Dipped nib"],
  ["connect", "Ideas connect", "Synaptic bridge", "Bridge"],
  ["explain", "Proven retention", "Living codex", "Open notebook"],
];
const captures = [];
async function capture(name) {
  const result = await call("ink_capture");
  assert.equal(result.ok, true);
  await fs.writeFile(
    path.join(out, name + ".png"),
    Buffer.from(result.image.split(",")[1], "base64"),
  );
  return result.image;
}
try {
  await page.goto(url + "/ink-lab");
  await ready();
  await settled();
  // Each moment goes through the same model-facing command as its UI button.
  for (const [id, label, symbol, name] of moments) {
    await page
      .getByRole("button", { name: label + " " + symbol, exact: true })
      .click();
    for (const [delay, suffix] of [
      [150, "early"],
      [300, "middle"],
      [450, "late"],
    ]) {
      await page.waitForTimeout(delay);
      await capture(id + "-" + suffix);
    }
    await settled();
    const result = await call("ink_get_scene");
    assert.equal(result.scene.name, name);
    assert.ok(result.scene.parts.length <= 14);
    assert.equal(
      await page
        .getByRole("button", { name: label + " " + symbol, exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    captures.push({ id, name, image: await capture(id) });
  }
  const accepted = await call("ink_get_scene");
  assert.equal(
    (await call("ink_express", { expression: "passed_exam" })).ok,
    false,
  );
  assert.equal(
    (await call("ink_express", { expression: "rest", score: 100 })).ok,
    false,
  );
  assert.deepEqual((await call("ink_get_scene")).scene, accepted.scene);
  assert.equal((await call("ink_get_scene")).revision, accepted.revision);
  // A rapid interruption must settle on the latest requested moment.
  await call("ink_express", { expression: "rest" });
  await call("ink_express", { expression: "question" });
  await call("ink_express", { expression: "connect" });
  await settled();
  assert.equal((await call("ink_get_scene")).scene.name, "Bridge");
  await page.reload();
  await ready();
  await settled();
  assert.equal((await call("ink_get_scene")).scene.name, "Bridge");
  await page.getByRole("button", { name: "Switch theme" }).click();
  await settled();
  for (const [id] of moments) {
    await call("ink_express", { expression: id });
    await settled();
    await capture(id + "-dark");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => window.socratinkInk.call("ink_get_scene").rendering.reducedMotion,
  );
  for (const [id] of moments) {
    assert.equal((await call("ink_express", { expression: id })).ok, true);
    await settled();
    const before = await call("ink_get_scene");
    await page.waitForTimeout(150);
    assert.equal(
      (await call("ink_get_scene")).rendering.frames,
      before.rendering.frames,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
  await page.screenshot({
    path: path.join(out, "lab-mobile.png"),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  await ready();
  await settled();
  assert.equal((await call("ink_get_scene")).scene.name, "Open notebook");
  await page.screenshot({ path: path.join(out, "hero-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [id] of moments) {
    await call("ink_express", { expression: id });
    await settled();
    await page.screenshot({ path: path.join(out, "hero-" + id + ".png") });
  }
  assert.deepEqual(errors, []);
  const sheet = await browser.newPage({
    viewport: { width: 1280, height: 430 },
    deviceScaleFactor: 1,
  });
  await sheet.setContent(
    `<style>body{margin:0;background:#eeede7;color:#262620;font-family:system-ui}main{display:flex;gap:16px;padding:24px}figure{margin:0;width:296px}img{width:296px;height:296px}figcaption{text-align:center;font-size:18px}small{display:block;text-align:center;margin-top:10px;color:#666}</style><main>${captures.map((c) => `<figure><img src="${c.image}"><figcaption>${c.name}</figcaption><small>${c.id}</small></figure>`).join("")}</main>`,
  );
  await sheet
    .locator("img")
    .evaluateAll(async (images) =>
      Promise.all(images.map((image) => image.decode())),
    );
  await sheet.screenshot({ path: path.join(out, "symbol-study.png") });
  await fs.writeFile(
    path.join(out, "results.json"),
    JSON.stringify(
      {
        passed: true,
        url,
        errors,
        moments: moments.map(([id]) => id),
        checks:
          "four UI/tool expressions; transition captures; budget; atomic invalid input; rapid interruption; reload; both themes; reduced motion; mobile; hero previews",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, out, errors }));
} finally {
  await browser.close();
}
