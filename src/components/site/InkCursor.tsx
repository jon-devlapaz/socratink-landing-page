"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const FINE_POINTER = "(pointer: fine) and (hover: hover)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
const FOLLOW = 0.2;

function subscribeFinePointer(callback: () => void) {
  const media = window.matchMedia(FINE_POINTER);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCE_MOTION);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getFinePointer() {
  return window.matchMedia(FINE_POINTER).matches;
}

function getReducedMotion() {
  return window.matchMedia(REDUCE_MOTION).matches;
}

/**
 * Quiet wet-ink pointer follower for mouse / fine pointers.
 * One small drop. Native cursor stays. No touch, no reduced-motion motion.
 */
export function InkCursor() {
  const node = useRef<HTMLDivElement>(null);
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointer,
    () => false,
  );
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => true,
  );

  useEffect(() => {
    if (!finePointer || reduceMotion) return;
    const el = node.current;
    if (!el) return;

    let x = 0;
    let y = 0;
    let endX = 0;
    let endY = 0;
    let armed = false;
    let raf = 0;

    const tick = () => {
      x += (endX - x) * FOLLOW;
      y += (endY - y) * FOLLOW;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.hypot(endX - x, endY - y) > 0.15) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      endX = event.clientX;
      endY = event.clientY;
      if (!armed) {
        armed = true;
        x = endX;
        y = endY;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.classList.add("is-on");
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      el.classList.remove("is-on");
      armed = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [finePointer, reduceMotion]);

  if (!finePointer || reduceMotion) return null;

  return (
    <div ref={node} className="ink-cursor" data-ink-cursor="" aria-hidden="true">
      <span className="ink-cursor-drop" />
    </div>
  );
}
