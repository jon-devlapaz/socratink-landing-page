import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const ARTIFACTS_DIR = "/Users/jondev/.gemini/antigravity/brain/b4a14685-d201-4b8b-bf7b-dcfa9ca53529";
const outDir = path.join(ARTIFACTS_DIR, "emojis");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=metal"],
});

const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 2,
});

try {
  await page.goto("http://127.0.0.1:3001/ink-lab-v2", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.socratinkInk?.call("ink_get_scene")?.rendering?.ready, { timeout: 15000 });
  await page.waitForTimeout(1000);

  const emojis = [
    { id: "lightbulb", key: "lightbulb", icon: "💡", label: "Incandescent Lightbulb" },
    { id: "target", key: "target", icon: "🎯", label: "Bullseye Target" },
    { id: "bolt", key: "bolt", icon: "⚡", label: "Lightning Bolt" },
    { id: "key", key: "key", icon: "🗝️", label: "Socratic Key" },
  ];

  for (const item of emojis) {
    console.log(`Rendering ${item.icon} ${item.label}...`);
    await page.evaluate((key) => window.socratinkInk.call("ink_sculpt", { concept: key }), item.key);

    // Wait for transition to settle
    await page.waitForTimeout(1600);

    // Capture resting screenshot
    const res = await page.evaluate(() => window.socratinkInk.call("ink_capture"));
    if (res && res.ok && res.image) {
      const base64Data = res.image.replace(/^data:image\/png;base64,/, "");
      await fs.writeFile(path.join(outDir, `${item.id}.png`), base64Data, "base64");
      console.log(`Saved ${item.id}.png`);
    }
  }

  console.log("All emoji candidate captures completed!");
} finally {
  await browser.close();
}
