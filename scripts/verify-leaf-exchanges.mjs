import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(tmpdir(), "socratink-leaf-exchanges");
const answers = ["Because it reflects the ocean.", "Because air itself is blue, like paint.", "Maybe the Sun is blue?"];
const questions = [/desert or a high mountain plateau\?$/, /look at a distant mountain/, /Is the sunlight you see white, or blue\?$/];
const viewports = [{ width: 390, height: 844 }, { width: 1280, height: 900 }];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", executablePath: process.env.CHROME_PATH });

try {
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      const phone = viewport.width === 390;
      const page = await browser.newPage({ viewport, hasTouch: phone, colorScheme: theme, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const sheet = page.getByRole("region", { name: "Why is the sky blue?" });
      const headings = await page.locator("main h2").allTextContents();
      const map = headings.indexOf("A map\nof the work");
      assert.notEqual(map, -1);
      assert.deepEqual(headings.slice(map + 1, map + 3), ["Why is the\nsky blue?", "You speak.\nIt teaches."]);
      await sheet.evaluate(el => el.closest(".folio-section-track").scrollIntoView());
      const tips = sheet.getByRole("group").getByRole("button");
      const dialogue = sheet.locator("[aria-live]");
      assert.equal(await tips.count(), answers.length);
      for (let i = 0; i < answers.length; i++) {
        assert.equal(await tips.nth(i).getAttribute("aria-pressed"), "true");
        assert.equal(await dialogue.getByText(answers[i], { exact: true }).count(), 1);
        assert.match(await dialogue.innerText(), questions[i]);
        const bounds = await dialogue.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width);
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height);
        await page.screenshot({ path: path.join(out, `${viewport.width}-${theme}-leaf-${i + 1}.png`) });
        const next = sheet.getByRole("button", { name: i === answers.length - 1 ? "First leaf" : "Next leaf" });
        if (phone) await next.tap();
        else await next.press("Enter");
      }
      assert.equal(await tips.first().getAttribute("aria-pressed"), "true");
      for (const i of [2, 0, 1]) {
        if (phone) await tips.nth(i).tap();
        else await tips.nth(i).click();
        assert.equal(await dialogue.getByText(answers[i], { exact: true }).count(), 1);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  const small = await browser.newPage({ viewport: { width: 320, height: 568 }, hasTouch: true, reducedMotion: "reduce" });
  await small.goto(url);
  const branch = small.getByRole("group", { name: "Choose a leaf on the branch" });
  await branch.scrollIntoViewIfNeeded();
  // Tap the actual ink tips on the compact drawing, where two leaves sit close together.
  for (const [i, x, y] of [[2, 0.68, 0.41], [0, 0.62, 0.24], [1, 0.30, 0.31]]) {
    const rect = await branch.boundingBox();
    await small.touchscreen.tap(rect.x + rect.width * x, rect.y + rect.height * y);
    assert.equal(await branch.getByRole("button").nth(i).getAttribute("aria-pressed"), "true");
  }
  await small.close();
  console.log(`Verified all three leaf exchanges. Screenshots in ${out}`);
} finally {
  await browser.close();
}
