"use client";

import { useEffect } from "react";

/** Canvas stops in document order. Warm cream breath, never a theme cut. */
const STOPS: readonly [number, string][] = [
  [0, "#fffcf0"],
  [0.28, "#faf8f0"],
  [0.52, "#f7f5ed"],
  [0.78, "#fffcf0"],
  [1, "#fffcf0"],
];

function parseHex(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bch = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bch).toString(16).slice(1)}`;
}

function colorAt(p: number): string {
  const clamped = Math.min(1, Math.max(0, p));
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i - 1];
    const [t2, c2] = STOPS[i];
    if (clamped <= t2) {
      const span = t2 - t1;
      return lerpHex(c1, c2, span <= 0 ? 0 : (clamped - t1) / span);
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/**
 * Page-ground drift: the canvas interpolates as you travel so the site reads as
 * one place rather than a stack of slides. Disabled under reduced motion.
 */
export function GroundDrift() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const root = document.documentElement;

    const paint = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const p = max <= 0 ? 0 : window.scrollY / max;
      root.style.setProperty("--paper", colorAt(p));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty("--paper");
    };
  }, []);

  return null;
}
