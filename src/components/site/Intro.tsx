"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { site } from "@/lib/content";

/*
  Entrance gate. The ink sphere is the only thing on screen, rippling idly with
  the wordmark beneath it, and holds until the visitor clicks (or presses Enter).
  Then it calms and glides to its place in the hero as the page fades in around it.

    "drop"    : bare paper, sphere large at viewport centre; waits for input
    "settle"  : sphere calms and travels to the hero; overlay and nav crossfade
    "done"    : overlay unmounts (settleMs after entering)
*/
export type IntroPhase = "drop" | "settle" | "done";

export const INTRO = {
  /** How long the settle transition runs before the overlay unmounts. */
  settleMs: 950,
  /** Delay before hero copy starts rising, measured from entering. */
  revealDelay: 0.15,
  /** Sphere scale while dropped, relative to its resting hero size. */
  dropScale: 2.1,
  /** Vertical centre of the dropped sphere as a fraction of the viewport height. */
  dropCentreY: 0.42,
  ease: [0.32, 0.72, 0, 1] as const,
} as const;

const SESSION_KEY = "socratink-intro-seen";

type IntroState = {
  phase: IntroPhase;
  /** True when the gate was skipped (reduced motion or already seen this session). */
  skipped: boolean;
  /** Leave the gate and reveal the page. No-op outside the "drop" phase. */
  enter: () => void;
};

const IntroContext = createContext<IntroState>({ phase: "done", skipped: true, enter: () => {} });

export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  // Server-render in "drop" so the first paint is the covered state, never a flash of content.
  const [phase, setPhase] = useState<IntroPhase>("drop");
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (!reduce && !seen) return;
    // From a timer so the server-rendered "drop" frame is committed before the change.
    const t = window.setTimeout(() => {
      setSkipped(true);
      setPhase("done");
    }, 0);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const enter = useCallback(() => {
    setPhase((current) => {
      if (current !== "drop") return current;
      window.sessionStorage.setItem(SESSION_KEY, "1");
      return "settle";
    });
  }, []);

  useEffect(() => {
    if (phase !== "settle") return;
    const t = window.setTimeout(() => setPhase("done"), INTRO.settleMs);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "drop") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, enter]);

  return <IntroContext.Provider value={{ phase, skipped, enter }}>{children}</IntroContext.Provider>;
}

/**
 * The paper curtain. Rendered inside the hero's stacking context so the sphere
 * can sit above it while everything else stays beneath. The whole surface is
 * the "enter" control.
 */
export function IntroOverlay() {
  const { phase, enter } = useIntro();
  const waiting = phase === "drop";
  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.button
          key="intro"
          type="button"
          aria-label={`Enter ${site.name}`}
          onClick={enter}
          className="fixed inset-0 z-40 block w-full cursor-pointer bg-paper text-left outline-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: waiting ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: INTRO.ease }}
        >
          <motion.span
            className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-5"
            style={{ top: `calc(${INTRO.dropCentreY * 100}vh + 10.5rem)` }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: waiting ? 1 : 0, y: waiting ? 0 : -4 }}
            transition={{ duration: 0.7, delay: waiting ? 0.45 : 0, ease: INTRO.ease }}
          >
            <Image
              src="/brand/socratink_wordmark.png"
              alt=""
              width={489}
              height={88}
              priority
              className="wordmark-img h-[1.35rem] w-auto"
            />
            <motion.span
              className="text-[0.75rem] tracking-[0.02em] text-tx-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: waiting ? 1 : 0 }}
              transition={{ duration: 0.9, delay: waiting ? 2.2 : 0 }}
            >
              Click anywhere to enter
            </motion.span>
          </motion.span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
