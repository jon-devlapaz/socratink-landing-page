import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const url = process.env.INK_URL || "http://127.0.0.1:3001";
const out = path.resolve(process.env.INK_ARTIFACTS || "lab/ink-verification");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});
const errors = [];
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
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
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const artifact = async (name) => {
  const result = await call("ink_capture");
  assert.equal(result.ok, true);
  assert.match(result.image, /^data:image\/png;base64,/);
  await fs.writeFile(
    path.join(out, name + ".png"),
    Buffer.from(result.image.split(",")[1], "base64"),
  );
  return result;
};
const metrics = [];
try {
  await page.goto(url + "/ink-lab");
  await ready();
  await settled();
  const initial = await call("ink_get_scene");
  assert.equal(initial.ok, true);
  assert.equal(initial.scene.parts.length, 4);
  // A genuine new composition sent exclusively through the model interface.
  const custom = structuredClone(initial.scene);
  custom.name = "Model-created aperture";
  custom.blend = 0.12;
  custom.motion = { speed: 0.32, amplitude: 0.04, pointer: 0.18 };
  custom.parts = [
    {
      shape: "sphere",
      operation: "union",
      position: [0, 0, 0],
      scale: [1.8, 1.8, 0.85],
      rotation: [0, 0, 0],
    },
    {
      shape: "sphere",
      operation: "subtract",
      position: [0, 0, 0.25],
      scale: [1.05, 1.05, 1.65],
      rotation: [0, 0, 0],
    },
  ];
  const accepted = await call("ink_set_scene", { scene: custom });
  assert.equal(accepted.ok, true);
  await settled();
  assert.equal((await call("ink_get_scene")).revision, 1);
  await artifact("custom-aperture");
  // Invalid model calls must leave the accepted scene and revision unchanged.
  const badScenes = [
    { ...custom, parts: [] },
    { ...custom, parts: Array(9).fill(custom.parts[0]) },
    { ...custom, material: { ...custom.material, roughness: 9 } },
    { ...custom, injectedCode: "anything" },
    { ...custom, parts: [{ ...custom.parts[0], operation: "subtract" }] },
    {
      ...custom,
      parts: [{ ...custom.parts[0], shape: "capsule", scale: [1, 0.2, 1] }],
    },
  ];
  for (const scene of badScenes)
    assert.equal((await call("ink_set_scene", { scene })).ok, false);
  assert.equal((await call("ink_control", { resolution: 100 })).ok, false);
  assert.equal((await call("__proto__")).ok, false);
  const unchanged = await call("ink_get_scene");
  assert.equal(unchanged.revision, 1);
  assert.deepEqual(unchanged.scene, custom);
  await page.reload();
  await ready();
  await settled();
  assert.deepEqual((await call("ink_get_scene")).scene, custom);
  // All built-in starting points use the same set-scene tool.
  await page.getByText("Material studies", { exact: true }).click();
  for (const [label, name] of [
    ["Living ink", "ink"],
    ["Droplet", "droplet"],
    ["Orbit", "orbit"],
    ["Ribbon", "ribbon"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await settled();
    await artifact(name);
  }
  // Consecutive commands should converge on the most recent scene.
  await call("ink_set_scene", { scene: custom });
  await call("ink_set_scene", { scene: initial.scene });
  await settled();
  assert.deepEqual((await call("ink_get_scene")).scene, initial.scene);
  await call("ink_control", { paused: true });
  await settled();
  const paused = await artifact("paused");
  await delay(250);
  const pausedAgain = await artifact("paused-again");
  assert.equal(paused.rendering.time, pausedAgain.rendering.time);
  assert.equal(
    paused.image,
    pausedAgain.image,
    "Paused captures must be identical",
  );
  const status = await call("ink_get_scene");
  await delay(200);
  assert.equal(
    (await call("ink_get_scene")).rendering.frames,
    status.rendering.frames,
    "Pause must stop RAF renders",
  );
  await call("ink_control", { paused: false });
  // Three render resolutions, measured on the same workload and browser.
  for (const resolution of [0.5, 0.75, 1]) {
    await call("ink_control", { resolution });
    await settled();
    const intervals = await page.evaluate(async () => {
      const samples = [];
      let previous;
      await new Promise((resolve) => {
        const tick = (now) => {
          if (previous !== undefined) samples.push(now - previous);
          previous = now;
          if (samples.length < 120) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      return samples.sort((a, b) => a - b);
    });
    metrics.push({
      resolution,
      p50Ms: intervals[60],
      p95Ms: intervals[114],
      maxMs: intervals.at(-1),
      canvas: (await call("ink_get_scene")).rendering.canvas,
    });
    await artifact("quality-" + resolution);
  }
  await call("ink_control", { resolution: 0.75 });
  await page.getByRole("button", { name: "Switch theme" }).click();
  await settled();
  await artifact("ink-dark");
  await page.screenshot({
    path: path.join(out, "lab-dark.png"),
    fullPage: true,
  });
  // Respect reduced motion but continue accepting static creations.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => window.socratinkInk.call("ink_get_scene").rendering.reducedMotion,
  );
  await settled();
  const reduced = await call("ink_get_scene");
  assert.equal(reduced.rendering.reducedMotion, true);
  await delay(200);
  assert.equal(
    (await call("ink_get_scene")).rendering.frames,
    reduced.rendering.frames,
  );
  assert.equal((await call("ink_set_scene", { scene: custom })).ok, true);
  await settled();
  await artifact("reduced-custom");
  // Offscreen rendering must pause.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(url);
  await ready();
  await settled();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(
    () => !window.socratinkInk.call("ink_get_scene").rendering.visible,
  );
  const offscreen = await call("ink_get_scene");
  await delay(250);
  assert.equal(
    (await call("ink_get_scene")).rendering.frames,
    offscreen.rendering.frames,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () => window.socratinkInk.call("ink_get_scene").rendering.visible,
  );
  await call("ink_control", { paused: true });
  await settled();
  const beforeRestore = await artifact("before-context-loss");
  // Context loss should reveal the poster, then resume rendering after restoration.
  await page.evaluate(() => {
    const canvas = document.querySelector(".ink-render canvas");
    window.__inkGL = canvas
      .getContext("webgl2")
      .getExtension("WEBGL_lose_context");
    window.__inkGL.loseContext();
  });
  await page.waitForFunction(
    () => !window.socratinkInk.call("ink_get_scene").rendering.ready,
  );
  assert.equal(await page.locator(".ink-poster").isVisible(), true);
  assert.equal((await call("ink_capture")).ok, false);
  await page.evaluate(() => window.__inkGL.restoreContext());
  await ready();
  await settled();
  const afterRestore = await artifact("after-context-restore");
  const restorePixelDelta = await page.evaluate(
    async ([before, after]) => {
      const pixels = async (url) => {
        const image = await createImageBitmap(await (await fetch(url)).blob());
        const canvas = new OffscreenCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const a = await pixels(before),
        b = await pixels(after);
      let difference = 0;
      for (let i = 0; i < a.length; i++) difference += Math.abs(a[i] - b[i]);
      return difference / a.length;
    },
    [beforeRestore.image, afterRestore.image],
  );
  assert.ok(
    restorePixelDelta < 0.1,
    `Restored ink/lighting mean byte difference: ${restorePixelDelta}`,
  );
  await call("ink_set_scene", { scene: initial.scene });
  await settled();
  await page.screenshot({ path: path.join(out, "hero-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
  await settled();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: path.join(out, "hero-mobile.png") });
  await page.goto(url + "/ink-lab");
  await ready();
  await settled();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: path.join(out, "lab-mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, [], "Browser errors");
  await fs.writeFile(
    path.join(out, "results.json"),
    JSON.stringify(
      {
        url,
        checkedAt: new Date().toISOString(),
        metrics,
        restorePixelDelta,
        errors,
        checks:
          "custom composition; invalid inputs atomic; tab reload; four presets; latest command; paused pixels and RAF; quality; themes; reduced motion; offscreen pause; context recovery; mobile layout",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, out, metrics }));
} finally {
  await browser.close();
}
