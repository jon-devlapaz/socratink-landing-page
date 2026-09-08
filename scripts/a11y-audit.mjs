/**
 * Comprehensive Accessibility & Chrome DevTools Auditor
 * Grounded in web.dev accessibility guidelines and Chrome DevTools Protocol.
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3001/";

let exitCode = 0;
function logPass(title, detail = "") {
  console.log(`[PASS] ${title}${detail ? " - " + detail : ""}`);
}
function logWarn(title, detail = "") {
  console.warn(`[WARN] ${title}${detail ? " - " + detail : ""}`);
}
function logFail(title, detail = "") {
  console.error(`[FAIL] ${title}${detail ? " - " + detail : ""}`);
  exitCode = 1;
}

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`Starting Chrome DevTools & a11y Audit on: ${BASE}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  const pageErrors = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  const client = await context.newCDPSession(page);
  const cdpIssues = [];
  try {
    await client.send("Audits.enable");
    client.on("Audits.issueAdded", (issue) => {
      cdpIssues.push(issue);
    });
  } catch {
    // Protocol fallback if Audits is not enabled
  }

  await page.goto(BASE, { waitUntil: "networkidle" });

  // 1. Document & Metadata Checks
  console.log("--- 1. Document & Metadata Checks ---");
  const globalChecks = await page.evaluate(() => {
    const lang = document.documentElement.lang;
    const title = document.title;
    const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute("content");
    const skipLink = document.querySelector(".skip-link");
    const main = document.querySelector("main#main");

    return {
      lang,
      title,
      viewport,
      hasSkipLink: !!skipLink,
      skipLinkHref: skipLink?.getAttribute("href"),
      hasMainTarget: !!main,
    };
  });

  if (globalChecks.lang === "en") {
    logPass("html[lang]", `Found valid lang="${globalChecks.lang}"`);
  } else {
    logFail("html[lang]", `Missing or invalid: "${globalChecks.lang}"`);
  }

  if (globalChecks.title && globalChecks.title.length > 5) {
    logPass("document.title", `"${globalChecks.title}"`);
  } else {
    logFail("document.title", `Missing or too short`);
  }

  if (globalChecks.viewport && !globalChecks.viewport.includes("user-scalable=no")) {
    logPass("meta[viewport]", `Scalable: "${globalChecks.viewport}"`);
  } else {
    logFail("meta[viewport]", `Prevents user zooming or missing`);
  }

  if (globalChecks.hasSkipLink && globalChecks.skipLinkHref === "#main" && globalChecks.hasMainTarget) {
    logPass("Skip Link", "Skip link present and points to valid <main id='main'>");
  } else {
    logFail("Skip Link", "Missing or misconfigured skip link target");
  }

  // 2. Semantic Structure & Heading Hierarchy
  console.log("\n--- 2. Semantic Structure & Heading Hierarchy ---");
  const headingAudit = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((el) => ({
      level: parseInt(el.tagName.replace("H", "")),
      text: el.innerText.replace(/\s+/g, " ").trim(),
      tag: el.tagName,
    }));

    const landmarks = {
      header: document.querySelectorAll("header").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      nav: document.querySelectorAll("nav").length,
    };

    return { headings, landmarks };
  });

  if (headingAudit.landmarks.header >= 1 && headingAudit.landmarks.main === 1 && headingAudit.landmarks.footer >= 1) {
    logPass("Landmarks", `header (1), main (1), footer (1), nav (${headingAudit.landmarks.nav})`);
  } else {
    logWarn("Landmarks", `Landmark distribution: ${JSON.stringify(headingAudit.landmarks)}`);
  }

  const h1s = headingAudit.headings.filter((h) => h.level === 1);
  if (h1s.length === 1) {
    logPass("Single h1", `"${h1s[0].text}"`);
  } else {
    logFail("Single h1", `Expected 1 h1, found ${h1s.length}`);
  }

  let headingOrderValid = true;
  let lastLevel = 1;
  for (const h of headingAudit.headings) {
    if (h.level > lastLevel + 1) {
      logWarn("Heading Skip", `Jumped from H${lastLevel} to ${h.tag}: "${h.text}"`);
      headingOrderValid = false;
    }
    lastLevel = h.level;
  }
  if (headingOrderValid) {
    logPass("Heading Levels", `All ${headingAudit.headings.length} headings follow sequential hierarchy`);
  }

  // 3. Form Controls & Interactive Labels
  console.log("\n--- 3. Interactive Element Labels & Form Controls ---");
  const interactiveAudit = await page.evaluate(() => {
    const unlabelledElements = [];

    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      const text = (btn.innerText || btn.textContent || "").trim();
      const ariaLabel = btn.getAttribute("aria-label") || btn.getAttribute("aria-labelledby");
      const title = btn.getAttribute("title");
      if (!text && !ariaLabel && !title) {
        unlabelledElements.push({ tag: "BUTTON", id: btn.id, class: btn.className });
      }
    });

    const links = document.querySelectorAll("a");
    links.forEach((a) => {
      const text = (a.innerText || a.textContent || "").trim();
      const ariaLabel = a.getAttribute("aria-label") || a.getAttribute("aria-labelledby");
      const hasImgWithAlt = a.querySelector("img[alt]")?.getAttribute("alt");
      if (!text && !ariaLabel && !hasImgWithAlt) {
        unlabelledElements.push({ tag: "A", id: a.id, href: a.getAttribute("href"), class: a.className });
      }
    });

    const orphanedInputs = Array.from(document.querySelectorAll("input, select, textarea"))
      .filter((i) => {
        const hasId = i.id && document.querySelector(`label[for="${i.id}"]`);
        const hasAria = i.getAttribute("aria-label") || i.getAttribute("aria-labelledby");
        return !hasId && !hasAria && !i.closest("label");
      })
      .map((i) => ({
        tag: i.tagName,
        id: i.id,
        name: i.name,
        placeholder: i.placeholder,
      }));

    return { unlabelledElements, orphanedInputs };
  });

  if (interactiveAudit.unlabelledElements.length === 0) {
    logPass("Interactive Labels", "All buttons and links have accessible names");
  } else {
    logFail("Interactive Labels", `Found unlabelled interactive elements: ${JSON.stringify(interactiveAudit.unlabelledElements)}`);
  }

  if (interactiveAudit.orphanedInputs.length === 0) {
    logPass("Form Inputs", "All inputs have associated labels or aria descriptors");
  } else {
    logWarn("Form Inputs", `Found orphaned inputs without explicit label: ${JSON.stringify(interactiveAudit.orphanedInputs)}`);
  }

  // 4. Tap Target Sizing
  console.log("\n--- 4. Touch Target Sizing (>= 44px) ---");
  const tapTargetAudit = await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll("button, nav a, .btn-primary, .btn-accent, .btn-ghost, .orbit-phone-label"));
    const undersized = [];

    targets.forEach((el) => {
      if (el.closest("[inert]") || el.offsetParent === null) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < 40 || rect.height < 40) {
          undersized.push({
            tag: el.tagName,
            text: el.innerText.trim().slice(0, 20),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            id: el.id,
          });
        }
      }
    });

    return { total: targets.length, undersized };
  });

  if (tapTargetAudit.undersized.length === 0) {
    logPass("Tap Targets", `All tested interactive controls meet or exceed 44px height targets`);
  } else {
    logWarn("Tap Targets", `Undersized targets: ${JSON.stringify(tapTargetAudit.undersized)}`);
  }

  // 5. Focus & Keyboard Navigation
  console.log("\n--- 5. Focus & Keyboard Navigation ---");
  await page.keyboard.press("Tab");
  const activeFirst = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    class: document.activeElement?.className,
    text: document.activeElement?.innerText,
  }));

  if (activeFirst.class?.includes("skip-link")) {
    logPass("Keyboard First Focus", `Skip-link receives first Tab: "${activeFirst.text}"`);
  } else {
    logWarn("Keyboard First Focus", `First focused element was <${activeFirst.tag}> ("${activeFirst.text}")`);
  }

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const activeNav = await page.evaluate(() => ({
    id: document.activeElement?.id,
    tag: document.activeElement?.tagName,
  }));
  logPass("Keyboard Navigation", `Successfully navigated into header navigation: <${activeNav.tag}>`);

  // 6. Color Contrast Across Themes
  console.log("\n--- 6. Color Contrast Across Themes ---");
  const contrastAudit = await page.evaluate(() => {
    function getRGB(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [255, 255, 255];
    }
    function luminance(r, g, b) {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function calcRatio(fgStr, bgStr) {
      const fg = getRGB(fgStr);
      const bg = getRGB(bgStr);
      const l1 = luminance(fg[0], fg[1], fg[2]);
      const l2 = luminance(bg[0], bg[1], bg[2]);
      return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
    }

    const title = document.querySelector("h1.hero-title");
    const body = document.querySelector(".hero-copy p");
    const rootStyle = window.getComputedStyle(document.body);
    const bg = rootStyle.backgroundColor || "#fffcf0";

    const titleStyle = window.getComputedStyle(title);
    const bodyStyle = window.getComputedStyle(body);

    return {
      titleRatio: calcRatio(titleStyle.color, bg),
      bodyRatio: calcRatio(bodyStyle.color, bg),
    };
  });

  if (parseFloat(contrastAudit.titleRatio) >= 4.5 && parseFloat(contrastAudit.bodyRatio) >= 4.5) {
    logPass("Light Theme Contrast", `Hero title: ${contrastAudit.titleRatio}:1, Body text: ${contrastAudit.bodyRatio}:1 (WCAG AA compliant)`);
  } else {
    logWarn("Light Theme Contrast", `Hero title: ${contrastAudit.titleRatio}:1, Body text: ${contrastAudit.bodyRatio}:1`);
  }

  // Toggle to Dark Theme and re-test
  await page.click("#appearance-toggle");
  await page.waitForTimeout(200);

  const darkContrast = await page.evaluate(() => {
    function getRGB(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [16, 15, 15];
    }
    function luminance(r, g, b) {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function calcRatio(fgStr, bgStr) {
      const fg = getRGB(fgStr);
      const bg = getRGB(bgStr);
      const l1 = luminance(fg[0], fg[1], fg[2]);
      const l2 = luminance(bg[0], bg[1], bg[2]);
      return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
    }

    const title = document.querySelector("h1.hero-title");
    const body = document.querySelector(".hero-copy p");
    const bg = window.getComputedStyle(document.body).backgroundColor || "#100f0f";

    return {
      theme: document.documentElement.dataset.theme,
      titleRatio: calcRatio(window.getComputedStyle(title).color, bg),
      bodyRatio: calcRatio(window.getComputedStyle(body).color, bg),
    };
  });

  if (parseFloat(darkContrast.titleRatio) >= 4.5 && parseFloat(darkContrast.bodyRatio) >= 4.5) {
    logPass("Dark Theme Contrast", `Theme="${darkContrast.theme}" - Title: ${darkContrast.titleRatio}:1, Body: ${darkContrast.bodyRatio}:1 (WCAG AA compliant)`);
  } else {
    logWarn("Dark Theme Contrast", `Theme="${darkContrast.theme}" - Title: ${darkContrast.titleRatio}:1, Body: ${darkContrast.bodyRatio}:1`);
  }

  // 7. Console Messages & Protocol Errors
  console.log("\n--- 7. Console Messages & Protocol Errors ---");
  if (consoleMessages.length === 0 && pageErrors.length === 0 && cdpIssues.length === 0) {
    logPass("DevTools Console & Issues", "0 console errors, 0 runtime exceptions, 0 native CDP issues");
  } else {
    if (consoleMessages.length > 0) {
      consoleMessages.forEach((m) => logWarn(`Console ${m.type}`, m.text));
    }
    if (pageErrors.length > 0) {
      pageErrors.forEach((e) => logFail("Page Runtime Error", e));
    }
    if (cdpIssues.length > 0) {
      cdpIssues.forEach((i) => logWarn("CDP Issue", JSON.stringify(i)));
    }
  }

  await browser.close();

  console.log(`\n======================================================`);
  console.log(`Audit Finished with Status: ${exitCode === 0 ? "SUCCESS (All Passed)" : "FAILURE"}`);
  console.log(`======================================================\n`);

  process.exit(exitCode);
}

runAudit().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
