"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { StepId } from "./steps";

const ORDERED_STEPS: StepId[] = ["target", "explain", "inspect"];

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

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export interface UseStepScrollProgressOptions {
  trackRef: React.RefObject<HTMLElement | null>;
  stickyRef: React.RefObject<HTMLElement | null>;
}

export interface UseStepScrollProgressResult {
  active: StepId | null;
  progress: number;
  isReducedMotion: boolean;
}

export function useStepScrollProgress({
  trackRef,
  stickyRef,
}: UseStepScrollProgressOptions): UseStepScrollProgressResult {
  const [scrollProgress, setScrollProgress] = useState(0);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (isReducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.14;
      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
        isRunning = false;
      }

      setScrollProgress(currentProgress);
      if (isRunning) rafId = window.requestAnimationFrame(tick);
    };

    const updateProgress = () => {
      const sticky = stickyRef.current;
      const navTop = window.innerWidth >= 768 ? 80 : 64;
      const stickyHeight = sticky?.offsetHeight ?? window.innerHeight - navTop;
      // Oversized sheets travel far enough to expose their last line before pinning.
      const stickyTop = Math.min(navTop, window.innerHeight - stickyHeight - 12);
      sticky?.style.setProperty("--how-sticky-top", `${stickyTop}px`);
      const rect = track.getBoundingClientRect();
      const totalTravel = rect.height - stickyHeight;

      if (totalTravel <= 0) {
        targetProgress = 1;
      } else {
        const scrolled = stickyTop - rect.top;
        targetProgress = clamp(scrolled / totalTravel);
      }

      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const observer = new ResizeObserver(updateProgress);
    observer.observe(track);
    if (stickyRef.current) observer.observe(stickyRef.current);
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion, stickyRef, trackRef]);

  const effectiveProgress = isReducedMotion ? 1 : scrollProgress;
  // Reduced motion shows all steps in calm, equal ink — no highlight.
  const active: StepId | null = isReducedMotion
    ? null
    : effectiveProgress < 0.33
      ? ORDERED_STEPS[0]
      : effectiveProgress < 0.66
        ? ORDERED_STEPS[1]
        : ORDERED_STEPS[2];

  return {
    active,
    progress: effectiveProgress,
    isReducedMotion,
  };
}
