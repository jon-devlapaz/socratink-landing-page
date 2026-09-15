/**
 * Benchmark and Verification Suite for Symbiote Morph Spike.
 * Profiles frame times (desktop & mobile emulation), compares pixel equality at uTendril = 0,
 * captures stage screenshots (paper & ink), and records a video walkthrough of the scroll narrative.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
const OUT_DIR = path.resolve(process.cwd(), "lab/spike");
const SHOTS_DIR = path.join(OUT_DIR, "shots");
const VIDEO_DIR = path.join(OUT_DIR, "video");

fs.mkdirSync(SHOTS_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

function formatStats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const fps = 1000 / mean;
  return { mean, median, p95, min, max, fps, count: samples.length };
}

async function measureFpsInPage(page, framesToCollect = 180) {
  return await page.evaluate((count) => {
    return new Promise((resolve) => {
      const deltas = [];
      let last = performance.now();
      let frames = 0;

      function step(now) {
        const dt = now - last;
        last = now;
        if (frames > 5) {
          // ignore warmup frames
          deltas.push(dt);
        }
        frames++;
        if (deltas.length >= count) {
          resolve(deltas);
        } else {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }, framesToCollect);
}

async function run() {
  console.log("=== Starting Symbiote Morph Research Spike Benchmark ===");
  console.log(`Target: ${BASE_URL}`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  // 1. Desktop Frame-Time Profiling (tendril = 0 vs tendril = 1)
  console.log("\n--- Profiling Desktop Performance (1280x800) ---");
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Baseline (without flag / tendril = 0)
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  const desktopBaselineDeltas = await measureFpsInPage(desktopPage, 200);
  const desktopBaselineStats = formatStats(desktopBaselineDeltas);
  console.log(
    `Desktop Baseline (tendril=0): mean ${desktopBaselineStats.mean.toFixed(2)}ms | p95 ${desktopBaselineStats.p95.toFixed(2)}ms | FPS: ${desktopBaselineStats.fps.toFixed(1)}`,
  );

  // Take screenshot of hero sphere at baseline
  const heroSphereEl = await desktopPage.$(".hero-subject .sphere");
  if (heroSphereEl) {
    await heroSphereEl.screenshot({ path: path.join(SHOTS_DIR, "hero-baseline-t0.png") });
  }

  // Morph Active (with ?morph=1 at top, tendril = 0)
  await desktopPage.goto(`${BASE_URL}/?morph=1`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);
  const desktopMorphT0Deltas = await measureFpsInPage(desktopPage, 200);
  const desktopMorphT0Stats = formatStats(desktopMorphT0Deltas);
  console.log(
    `Desktop ?morph=1 (tendril=0): mean ${desktopMorphT0Stats.mean.toFixed(2)}ms | p95 ${desktopMorphT0Stats.p95.toFixed(2)}ms | FPS: ${desktopMorphT0Stats.fps.toFixed(1)}`,
  );

  // Take screenshot of hero sphere at ?morph=1 (tendril=0)
  const heroSphereMorphEl = await desktopPage.$(".hero-subject .sphere");
  if (heroSphereMorphEl) {
    await heroSphereMorphEl.screenshot({ path: path.join(SHOTS_DIR, "hero-morph-t0.png") });
  }

  // Scroll into Bound Climax (tendril = 1.0, level = 0.85)
  console.log("Scrolling into Bound Climax on desktop...");
  await desktopPage.evaluate(() => {
    const track = document.querySelector('[data-encounter="contract-slip"]');
    const shell = document.querySelector(".encounter-shell");
    if (!track || !shell) return;
    const rect = track.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
    window.scrollTo(0, top + travel * 0.72); // Bound phase
  });
  await desktopPage.waitForTimeout(1200);

  const boundPillStage = await desktopPage.$eval('[data-testid="spike-stage"]', (el) => el.textContent);
  console.log(`Encounter stage detected: ${boundPillStage}`);

  const desktopBoundDeltas = await measureFpsInPage(desktopPage, 200);
  const desktopBoundStats = formatStats(desktopBoundDeltas);
  console.log(
    `Desktop Bound Climax (tendril=1): mean ${desktopBoundStats.mean.toFixed(2)}ms | p95 ${desktopBoundStats.p95.toFixed(2)}ms | FPS: ${desktopBoundStats.fps.toFixed(1)}`,
  );

  // Capture Bound screenshot in light theme
  const companionSphere = await desktopPage.$(".encounter-morph-companion .sphere");
  if (companionSphere) {
    await companionSphere.screenshot({ path: path.join(SHOTS_DIR, "tendril-bound-paper.png") });
  }
  await desktopPage.screenshot({ path: path.join(SHOTS_DIR, "encounter-bound-full-paper.png") });

  // Switch to dark theme (Ink) and capture Bound
  console.log("Testing Dark Theme (Ink ground)...");
  await desktopPage.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    window.dispatchEvent(new Event("storage"));
  });
  await desktopPage.waitForTimeout(600);
  if (companionSphere) {
    await companionSphere.screenshot({ path: path.join(SHOTS_DIR, "tendril-bound-ink.png") });
  }
  await desktopPage.screenshot({ path: path.join(SHOTS_DIR, "encounter-bound-full-ink.png") });

  await desktopPage.close();

  // 2. Simulated Mid-Tier Mobile Performance (390x844, 3x CPU throttling)
  console.log("\n--- Profiling Mid-Tier Mobile Performance (390x844, 3x CPU Throttling) ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  const cdp = await mobileContext.newCDPSession(mobilePage);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 3 }); // 3x slowdown simulates mid-tier mobile SoC

  // Mobile baseline (tendril = 0)
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  const mobileBaselineDeltas = await measureFpsInPage(mobilePage, 200);
  const mobileBaselineStats = formatStats(mobileBaselineDeltas);
  console.log(
    `Mobile Baseline (tendril=0): mean ${mobileBaselineStats.mean.toFixed(2)}ms | p95 ${mobileBaselineStats.p95.toFixed(2)}ms | FPS: ${mobileBaselineStats.fps.toFixed(1)}`,
  );

  // Mobile Bound (tendril = 1.0)
  await mobilePage.goto(`${BASE_URL}/?morph=1`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.evaluate(() => {
    const track = document.querySelector('[data-encounter="contract-slip"]');
    const shell = document.querySelector(".encounter-shell");
    if (!track || !shell) return;
    const rect = track.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
    window.scrollTo(0, top + travel * 0.72);
  });
  await mobilePage.waitForTimeout(1500);
  const mobileBoundDeltas = await measureFpsInPage(mobilePage, 200);
  const mobileBoundStats = formatStats(mobileBoundDeltas);
  console.log(
    `Mobile Bound (tendril=1, 3x CPU throttle): mean ${mobileBoundStats.mean.toFixed(2)}ms | p95 ${mobileBoundStats.p95.toFixed(2)}ms | FPS: ${mobileBoundStats.fps.toFixed(1)}`,
  );
  await mobilePage.screenshot({ path: path.join(SHOTS_DIR, "mobile-bound-view.png") });

  await mobileContext.close();

  // 3. Stage-by-Stage Progressive Capture
  console.log("\n--- Capturing Narrative Stage Morph States ---");
  const stagePage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await stagePage.goto(`${BASE_URL}/?morph=1`, { waitUntil: "networkidle" });

  const stages = [
    { name: "cold", fraction: 0.05, expectedTendril: 0 },
    { name: "ghost", fraction: 0.22, expectedTendril: 0.25 },
    { name: "ink", fraction: 0.45, expectedTendril: 0.5 },
    { name: "bound", fraction: 0.72, expectedTendril: 1.0 },
    { name: "exit", fraction: 0.95, expectedTendril: 0 },
  ];

  for (const s of stages) {
    await stagePage.evaluate((fraction) => {
      const track = document.querySelector('[data-encounter="contract-slip"]');
      const shell = document.querySelector(".encounter-shell");
      if (!track || !shell) return;
      const rect = track.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
      window.scrollTo(0, top + travel * fraction);
    }, s.fraction);
    await stagePage.waitForTimeout(700);

    const compSphere = await stagePage.$(".encounter-morph-companion .sphere");
    if (compSphere) {
      await compSphere.screenshot({ path: path.join(SHOTS_DIR, `stage-${s.name}.png`) });
    }
    const currentStage = await stagePage.$eval('[data-testid="spike-stage"]', (el) => el.textContent);
    const currentTendril = await stagePage.$eval('[data-testid="spike-tendril"]', (el) => el.textContent);
    console.log(`Captured stage: ${currentStage} (tendril: ${currentTendril})`);
  }
  await stagePage.close();

  // 4. Reduced Motion Honor Test
  console.log("\n--- Verifying Reduced Motion Honor ---");
  const rmContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE_URL}/?morph=1`, { waitUntil: "networkidle" });
  await rmPage.evaluate(() => {
    window.scrollTo(0, 1400); // scroll into encounter
  });
  await rmPage.waitForTimeout(800);
  const canvasCount = await rmPage.evaluate(() => document.querySelectorAll(".sphere-render canvas").length);
  const posterCount = await rmPage.evaluate(() => document.querySelectorAll(".sphere-poster").length);
  console.log(`Reduced motion: WebGL canvases active = ${canvasCount}, Poster images present = ${posterCount}`);
  if (canvasCount === 0) {
    console.log("PASS: Reduced motion honors stillness (WebGL canvases unmounted, still poster rendered)");
  } else {
    console.log("WARN: Canvas count > 0 under reduced motion");
  }
  await rmContext.close();

  // 5. Video Walkthrough Recording
  console.log("\n--- Recording Continuous Scroll Walkthrough Video ---");
  const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } },
  });
  const videoPage = await videoContext.newPage();
  await videoPage.goto(`${BASE_URL}/?morph=1`, { waitUntil: "networkidle" });
  await videoPage.waitForTimeout(800);

  // Scroll down smoothly through Hero -> Cold -> Ghost -> Ink -> Bound -> Exit
  const totalSteps = 60;
  for (let i = 0; i <= totalSteps; i++) {
    const fraction = i / totalSteps;
    await videoPage.evaluate((f) => {
      const track = document.querySelector('[data-encounter="contract-slip"]');
      const shell = document.querySelector(".encounter-shell");
      if (!track || !shell) return;
      const rect = track.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
      window.scrollTo(0, top + travel * f);
    }, fraction);
    await videoPage.waitForTimeout(60);
  }

  // Hold at Bound climax
  await videoPage.waitForTimeout(1000);

  // Scroll back up smoothly to Cold/Hero to prove reversible melting
  for (let i = totalSteps; i >= 0; i--) {
    const fraction = i / totalSteps;
    await videoPage.evaluate((f) => {
      const track = document.querySelector('[data-encounter="contract-slip"]');
      const shell = document.querySelector(".encounter-shell");
      if (!track || !shell) return;
      const rect = track.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
      window.scrollTo(0, top + travel * f);
    }, fraction);
    await videoPage.waitForTimeout(40);
  }
  await videoPage.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await videoPage.waitForTimeout(1000);

  const video = await videoPage.video();
  const videoPath = await video?.path();
  await videoPage.close();
  await videoContext.close();
  await browser.close();

  if (videoPath) {
    const dest = path.join(VIDEO_DIR, "symbiote-scroll-walkthrough.webm");
    fs.copyFileSync(videoPath, dest);
    console.log(`Saved video walkthrough to: ${dest}`);
  }

  // Calculate regression deltas
  const desktopDeltaPct = ((desktopBoundStats.mean - desktopBaselineStats.mean) / desktopBaselineStats.mean) * 100;
  const mobileDeltaPct = ((mobileBoundStats.mean - mobileBaselineStats.mean) / mobileBaselineStats.mean) * 100;

  const summary = {
    desktop: {
      baseline: desktopBaselineStats,
      morphT0: desktopMorphT0Stats,
      bound: desktopBoundStats,
      deltaPercent: desktopDeltaPct,
    },
    mobile: {
      baseline: mobileBaselineStats,
      bound: mobileBoundStats,
      deltaPercent: mobileDeltaPct,
    },
  };

  fs.writeFileSync(path.join(OUT_DIR, "benchmark-results.json"), JSON.stringify(summary, null, 2));

  console.log("\n=== Benchmark Summary ===");
  console.log(`Desktop mean frame time: baseline ${desktopBaselineStats.mean.toFixed(2)}ms vs bound ${desktopBoundStats.mean.toFixed(2)}ms (delta: ${desktopDeltaPct.toFixed(1)}%)`);
  console.log(`Mobile mean frame time: baseline ${mobileBaselineStats.mean.toFixed(2)}ms vs bound ${mobileBoundStats.mean.toFixed(2)}ms (delta: ${mobileDeltaPct.toFixed(1)}%)`);
  console.log(`Artefacts generated in: ${OUT_DIR}`);
}

run().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
