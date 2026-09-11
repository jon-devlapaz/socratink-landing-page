"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface MilestoneData {
  num: string;
  day: string;
  headline: string;
  activeOutcome: string;
  passiveOutcome: string;
  detail: string;
}

const MILESTONES: MilestoneData[] = [
  {
    num: "01",
    day: "Day 1",
    headline: "The Recognition Illusion",
    activeOutcome: "Builds recall pathways",
    passiveOutcome: "Feels easy with notes open",
    detail:
      "Reading notes feels fast because your eyes recognize the words. Writing the answer from memory feels slower, but it builds the recall paths you will rely on during the exam.",
  },
  {
    num: "02",
    day: "Day 7",
    headline: "One Week In",
    activeOutcome: "Recall holds without hints",
    passiveOutcome: "Blank-page panic begins",
    detail:
      "If you only reread notes, most of the detail disappears within days. One prompt solved entirely from memory keeps the core concept intact.",
  },
  {
    num: "03",
    day: "Day 30",
    headline: "One Month Later",
    activeOutcome: "Solves cold under pressure",
    passiveOutcome: "Cannot execute unaided",
    detail:
      "When you have to solve a problem cold under exam conditions, passive review leaves you with roughly 18% recall. Practicing unassisted retrieval preserves over 80%.",
  },
];

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function cubicBezier(
  t: number,
  p0: number,
  c1: number,
  c2: number,
  p1: number,
): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
}

export function RetentionCurve() {
  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // Scroll tracking to drive ink drawing progress across pinned stage
  useEffect(() => {
    if (isReducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let targetP = 0;
    let currentP = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      currentP += (targetP - currentP) * 0.14;
      if (Math.abs(targetP - currentP) < 0.001) {
        currentP = targetP;
        isRunning = false;
      }
      setScrollProgress(currentP);
      if (isRunning) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      const rect = track.getBoundingClientRect();
      const stickyTop = window.innerWidth >= 768 ? 80 : 64;
      const vh = window.innerHeight;
      const stickyHeight = stickyRef.current ? stickyRef.current.offsetHeight : vh - stickyTop;
      const totalTravel = rect.height - stickyHeight;

      if (totalTravel <= 0) {
        targetP = 1;
      } else {
        const scrolled = stickyTop - rect.top;
        const raw = scrolled / totalTravel;
        targetP = Math.max(0, Math.min(1, raw));
      }

      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion]);

  // High-DPI Living Ink Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Detect theme from document
      const isDark =
        document.documentElement.dataset.theme === "dark" ||
        (!document.documentElement.dataset.theme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      // Ink Palette tokens
      const accentColor = isDark ? "#3aa99f" : "#1f7a72";
      const passiveColor = isDark ? "#8f8c85" : "#686762";
      const gridColor = isDark ? "rgba(206, 205, 195, 0.08)" : "rgba(16, 15, 15, 0.07)";
      const textMuted = isDark ? "rgba(206, 205, 195, 0.45)" : "rgba(16, 15, 15, 0.45)";
      const textPrimary = isDark ? "#cecdc3" : "#100f0f";

      // Layout geometry
      const isMobile = width < 640;
      const isCompact = width < 420;
      const padLeft = isCompact ? 30 : isMobile ? 36 : 56;
      const padRight = isCompact ? 90 : isMobile ? 104 : 160;
      const padTop = 32;
      const padBottom = 42;

      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;

      const valToY = (pct: number) => padTop + chartH * (1 - pct);
      const timeToX = (t: number) => padLeft + chartW * t;

      // Draw Hairline Drafting Coordinate Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = gridColor;

      const gridSteps = [
        { val: 1.0, label: "100%" },
        { val: 0.75, label: "75%" },
        { val: 0.5, label: "50%" },
        { val: 0.25, label: "25%" },
        { val: 0.0, label: "0%" },
      ];

      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      gridSteps.forEach((step) => {
        const y = valToY(step.val);
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();

        ctx.fillStyle = textMuted;
        ctx.fillText(step.label, padLeft - 8, y);
      });

      // Baseline timeline markers
      const timelineDays = [
        { t: 0.0, label: "Day 1" },
        { t: 0.45, label: "Day 7" },
        { t: 1.0, label: "Day 30" },
      ];

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      timelineDays.forEach((m) => {
        const x = timeToX(m.t);
        ctx.fillStyle = textMuted;
        ctx.fillText(m.label, x, padTop + chartH + 12);

        // Subtle tick mark
        ctx.beginPath();
        ctx.strokeStyle = gridColor;
        ctx.moveTo(x, padTop + chartH);
        ctx.lineTo(x, padTop + chartH + 4);
        ctx.stroke();
      });

      // Curve Spline Geometry Functions
      // Segment 1: t in [0, 0.45] (Day 1 to Day 7)
      // Segment 2: t in [0.45, 1.0] (Day 7 to Day 30)
      const getUnaidedY = (t: number) => {
        if (t <= 0.45) {
          const u = t / 0.45;
          return valToY(cubicBezier(u, 0.74, 0.81, 0.85, 0.84));
        } else {
          const u = (t - 0.45) / 0.55;
          return valToY(cubicBezier(u, 0.84, 0.83, 0.81, 0.80));
        }
      };

      const getPassiveY = (t: number) => {
        if (t <= 0.45) {
          const u = t / 0.45;
          return valToY(cubicBezier(u, 0.88, 0.81, 0.50, 0.34));
        } else {
          const u = (t - 0.45) / 0.55;
          return valToY(cubicBezier(u, 0.34, 0.25, 0.20, 0.18));
        }
      };

      // Crossover point at t ≈ 0.12 (~Day 2)
      const crossoverT = 0.12;
      const crossoverX = timeToX(crossoverT);
      const crossoverY = getUnaidedY(crossoverT);

      const activeProgress = isReducedMotion ? 1 : scrollProgress;
      const samples = 140;

      // 1. Draw Shaded "Durable Retention Gap" Polygon between curves (from crossover to Day 30)
      if (activeProgress > crossoverT) {
        const endT = Math.min(1, activeProgress);
        ctx.beginPath();
        ctx.moveTo(crossoverX, crossoverY);

        // Along unaided forward
        const subSteps = 60;
        for (let i = 0; i <= subSteps; i++) {
          const curT = crossoverT + (i / subSteps) * (endT - crossoverT);
          ctx.lineTo(timeToX(curT), getUnaidedY(curT));
        }

        // Along passive backward
        for (let i = subSteps; i >= 0; i--) {
          const curT = crossoverT + (i / subSteps) * (endT - crossoverT);
          ctx.lineTo(timeToX(curT), getPassiveY(curT));
        }

        ctx.closePath();

        const grad = ctx.createLinearGradient(crossoverX, 0, timeToX(1.0), 0);
        grad.addColorStop(0, isDark ? "rgba(58, 169, 159, 0.04)" : "rgba(31, 122, 114, 0.04)");
        grad.addColorStop(1, isDark ? "rgba(58, 169, 159, 0.18)" : "rgba(31, 122, 114, 0.15)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Architectural Gap Label in open space
        if (activeProgress > 0.7 && !isMobile) {
          const labelX = timeToX(0.72);
          const labelY = (getUnaidedY(0.72) + getPassiveY(0.72)) / 2;
          ctx.font = "9px monospace";
          ctx.fillStyle = accentColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("DURABLE RETENTION GAP", labelX, labelY);
        }
      }

      // 2. Draw Passive Decay Curve (Evaporating & Diffusing Ink)
      const currentSteps = Math.floor(samples * activeProgress);

      if (currentSteps > 0) {
        // Wet ink segment before crossover
        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = passiveColor;
        ctx.setLineDash([4, 4]);

        for (let i = 0; i <= currentSteps; i++) {
          const curT = i / samples;
          const x = timeToX(curT);
          const y = getPassiveY(curT);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Evaporating micro-particles along the decay segment
        if (activeProgress > crossoverT) {
          const particleCount = Math.floor(18 * (activeProgress - crossoverT));
          ctx.fillStyle = passiveColor;
          for (let p = 0; p < particleCount; p++) {
            const pt = crossoverT + (p / 18) * 0.8;
            if (pt > activeProgress) break;
            const px = timeToX(pt);
            const py = getPassiveY(pt);
            const driftY = py - 6 - (p % 4) * 3;
            const size = 0.8 + (p % 3) * 0.4;
            const alpha = 0.4 - (p % 4) * 0.08;

            ctx.globalAlpha = Math.max(0.1, alpha);
            ctx.beginPath();
            ctx.arc(px + (p % 2 ? 2 : -2), driftY, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 3. Draw Socratink Unaided Curve (Permanent, Rich Living Ink)
      if (currentSteps > 0) {
        // Pass A: Soft capillary pigment aura (fountain pen ink bleeding gently into paper)
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = isDark ? "rgba(58, 169, 159, 0.16)" : "rgba(31, 122, 114, 0.14)";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i <= currentSteps; i++) {
          const curT = i / samples;
          const x = timeToX(curT);
          const y = getUnaidedY(curT);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pass B: Core permanent saturated ink stroke
        ctx.beginPath();
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = accentColor;

        for (let i = 0; i <= currentSteps; i++) {
          const curT = i / samples;
          const x = timeToX(curT);
          const y = getUnaidedY(curT);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pass C: Fine inner spine
        ctx.beginPath();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = isDark ? "#ffffff" : "#ffffff";
        ctx.globalAlpha = isDark ? 0.35 : 0.45;

        for (let i = 0; i <= currentSteps; i++) {
          const curT = i / samples;
          const x = timeToX(curT);
          const y = getUnaidedY(curT);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // 4. Anchor Nodes & Milestone Ink Beads
      timelineDays.forEach((m) => {
        if (activeProgress >= m.t) {
          const nx = timeToX(m.t);
          const nyUnaided = getUnaidedY(m.t);
          const nyPassive = getPassiveY(m.t);

          // Passive node
          ctx.beginPath();
          ctx.arc(nx, nyPassive, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? "#100f0f" : "#fffcf0";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = passiveColor;
          ctx.stroke();

          // Unaided permanent ink node
          ctx.beginPath();
          ctx.arc(nx, nyUnaided, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = isDark ? "#100f0f" : "#fffcf0";
          ctx.stroke();
        }
      });

      // 5. Crossover Callout (~Day 2)
      if (activeProgress >= crossoverT) {
        ctx.beginPath();
        ctx.arc(crossoverX, crossoverY, 3, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        // Anchor elevation: strictly in the clear negative space above the curve peak (84.5%)
        // and below the 100% grid line (padTop). On all viewports, this guarantees
        // ~25px+ clearance above any curve spline and ~6-10px below the 100% grid line.
        const targetCalloutY = isCompact ? valToY(0.93) : isMobile ? valToY(0.94) : valToY(0.95);
        const shoulderLength = isCompact ? 8 : 12;
        const textStartX = crossoverX + shoulderLength + 4;

        // Architectural drafting leader: vertical dashed stem + horizontal shoulder divider
        ctx.beginPath();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);
        ctx.moveTo(crossoverX, crossoverY - 4);
        ctx.lineTo(crossoverX, targetCalloutY);
        ctx.lineTo(crossoverX + shoulderLength, targetCalloutY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small drafting node at shoulder elbow
        ctx.beginPath();
        ctx.arc(crossoverX, targetCalloutY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        ctx.textAlign = "left";

        if (isCompact) {
          const label = "The Crossover · Day 2";
          ctx.font = "bold 8.5px monospace";
          const textMetrics = ctx.measureText(label);

          // Drafting paper wipe mask ensures 100% contrast and prevents grid collision
          ctx.fillStyle = isDark ? "rgba(16, 15, 15, 0.85)" : "rgba(255, 252, 240, 0.90)";
          ctx.fillRect(textStartX - 2, targetCalloutY - 6.5, textMetrics.width + 4, 13);

          ctx.fillStyle = textPrimary;
          ctx.textBaseline = "middle";
          ctx.fillText(label, textStartX, targetCalloutY);
        } else {
          const title = "The Crossover · ~Day 2";
          const subtitle = isMobile ? "Passive decay begins" : "Passive recognition begins decay";

          ctx.font = "bold 9.5px monospace";
          const titleMetrics = ctx.measureText(title);
          ctx.font = "8.5px monospace";
          const subMetrics = ctx.measureText(subtitle);
          const blockWidth = Math.max(titleMetrics.width, subMetrics.width);

          // Drafting paper wipe mask
          ctx.fillStyle = isDark ? "rgba(16, 15, 15, 0.85)" : "rgba(255, 252, 240, 0.90)";
          ctx.fillRect(textStartX - 3, targetCalloutY - 13, blockWidth + 6, 24);

          // Line 1: Primary Title (anchored cleanly above shoulder divider)
          ctx.font = "bold 9.5px monospace";
          ctx.fillStyle = textPrimary;
          ctx.textBaseline = "bottom";
          ctx.fillText(title, textStartX, targetCalloutY - 1.5);

          // Line 2: Secondary Descriptor (anchored cleanly below shoulder divider)
          ctx.font = "8.5px monospace";
          ctx.fillStyle = textMuted;
          ctx.textBaseline = "top";
          ctx.fillText(subtitle, textStartX, targetCalloutY + 2.5);
        }
      }

      // 6. Direct Curve End Typography (Apple Silicon style on paper)
      if (activeProgress >= 0.95) {
        const endX = timeToX(1.0);
        const endYUnaided = getUnaidedY(1.0);
        const endYPassive = getPassiveY(1.0);

        ctx.textAlign = "left";

        if (isCompact) {
          // Compact single-line labels
          ctx.font = "bold 9px monospace";
          ctx.fillStyle = accentColor;
          ctx.textBaseline = "middle";
          ctx.fillText("Socratink 80%", endX + 6, endYUnaided);

          ctx.font = "bold 9px monospace";
          ctx.fillStyle = passiveColor;
          ctx.fillText("Passive 18%", endX + 6, endYPassive);
        } else {
          // Full editorial typography
          ctx.font = "bold 10px monospace";
          ctx.fillStyle = accentColor;
          ctx.textBaseline = "alphabetic";
          ctx.fillText("Socratink (80%)", endX + 10, endYUnaided - 2);

          ctx.font = "9px monospace";
          ctx.fillStyle = textMuted;
          ctx.fillText("Solves cold without notes", endX + 10, endYUnaided + 10);

          ctx.font = "10px monospace";
          ctx.fillStyle = passiveColor;
          ctx.fillText("Passive (18%)", endX + 10, endYPassive - 2);

          ctx.font = "9px monospace";
          ctx.fillStyle = textMuted;
          ctx.fillText("Evaporated recall", endX + 10, endYPassive + 10);
        }
      }

      // 7. Active Drawing Stylus Nib (Follows Active Scroll Travel)
      if (!isReducedMotion && activeProgress > 0 && activeProgress < 1) {
        const curX = timeToX(activeProgress);
        const curY = getUnaidedY(activeProgress);

        // Stylus halo
        ctx.beginPath();
        ctx.arc(curX, curY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? "rgba(58, 169, 159, 0.35)" : "rgba(31, 122, 114, 0.30)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Stylus core bead
        ctx.beginPath();
        ctx.arc(curX, curY, 3, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
      }

      ctx.restore();
    };

    render();

    const resizeObserver = new ResizeObserver(() => {
      render();
    });
    resizeObserver.observe(canvas);

    // MutationObserver to detect light/dark theme switch immediately
    const themeObserver = new MutationObserver(() => {
      render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [scrollProgress, isReducedMotion]);

  // Active milestone index based on scroll
  const effectiveProgress = isReducedMotion ? 1 : scrollProgress;
  const activeMilestoneIdx = effectiveProgress < 0.33 ? 0 : effectiveProgress < 0.68 ? 1 : 2;

  const scrollToMilestone = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const stickyTop = window.innerWidth >= 768 ? 80 : 64;
    const vh = window.innerHeight;
    const stickyHeight = stickyRef.current ? stickyRef.current.offsetHeight : vh - stickyTop;
    const totalTravel = rect.height - stickyHeight;

    const targets = [0.08, 0.50, 0.95];
    const targetRatio = targets[idx] ?? 0;

    const targetScrollY = scrollTop + rect.top - stickyTop + targetRatio * totalTravel;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  };

  return (
    <section
      id="retention-science"
      ref={trackRef}
      aria-labelledby="retention-title"
      className={`relative w-full ${
        isReducedMotion ? "h-auto py-12 sm:py-16" : "h-[260vh] min-h-[1800px]"
      }`}
    >
      {/* Pinned Sticky Stage: Locks in viewport while scroll scrubs through Day 1 -> Day 30 */}
      <div
        ref={stickyRef}
        className={`w-full ${
          isReducedMotion
            ? "relative py-12 sm:py-16"
            : "sticky top-16 md:top-20 pt-3 pb-8 sm:pt-4 sm:pb-10 flex flex-col justify-start"
        }`}
      >
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Left Column: Narrative Ledger & Editorial Value Proposition (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="text-[0.6875rem] font-mono font-semibold uppercase tracking-[0.18em] text-accent mb-2.5">
                Memory retention
              </div>
              <h2
                id="retention-title"
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-tx leading-[1.12]"
              >
                Why studying without notes sticks under pressure
              </h2>
              <p className="mt-2.5 text-sm text-tx-2 leading-relaxed">
                Reading through an answer key feels easy because the solution is already in front of you. Reconstructing the answer from memory takes effort, but that effort is what keeps the concept in your head weeks later.
              </p>

              {/* Synchronized Milestone Narrative Ledger */}
              <div className="mt-5 space-y-2 border-t border-tx/10 pt-4" role="tablist" aria-label="Retention milestones">
                {MILESTONES.map((m, idx) => {
                  const isActive = activeMilestoneIdx === idx;
                  return (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => scrollToMilestone(idx)}
                      className={`w-full text-left rounded-lg transition-all duration-300 p-2.5 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                        isActive
                          ? "bg-accent/8 border-l-2 border-accent pl-3 shadow-xs"
                          : "opacity-60 hover:opacity-85 border-l-2 border-transparent pl-3"
                      }`}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <div className="flex items-center justify-between font-mono text-xs mb-1">
                        <span className="font-semibold text-accent">{m.num} / {m.day}</span>
                        {isActive ? (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                            Active stage
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-serif text-sm sm:text-base font-normal text-tx">
                        {m.headline}
                      </h3>

                      {/* Active Epoch Reveals Consequential Reality */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                          isActive ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-1 font-mono text-[11px] mb-1.5">
                            <div className="flex items-center gap-1.5 text-tx font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                              <span>{m.activeOutcome}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-tx-3">
                              <span className="h-1.5 w-1.5 rounded-full border border-dashed border-tx-3 shrink-0" aria-hidden="true" />
                              <span>{m.passiveOutcome}</span>
                            </div>
                          </div>
                          <p className="text-xs text-tx-2 leading-relaxed">
                            {m.detail}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Scroll Timeline Cue */}
              <div className="mt-3 flex items-center gap-2 text-[0.6875rem] font-mono text-tx-3">
                <span className="inline-block animate-bounce text-accent" aria-hidden="true">↓</span>
                <span>Scroll to scrub 30-day retention curve</span>
              </div>
            </div>

            {/* Right Column: Living Ink Canvas Drafting Plane (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Top Annotation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-tx/10 pb-2.5 mb-2 text-xs font-mono gap-2">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    <span className="font-medium text-tx">Unaided retrieval (Permanent ink)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-dashed border-tx-3 shrink-0" aria-hidden="true" />
                    <span className="text-tx-2">Passive reading (Evaporates)</span>
                  </div>
                </div>
                <span className="text-tx-3 text-[0.6875rem]">
                  30-day Ebbinghaus model
                </span>
              </div>

              {/* High-DPI Living Canvas */}
              <div className="w-full aspect-[16/11] min-h-[280px] max-h-[440px]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block select-none"
                  role="img"
                  aria-label="Living ink retention curve: unaided retrieval preserves 80% independent execution over 30 days while passive review fades to 18%."
                />
              </div>

              {/* Academic Citation Footer */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] text-tx-3 font-mono border-t border-tx/5 pt-2">
                <span>Empirical basis: Roediger &amp; Karpicke (2006); Karpicke &amp; Blunt (2011)</span>
                <span>Living ink physics · Pinned scroll stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
