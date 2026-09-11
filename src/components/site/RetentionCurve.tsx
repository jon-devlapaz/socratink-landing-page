"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

interface MilestoneData {
  id: string;
  day: string;
  label: string;
  headline: string;
  passivePct: string;
  unassistedPct: string;
  deltaLabel: string;
  detail: string;
}

const MILESTONES: MilestoneData[] = [
  {
    id: "day-1",
    day: "Day 1",
    label: "Immediate session",
    headline: "The Fluency Trap",
    passivePct: "88%",
    unassistedPct: "74%",
    deltaLabel: "Early illusion",
    detail:
      "Assisted review feels easy because the answer is already visible. Unaided diagnostic recall requires upfront effort, building the neural scaffolding that preserves memory.",
  },
  {
    id: "day-7",
    day: "Day 7",
    label: "One week out",
    headline: "The Forgetting Cliff",
    passivePct: "34%",
    unassistedPct: "84%",
    deltaLabel: "+50% advantage",
    detail:
      "Passive recognition collapses within days once prompts disappear. A single unassisted diagnostic session maintains rapid conceptual recall without notes.",
  },
  {
    id: "day-30",
    day: "Day 30",
    label: "Live exam or problem",
    headline: "Independent Recall",
    passivePct: "18%",
    unassistedPct: "80%",
    deltaLabel: "+62% retention",
    detail:
      "When exams or technical problems demand independent execution, passive review retains under a fifth. Unaided practice locks in 80% direct recall.",
  },
];

// Single source of truth for both the drawn SVG paths and the playhead math,
// so tracking nodes always sit exactly on the curves. Control points mirror
// the `d=` attributes of the two curve paths below.
const X_SEG_1 = [70, 140, 200, 270] as const;
const X_SEG_2 = [270, 340, 400, 470] as const;
const PASSIVE_SEG_1 = [51, 65, 130, 152] as const;
const PASSIVE_SEG_2 = [152, 172, 180, 182] as const;
const UNAIDED_SEG_1 = [77, 64, 56, 58] as const;
const UNAIDED_SEG_2 = [58, 60, 64, 66] as const;

// Crossover of the two cubics in segment 1 (~Day 2): passive feels ahead
// left of here, then fades. Solved numerically from the segment polynomials.
const CROSSOVER = { x: 119, y: 69, t: 0.24 };

function cubic(
  t: number,
  p0: number,
  c1: number,
  c2: number,
  p1: number,
): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
}

function interpolateCoordinates(p: number) {
  const clamped = Math.max(0, Math.min(1, p));
  let x: number;
  let py: number;
  let uy: number;
  let ppct: number;
  let upct: number;

  if (clamped <= 0.5) {
    const t = clamped / 0.5;
    x = cubic(t, ...X_SEG_1);
    py = cubic(t, ...PASSIVE_SEG_1);
    uy = cubic(t, ...UNAIDED_SEG_1);
    ppct = Math.round(88 - t * 54);
    upct = Math.round(74 + t * 10);
  } else {
    const t = (clamped - 0.5) / 0.5;
    x = cubic(t, ...X_SEG_2);
    py = cubic(t, ...PASSIVE_SEG_2);
    uy = cubic(t, ...UNAIDED_SEG_2);
    ppct = Math.round(34 - t * 16);
    upct = Math.round(84 - t * 4);
  }

  return { x, py, uy, ppct, upct };
}

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

export function RetentionCurve() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const deltaGradientId = useId();
  const [progress, setProgress] = useState(0); // Starts at Day 1 (The Fluency Trap)
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (isReducedMotion) return;

    const card = cardRef.current ?? sectionRef.current;
    if (!card) return;

    let targetP = 0;
    let currentP = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      currentP += (targetP - currentP) * 0.12;
      if (Math.abs(targetP - currentP) < 0.001) {
        currentP = targetP;
        isRunning = false;
      }
      setProgress(currentP);
      if (isRunning) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start scrubbing when the chart enters the comfortable viewing zone (middle of viewport)
      // and complete as the chart scrolls up toward the top third
      const start = vh * 0.48;
      const end = -vh * 0.08;
      const travel = start - end;
      const raw = (start - rect.top) / travel;
      targetP = Math.max(0, Math.min(1, raw));

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

  const activeP = isReducedMotion ? 0.5 : progress;
  const { x, py, uy, ppct, upct } = interpolateCoordinates(activeP);

  // Active milestone index based on scrub position
  const activeMilestoneIdx = activeP < 0.33 ? 0 : activeP < 0.68 ? 1 : 2;

  // Compute delta readout for playhead
  const deltaValue = upct - ppct;
  const deltaText =
    deltaValue > 0 ? `+${deltaValue}% retained` : "Fluency gap";

  return (
    <section
      id="retention-science"
      ref={sectionRef}
      aria-labelledby="retention-title"
      className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Section Header */}
      <div className="mb-8 sm:mb-10">
        <div className="text-[0.6875rem] font-mono font-semibold uppercase tracking-[0.14em] text-accent mb-2">
          Cognitive Architecture
        </div>
        <h2
          id="retention-title"
          className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-tx"
        >
          Why unassisted recall holds under pressure
        </h2>
        <p className="mt-2 text-sm sm:text-base text-tx-2 max-w-xl leading-relaxed">
          Assisted review creates the illusion of mastery while memory decays. Unaided retrieval trains the brain to reconstruct solutions from first principles.
        </p>
      </div>

      {/* Main Graph & Ambient Scrubber Shell */}
      <div
        ref={cardRef}
        className="rounded-2xl border border-tx/15 bg-paper-2/70 p-4 sm:p-7 shadow-sm backdrop-blur-md"
      >
        {/* Header Bar: Legend & Model Basis */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tx/10 pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-5 rounded-full bg-accent" aria-hidden="true" />
              <span className="font-medium text-tx">Unaided retrieval (Socratink)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-5 border-b-2 border-dashed border-tx-3" aria-hidden="true" />
              <span className="text-tx-2">Passive review &amp; AI autocomplete</span>
            </div>
          </div>
          <span className="text-[0.6875rem] font-mono text-tx-3">
            Scroll-scrubbed retention model · 30 days
          </span>
        </div>

        {/* Ambient SVG Curve Canvas */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox="0 0 540 240"
            className="w-full h-auto overflow-visible select-none"
            role="img"
            aria-label="Retention curve showing unaided retrieval sustaining 80% recall over 30 days while passive review drops to 18%"
          >
            <defs>
              {/* Base Gradient under unaided curve */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>

              {/* Exact Divergence Delta Gradient */}
              <linearGradient id={deltaGradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.24" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <g className="stroke-tx/10" strokeDasharray="3 3">
              <line x1="45" y1="28" x2="520" y2="28" />
              <line x1="45" y1="78" x2="520" y2="78" />
              <line x1="45" y1="128" x2="520" y2="128" />
              <line x1="45" y1="178" x2="520" y2="178" />
              <line x1="45" y1="216" x2="520" y2="216" strokeDasharray="none" className="stroke-tx/20" />
            </g>

            {/* Y-Axis Labels: Integrated units, zero rotated neck-craning */}
            <g className="fill-tx-3 text-[10px] font-mono">
              <text x="40" y="24" textAnchor="start">100% recall</text>
              <text x="36" y="82" textAnchor="end">75%</text>
              <text x="36" y="132" textAnchor="end">50%</text>
              <text x="36" y="182" textAnchor="end">25%</text>
              <text x="36" y="219" textAnchor="end">0%</text>
            </g>

            {/* Area Fill Under Unaided Curve (Base) */}
            <path
              d="M 70 77 C 140 64, 200 56, 270 58 C 340 60, 400 64, 470 66 L 470 216 L 70 216 Z"
              fill={`url(#${gradientId})`}
            />

            {/* Shaded Divergence Gap: "The Phantom Knowledge / Durable Recall Delta"
                Exact mathematical closed polygon from Crossover (~Day 2) to Day 30 */}
            <path
              d="M 119 69 C 170 61, 217 56.5, 270 58 C 340 60, 400 64, 470 66 L 470 182 C 400 180, 340 172, 270 152 C 217 135, 170 94, 119 69 Z"
              fill={`url(#${deltaGradientId})`}
            />

            {/* Delta region architectural label */}
            <text
              x="376"
              y="118"
              textAnchor="middle"
              className="fill-accent text-[9px] font-mono font-bold tracking-wider opacity-85 select-none"
            >
              DURABLE RETENTION DELTA (+62%)
            </text>

            {/* Curve 1: Passive Review / AI Autocomplete (Decay Curve) */}
            <path
              d="M 70 51 C 140 65, 200 130, 270 152 C 340 172, 400 180, 470 182"
              fill="none"
              stroke="var(--tx-3)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Curve 2: Unaided Retrieval (Sustained Plateau) */}
            <path
              d="M 70 77 C 140 64, 200 56, 270 58 C 340 60, 400 64, 470 66"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Architectural Crossover Callout (~Day 2) */}
            <g aria-hidden="true">
              <line
                x1={CROSSOVER.x}
                y1={CROSSOVER.y}
                x2={CROSSOVER.x}
                y2="38"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-60"
              />
              <circle
                cx={CROSSOVER.x}
                cy={CROSSOVER.y}
                r="4.5"
                fill="var(--paper)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              <circle cx={CROSSOVER.x} cy={CROSSOVER.y} r="1.5" fill="var(--accent)" />
              <g transform={`translate(${CROSSOVER.x + 8}, 36)`}>
                <text className="fill-tx text-[10px] font-mono font-semibold">
                  The Crossover · ~Day 2
                </text>
                <text y="12" className="fill-tx-3 text-[9px] font-mono">
                  Passive recognition decays · Retrieval solidifies
                </text>
              </g>
            </g>

            {/* Milestone Reference Markers (Day 1, Day 7, Day 30) */}
            {[
              { x: 70, py: 51, uy: 77, label: "Day 1", idx: 0 },
              { x: 270, py: 152, uy: 58, label: "Day 7", idx: 1 },
              { x: 470, py: 182, uy: 66, label: "Day 30", idx: 2 },
            ].map((m) => {
              const isClose = activeMilestoneIdx === m.idx;
              return (
                <g key={m.label}>
                  <circle
                    cx={m.x}
                    cy={m.py}
                    r={isClose ? 4.5 : 3}
                    fill="var(--paper-2)"
                    stroke="var(--tx-3)"
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={m.x}
                    cy={m.uy}
                    r={isClose ? 5.5 : 4}
                    fill="var(--accent)"
                    stroke="var(--paper)"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  <text
                    x={m.x}
                    y="232"
                    textAnchor="middle"
                    className={`text-[11px] font-mono transition-colors duration-200 ${
                      isClose ? "fill-accent font-bold" : "fill-tx-3"
                    }`}
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}

            {/* Ambient Vertical Playhead Line (Scroll-Scrubbed) */}
            <line
              x1={x}
              y1="28"
              x2={x}
              y2="216"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              className="opacity-60"
            />

            {/* Dynamic Playhead Value Pill Gauge:
                Position clamped so pill never overflows SVG edges.
                Displays humanized delta metric directly on the cursor. */}
            <g
              transform={`translate(${Math.max(105, Math.min(435, x))}, 18)`}
              className="transition-transform duration-75"
            >
              <title>{`Unaided ${upct}% vs passive ${ppct}% recall (${deltaText})`}</title>
              <rect
                x="-90"
                y="-14"
                width="180"
                height="22"
                rx="11"
                fill="var(--paper)"
                stroke="var(--accent)"
                strokeWidth="1"
                className="shadow-sm"
              />
              <text
                x="0"
                y="1"
                textAnchor="middle"
                className="text-[9.5px] font-mono font-medium fill-tx select-none"
              >
                <tspan className="fill-accent font-bold">{upct}% unaided</tspan>
                <tspan className="fill-tx-3"> · </tspan>
                <tspan className="fill-tx-2">{ppct}% passive</tspan>
                <tspan className="fill-accent font-semibold text-[8.5px]"> ({deltaText})</tspan>
              </text>
            </g>

            {/* Tracking Nodes on Both Curves */}
            <circle
              cx={x}
              cy={py}
              r="4.5"
              fill="var(--paper-2)"
              stroke="var(--tx-3)"
              strokeWidth="2"
              className="shadow-sm"
            />
            <circle
              cx={x}
              cy={uy}
              r="6"
              fill="var(--accent)"
              stroke="var(--paper)"
              strokeWidth="2"
              className="shadow-sm"
            />
          </svg>
        </div>

        {/* Open 3-Column Comparative Ledger (Zero Clicking Required) */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 border-t border-tx/10 pt-6">
          {MILESTONES.map((m, idx) => {
            const isActive = activeMilestoneIdx === idx;
            return (
              <div
                key={m.id}
                className={`flex flex-col rounded-xl p-4 transition-all duration-300 ${
                  isActive
                    ? "border border-accent/40 bg-paper shadow-md scale-[1.01]"
                    : "border border-tx/10 bg-paper/40 opacity-80"
                }`}
              >
                {/* Milestone Badge & Status */}
                <div className="flex items-center justify-between gap-2 border-b border-tx/10 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold ${
                        isActive
                          ? "bg-accent/15 text-accent"
                          : "bg-tx/5 text-tx-2"
                      }`}
                    >
                      {m.day}
                    </span>
                    <h3 className="text-xs font-semibold text-tx">
                      {m.headline}
                    </h3>
                  </div>

                  {/* Restrained Active Status Badge (Eliminated animate-ping) */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] font-mono font-medium text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                      Active phase
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-tx-3">
                      {m.deltaLabel}
                    </span>
                  )}
                </div>

                {/* Metric Delta Comparison */}
                <div className="flex items-center gap-3 font-mono text-xs mb-2">
                  <span className="text-accent font-bold">
                    Socratink: {m.unassistedPct}
                  </span>
                  <span className="text-tx-3">
                    Passive: {m.passivePct}
                  </span>
                </div>

                {/* Direct Factual Narrative */}
                <p className="text-xs text-tx-2 leading-relaxed flex-1">
                  {m.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Academic Grounding & Protocol Footnote */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[0.6875rem] text-tx-3 font-mono">
          <span>Empirical basis: Roediger &amp; Karpicke (2006, Science); Karpicke &amp; Blunt (2011)</span>
          <span>Scroll to scrub · Day 1 → Day 30</span>
        </div>
      </div>
    </section>
  );
}
