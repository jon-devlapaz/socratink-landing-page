"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import styles from "./ending.module.css";

const LEDGER = [
  {
    day: "Day 01 · Cold baseline",
    quote: "More responses should give us a more accurate estimate…",
    body: null as string | null,
    note: "Preserved verbatim — the authored sentence, kept.",
    node: "hollow" as const,
  },
  {
    day: "Day 03 · Socratic repair",
    quote: null,
    body: "Variance decoupled from bias: “measuring 100,000 people just gives a very precise estimate of tall people.”",
    note: null,
    node: "filled" as const,
  },
  {
    day: "Day 14 · Unaided check",
    quote: null,
    body: "Mechanism recalled cold, without scaffolding. The bead closes the thread from the divergence above.",
    note: null,
    node: "terminal" as const,
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function Memory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [arrival, setArrival] = useState(0);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  // False during SSR, true after hydration — no setState-in-effect needed.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Arrival progress: 0 as the section enters the viewport, 1 once composed.
  // Same manual rAF-lerped family as the Retention scrub; reversible by construction.
  useEffect(() => {
    if (isReducedMotion) return;

    let target = 0;
    let current = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.001) {
        current = target;
        isRunning = false;
      }
      setArrival(current);
      if (isRunning) rafId = window.requestAnimationFrame(tick);
    };

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp01((vh - rect.top) / (vh * 0.7));
      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion]);

  // SSR, no-JS, and reduced-motion always render the resolved ledger.
  const q = !mounted || isReducedMotion ? 1 : arrival;

  const entryStyle = (index: number): CSSProperties => {
    const o = clamp01((q - index * 0.22) / 0.3);
    return { opacity: o, transform: `translateY(${(1 - o) * 18}px)` };
  };
  const bead = clamp01((q - 0.7) / 0.3);

  return (
    <section id="memory" ref={sectionRef} className={styles.memory} aria-labelledby="memory-title">
      <div className={`content-wrap ${styles.memoryGrid}`}>
        <div className={styles.memoryCopy}>
          <span className={styles.memoryEyebrow}>Longitudinal record</span>
          <h2 id="memory-title" className="notebook-display">
            Your thinking,
            <br />
            proven across time.
          </h2>
          <p className={styles.memoryDeck}>
            An answer tells you what happened once. A record proves that your understanding
            didn&apos;t evaporate before test day.
          </p>

          <p className={styles.memoryPrinciple}>
            The original words stay.
            <br />
            The proof compounds around them.
          </p>
        </div>

        <div className={styles.ledgerWrap}>
          <ol className={styles.ledger} aria-label="Longitudinal record">
            {LEDGER.map((entry, index) => (
              <li key={entry.day} className={styles.ledgerEntry} style={entryStyle(index)}>
                <span className={styles.ledgerRail} aria-hidden="true">
                  {entry.node === "terminal" ? (
                    <span
                      className={styles.terminalBead}
                      style={{ transform: `scale(${0.4 + 0.6 * bead})`, opacity: bead }}
                    />
                  ) : (
                    <span className={styles.ledgerNode} data-node={entry.node} />
                  )}
                </span>
                <span className={styles.ledgerText}>
                  <span className={styles.ledgerDay} data-accent={entry.node === "terminal"}>
                    {entry.day}
                  </span>
                  {entry.quote ? (
                    <blockquote className={styles.ledgerQuote}>“{entry.quote}”</blockquote>
                  ) : (
                    <span className={styles.ledgerBody}>{entry.body}</span>
                  )}
                  {entry.note ? <span className={styles.ledgerNote}>{entry.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.ledgerFoot}>Illustrated record · No measured outcome is claimed.</p>
        </div>
      </div>
    </section>
  );
}
