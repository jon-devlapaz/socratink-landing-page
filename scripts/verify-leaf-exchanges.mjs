import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const url = process.env.INK_URL || "http://localhost:3001";
const out = process.env.INK_ARTIFACTS || path.join(tmpdir(), "socratink-leaf-exchanges");
const answers = ["Because it reflects the ocean.", "Because air itself is blue, like paint.", "Maybe the Sun is blue?"];
const questions = [/desert or a high mountain plateau\?$/, /look at a distant mountain/, /Is the sunlight you see white, or blue\?$/];
const viewports = [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1280, height: 900 }];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", executablePath: process.env.CHROME_PATH });

function touchPoint(element) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  return element.contains(document.elementFromPoint(x, y)) ? { x, y } : null;
}

try {
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      const phone = viewport.width < 768;
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
      const ask = sheet.getByRole("link", { name: "Ask your own question", exact: true });
      assert.equal(await tips.count(), answers.length);
      for (let i = 0; i < answers.length; i++) {
        assert.equal(await tips.nth(i).getAttribute("aria-pressed"), "true");
        assert.equal(await dialogue.getByText(answers[i], { exact: true }).count(), 1);
        assert.match(await dialogue.innerText(), questions[i]);
        const bounds = await dialogue.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width);
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= viewport.height);
        const next = sheet.getByRole("button", { name: i === answers.length - 1 ? "First leaf" : "Next leaf" });
        assert.equal(await ask.getAttribute("href"), "https://app.socratink.ai/");
        const [askBox, nextBox] = await Promise.all([ask.boundingBox(), next.boundingBox()]);
        assert.ok(askBox && nextBox && askBox.x >= nextBox.x + nextBox.width && askBox.x + askBox.width <= viewport.width);
        assert.ok(askBox.y < nextBox.y + nextBox.height && nextBox.y < askBox.y + askBox.height, "Both actions share one row");
        if (phone) await ask.tap({ trial: true });
        else await ask.click({ trial: true });
        await page.screenshot({ path: path.join(out, `${viewport.width}-${theme}-leaf-${i + 1}.png`) });
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

  for (const [width, height, textSize] of [[320, 568, 125], [390, 664, 150]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
    await page.goto(url);
    await page.addStyleTag({ content: `html { font-size: ${textSize}% !important }` });
    await page.evaluate(() => document.fonts.ready);
    const sheet = page.getByRole("region", { name: "Why is the sky blue?" });
    const ask = sheet.getByRole("link", { name: "Ask your own question", exact: true });
    for (let i = 0; i < answers.length; i++) {
      assert.equal(await sheet.locator("[aria-live]").getByText(answers[i], { exact: true }).count(), 1);
      const next = sheet.getByRole("button", { name: i === answers.length - 1 ? "First leaf" : "Next leaf" });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await sheet.evaluate(el => el.closest(".folio-section-track").scrollIntoView({ block: "start", behavior: "instant" }));
      const distance = (await sheet.boundingBox()).height + height;
      let tap;
      // Scroll the page as a reader would. A locator tap could scroll an unreachable control into view.
      for (let moved = 0; moved <= distance; moved += height / 3) {
        const [nextPoint, askPoint] = await Promise.all([next.evaluate(touchPoint), ask.evaluate(touchPoint)]);
        if (nextPoint && askPoint) {
          tap = nextPoint;
          break;
        }
        await page.evaluate(step => window.scrollBy({ top: step, behavior: "instant" }), height / 3);
      }
      assert.ok(tap, `Both leaf actions must be reachable at ${width}px and ${textSize}% text on leaf ${i + 1}`);
      await page.screenshot({ path: path.join(out, `${width}-text-${textSize}-leaf-${i + 1}.png`) });
      await page.touchscreen.tap(tap.x, tap.y);
    }
    await page.close();
  }

  console.log(`Verified all three leaf exchanges. Screenshots in ${out}`);
} finally {
  await browser.close();
}
