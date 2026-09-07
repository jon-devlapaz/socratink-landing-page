"use client";

import { useLayoutEffect, useRef } from "react";
import { useMotionValueEvent, useScroll, type MotionValue } from "motion/react";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Publishes --act-p (0..1) on the target element from its scroll travel.
 * Reduced-motion presentation is handled in CSS so this hook does not
 * branch on window during render.
 */
export function useActProgress(offset: ScrollOffset = ["start start", "end end"]): {
  ref: React.RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
} {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });

  useLayoutEffect(() => {
    ref.current?.style.setProperty("--act-p", scrollYProgress.get().toFixed(4));
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    ref.current?.style.setProperty("--act-p", value.toFixed(4));
  });

  return { ref, progress: scrollYProgress };
}
