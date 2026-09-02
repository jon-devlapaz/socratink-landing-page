"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { site } from "@/lib/content";

/*
  Entrance sequence. The ink sphere is the only thing on screen; it settles from
  agitated to calm, then glides to its place in the hero as the page fades in around it.

  Timeline (ms from mount):
    0     "drop"    : bare paper, sphere large and agitated at viewport centre
    1350  "settle"  : sphere calms and travels to the hero; overlay and nav crossfade
    1500            : hero content begins its staggered reveal
    2300  "done"    : overlay unmounts
*/
export type IntroPhase = "drop" | "settle" | "done";

export const INTRO = {
  settleAt: 1350,
  revealAt: 1500,
  doneAt: 2300,
  /** Sphere scale while dropped, relative to its resting hero size. */
  dropScale: 2.1,
  /** Vertical centre of the dropped sphere as a fraction of the viewport height. */
  dropCentreY: 0.42,
  ease: [0.32, 0.72, 0, 1] as const,
} as const;

const SESSION_KEY = "socratink-intro-seen";

type IntroState = {
  phase: IntroPhase;
  /** True when the sequence was skipped (reduced motion or already seen this session). */
  skipped: boolean;
};

const IntroContext = createContext<IntroState>({ phase: "done", skipped: true });

export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  // Server-render in "drop" so the first paint is the covered state, never a flash of content.
  const [state, setState] = useState<IntroState>({ phase: "drop", skipped: false });

  useEffect(() => {
    const seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    const skip = Boolean(reduce) || seen;
    // Every transition, including the immediate skip, runs from a timer so the
    // server-rendered "drop" frame is committed before the first change. The
    // session flag is written only on completion so an interrupted effect
    // (Strict Mode, fast unmount) doesn't count as a viewing.
    const timers = skip
      ? [window.setTimeout(() => setState({ phase: "done", skipped: true }), 0)]
      : [
          window.setTimeout(() => setState({ phase: "settle", skipped: false }), INTRO.settleAt),
          window.setTimeout(() => {
            window.sessionStorage.setItem(SESSION_KEY, "1");
            setState({ phase: "done", skipped: false });
          }, INTRO.doneAt),
        ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  return <IntroContext.Provider value={state}>{children}</IntroContext.Provider>;
}

/**
 * The paper curtain. Rendered inside the hero's stacking context so the sphere
 * can sit above it while everything else stays beneath.
 */
export function IntroOverlay() {
  const { phase } = useIntro();
  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="intro"
          aria-hidden
          className="fixed inset-0 z-40 bg-paper"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "settle" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: INTRO.ease }}
        >
          <motion.p
            className="absolute left-1/2 -translate-x-1/2 font-serif text-[1.35rem] text-tx-2"
            style={{ top: `calc(${INTRO.dropCentreY * 100}vh + 10.5rem)` }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: phase === "drop" ? 1 : 0, y: phase === "drop" ? 0 : -4 }}
            transition={{ duration: 0.7, delay: phase === "drop" ? 0.45 : 0, ease: INTRO.ease }}
          >
            {site.name}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
