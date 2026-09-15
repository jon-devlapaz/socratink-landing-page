"use client";

import { useEffect, useRef } from "react";

type ScrollOffset = [string, string];

/**
 * Publishes --act-p (0..1) on the target element from its scroll travel.
 * Lightweight vanilla implementation replacing motion/react.
 */
export function useActProgress(offset: ScrollOffset = ["start start", "end end"]): {
  ref: React.RefObject<HTMLElement | null>;
} {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const [start, end] = offset;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = 0;

      if (start === "start start" && end === "end start") {
        p = rect.height > 0 ? Math.min(1, Math.max(0, -rect.top / rect.height)) : 0;
      } else if (start === "start end" && end === "end start") {
        const total = vh + rect.height;
        p = total > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / total)) : 0;
      } else {
        const total = vh + rect.height;
        p = total > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / total)) : 0;
      }

      el.style.setProperty("--act-p", p.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset]);

  return { ref };
}
