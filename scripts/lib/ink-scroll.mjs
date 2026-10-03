/** Drive the real page scroll; never bypass the chapter's progress controller. */
export async function chapterRange(page, track, study) {
  const top = await page.evaluate((track) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    return document.querySelector(`.folio-track-${track}`).getBoundingClientRect().top;
  }, track);
  await page.waitForFunction((study) => Number(document.querySelector(`[data-study="${study}"]`)?.dataset.inkScrollRange) > 0, study);
  const range = Number(await page.locator(`[data-study="${study}"]`).getAttribute("data-ink-scroll-range"));
  return { start: top - range, end: top };
}

export async function scrollChapter(page, range, progress) {
  await page.evaluate(({ start, end, progress }) => {
    window.scrollTo({ top: progress === 0 ? Math.floor(start) - 1 : Math.ceil(start + (end - start) * progress), behavior: "instant" });
  }, { ...range, progress });
}

export async function settledScroll(page, study) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction((study) => {
    const mark = document.querySelector(`[data-study="${study}"]`);
    return mark?.dataset.inkReady === "true" && mark.dataset.inkTarget !== undefined &&
      Math.abs(Number(mark.dataset.inkProgress) - Number(mark.dataset.inkTarget)) < 0.001;
  }, study, { timeout: 8000 });
}

export async function drawWithScroll(page, range, duration = 4200) {
  await page.evaluate(({ start, end, duration }) => new Promise((resolve) => {
    let began;
    function step(time) {
      began ??= time;
      const progress = Math.min(1, (time - began) / duration);
      window.scrollTo({ top: start + (end - start) * progress, behavior: "instant" });
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  }), { ...range, duration });
}
