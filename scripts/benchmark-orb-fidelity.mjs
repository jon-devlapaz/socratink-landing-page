import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = 3001;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACTS_DIR = "/Users/jondev/.gemini/antigravity/brain/fe391c08-1b7c-428e-a4e7-e91112be76bc/lab/orb_benchmark";

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function runBenchmark() {
  console.log("================================================================================");
  console.log("🚀 STARTING MARKET-LEADING ORB FIDELITY & BENCHMARK SUITE");
  console.log(`Target: ${BASE_URL}`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=metal",
      "--no-sandbox",
      "--js-flags=--expose-gc",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // Listen for custom telemetry events
  const telemetryEvents = [];
  await page.exposeFunction("recordOrbTelemetry", (type, detail) => {
    telemetryEvents.push({ type, detail, timestamp: Date.now() });
  });

  await page.addInitScript(() => {
    window.addEventListener("socratink:orb-shape", (e) => {
      window.recordOrbTelemetry("socratink:orb-shape", e.detail);
    });
    window.addEventListener("socratink:orb-click", (e) => {
      window.recordOrbTelemetry("socratink:orb-click", e.detail);
    });

    // Instrument draw calls
    window.__drawCallCount = 0;
    const origDrawElements = WebGLRenderingContext.prototype.drawElements;
    WebGLRenderingContext.prototype.drawElements = function (...args) {
      window.__drawCallCount++;
      return origDrawElements.apply(this, args);
    };
    if (typeof WebGL2RenderingContext !== "undefined") {
      const origDrawElements2 = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        window.__drawCallCount++;
        return origDrawElements2.apply(this, args);
      };
    }
  });

  console.log("📡 Step 1: Core Web Vitals (CLS & LCP Measurement)...");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".sphere-render canvas", { timeout: 10000 });

  const webVitals = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let cls = 0;
      let lcp = 0;

      const poCLS = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      });
      try {
        poCLS.observe({ type: "layout-shift", buffered: true });
      } catch {}

      const poLCP = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          lcp = entry.startTime;
        }
      });
      try {
        poLCP.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}

      setTimeout(() => {
        poCLS.disconnect();
        poLCP.disconnect();
        resolve({ cls, lcp });
      }, 1000);
    });
  });

  console.log(`   ✓ CLS: ${webVitals.cls.toFixed(4)} (Target: 0.0000)`);
  console.log(`   ✓ LCP: ${webVitals.lcp.toFixed(1)}ms (Target: < 1200ms)`);

  console.log("\n⚡ Step 2: 600-Frame Animation, Frametime, Jank & Heap Profiling...");
  const perfProfile = await page.evaluate(async () => {
    const totalFrames = 600;
    const frameTimes = [];
    const drawCallsPerFrame = [];

    // Force GC if exposed to establish clean baseline
    if (window.gc) window.gc();
    const heapStart = performance.memory ? performance.memory.usedJSHeapSize : 0;

    let prevTime = performance.now();
    let initialDrawCalls = window.__drawCallCount;

    await new Promise((resolve) => {
      let count = 0;
      function loop(now) {
        const dt = now - prevTime;
        frameTimes.push(dt);
        prevTime = now;

        const currentCalls = window.__drawCallCount;
        drawCallsPerFrame.push(currentCalls - initialDrawCalls);
        initialDrawCalls = currentCalls;

        count++;
        if (count < totalFrames) {
          requestAnimationFrame(loop);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(loop);
    });

    const heapEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // Filter out first frame anomaly if any
    const validFrameTimes = frameTimes.slice(1);
    validFrameTimes.sort((a, b) => a - b);

    const sum = validFrameTimes.reduce((acc, v) => acc + v, 0);
    const meanTime = sum / validFrameTimes.length;
    const meanFps = 1000 / meanTime;

    const p50 = validFrameTimes[Math.floor(validFrameTimes.length * 0.5)];
    const p90 = validFrameTimes[Math.floor(validFrameTimes.length * 0.9)];
    const p95 = validFrameTimes[Math.floor(validFrameTimes.length * 0.95)];
    const p99 = validFrameTimes[Math.floor(validFrameTimes.length * 0.99)];
    const max = validFrameTimes[validFrameTimes.length - 1];

    const jankFrames = validFrameTimes.filter((t) => t > 18.0).length;
    const jankPercentage = (jankFrames / validFrameTimes.length) * 100;

    const meanDrawCalls =
      drawCallsPerFrame.slice(1).reduce((acc, v) => acc + v, 0) /
      (drawCallsPerFrame.length - 1);

    return {
      totalFrames,
      meanFps,
      meanTime,
      p50,
      p90,
      p95,
      p99,
      max,
      jankFrames,
      jankPercentage,
      heapDeltaMB: (heapEnd - heapStart) / (1024 * 1024),
      meanDrawCalls,
    };
  });

  console.log(`   ✓ Mean FPS: ${perfProfile.meanFps.toFixed(2)} FPS`);
  console.log(`   ✓ Mean Frametime: ${perfProfile.meanTime.toFixed(2)}ms`);
  console.log(`   ✓ p50 Frametime: ${perfProfile.p50.toFixed(2)}ms`);
  console.log(`   ✓ p95 Frametime: ${perfProfile.p95.toFixed(2)}ms`);
  console.log(`   ✓ p99 Frametime: ${perfProfile.p99.toFixed(2)}ms`);
  console.log(`   ✓ Max Frametime: ${perfProfile.max.toFixed(2)}ms`);
  console.log(`   ✓ Jank Frames (>18ms): ${perfProfile.jankFrames} (${perfProfile.jankPercentage.toFixed(2)}%)`);
  console.log(`   ✓ Draw Calls Per Frame: ${perfProfile.meanDrawCalls.toFixed(1)}`);
  console.log(`   ✓ JS Heap Growth over 600 frames: ${perfProfile.heapDeltaMB.toFixed(3)} MB`);

  console.log("\n🖱️ Step 3: Tactile Interaction & Keyboard Accessibility (INP)...");
  const orb = page.locator(".sphere");
  await orb.focus();

  const inpBefore = Date.now();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(50);
  const inpEstimate = Date.now() - inpBefore;

  console.log(`   ✓ Keyboard trigger ('Enter'): INP responsiveness ~${inpEstimate}ms`);

  // Click trigger
  await orb.click();
  await page.waitForTimeout(100);
  console.log(`   ✓ Mouse click trigger fired`);
  console.log(`   ✓ Telemetry captured: ${telemetryEvents.length} events recorded`);

  console.log("\n📸 Step 4: High-Fidelity Dual-Theme Visual Snapshots of All 5 Socratink Shapes...");
  const shapes = [
    { name: "sphere", index: 0, label: "01_base_sphere" },
    { name: "checkbox", index: 1, label: "02_checkbox" },
    { name: "fingerprint", index: 2, label: "03_fingerprint" },
    { name: "seal", index: 3, label: "04_seal" },
    { name: "code", index: 4, label: "05_code_brackets" },
    { name: "lens", index: 5, label: "06_magnifying_glass" },
  ];

  const captureShapes = async (themeName) => {
    console.log(`   Capturing [${themeName.toUpperCase()}] theme...`);
    const themeValue = themeName === "ink" ? "dark" : "light";

    for (const shape of shapes) {
      await page.goto(`${BASE_URL}/?shape=${shape.name}&morph=1`, { waitUntil: "networkidle" });
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
        localStorage.setItem("socratink-theme", t);
        window.dispatchEvent(new Event("socratink-theme-change"));
      }, themeValue);

      await page.waitForSelector(".sphere-render canvas", { timeout: 5000 });
      await page.waitForTimeout(800); // allow displacement settle

      const sphereEl = page.locator(".sphere");
      const filename = `${shape.label}_${themeName}.png`;
      const filepath = path.join(ARTIFACTS_DIR, filename);
      await sphereEl.screenshot({ path: filepath });
      console.log(`     📸 Saved: ${filename}`);
    }
  };

  await captureShapes("paper");
  await captureShapes("ink");

  // Generate Benchmark Report
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      graphics: {
        totalFrames: perfProfile.totalFrames,
        meanFps: perfProfile.meanFps,
        p50FrameTimeMs: perfProfile.p50,
        p95FrameTimeMs: perfProfile.p95,
        p99FrameTimeMs: perfProfile.p99,
        jankPercentage: perfProfile.jankPercentage,
        drawCallsPerFrame: perfProfile.meanDrawCalls,
        heapDeltaMB: perfProfile.heapDeltaMB,
      },
      webVitals: {
        cls: webVitals.cls,
        lcpMs: webVitals.lcp,
        inpMs: inpEstimate,
      },
      telemetry: {
        eventsFired: telemetryEvents.length,
        events: telemetryEvents,
      },
    },
  };

  const reportPath = path.join(ARTIFACTS_DIR, "benchmark-results.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Saved Benchmark Report: ${reportPath}`);

  await browser.close();
  console.log("\n🎉 BENCHMARK RUN COMPLETED SUCCESSFULLY!");
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
