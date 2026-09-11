"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { StepId } from "./steps";

const STEP_DURATION_MS = 6500; // 6.5s per step
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

function subscribeVisibility(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilitySnapshot() {
  if (typeof document === "undefined") return true;
  return !document.hidden;
}

function getVisibilityServerSnapshot() {
  return true;
}

export interface UseStepAutoAdvanceOptions {
  containerRef: React.RefObject<HTMLElement | null>;
}

export interface UseStepAutoAdvanceResult {
  active: StepId;
  locked: boolean;
  isPaused: boolean;
  progress: number;
  isReducedMotion: boolean;
  selectStep: (id: StepId) => void;
  togglePause: () => void;
  setIsHovered: (hovered: boolean) => void;
  setIsFocused: (focused: boolean) => void;
}

export function useStepAutoAdvance({
  containerRef,
}: UseStepAutoAdvanceOptions): UseStepAutoAdvanceResult {
  const [active, setActive] = useState<StepId>("target");
  const [locked, setLocked] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isDocumentVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot
  );

  // IntersectionObserver to only advance when >= 40% in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.4);
      },
      { threshold: [0, 0.4, 0.8] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  const shouldAdvance =
    !isReducedMotion &&
    !locked &&
    !userPaused &&
    isInView &&
    isDocumentVisible &&
    !isHovered &&
    !isFocused;

  // Single animation timer via requestAnimationFrame for smooth scaleX
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const advanceToNext = useCallback(() => {
    setActive((curr) => {
      const currIdx = ORDERED_STEPS.indexOf(curr);
      const nextIdx = (currIdx + 1) % ORDERED_STEPS.length;
      if (nextIdx === 0 && currIdx === ORDERED_STEPS.length - 1) {
        setLocked(true);
        progressRef.current = 1;
        setProgress(1);
        return curr;
      }
      progressRef.current = 0;
      setProgress(0);
      startTimeRef.current = null;
      return ORDERED_STEPS[nextIdx];
    });
  }, []);

  useEffect(() => {
    if (!shouldAdvance) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const elapsedOffset = progressRef.current * STEP_DURATION_MS;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - elapsedOffset;
      }

      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min(elapsed / STEP_DURATION_MS, 1);
      progressRef.current = currentProgress;
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        advanceToNext();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [shouldAdvance, active, advanceToNext]);

  const selectStep = useCallback((id: StepId) => {
    setActive(id);
    setLocked(true); // user interaction locks auto-advance
    progressRef.current = 1;
    setProgress(1);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const togglePause = useCallback(() => {
    setUserPaused((prev) => {
      const next = !prev;
      if (!next) {
        // If resuming, also unlock
        setLocked(false);
        startTimeRef.current = null;
      }
      return next;
    });
  }, []);

  return {
    active,
    locked,
    isPaused: !shouldAdvance,
    progress: isReducedMotion ? 1 : progress,
    isReducedMotion,
    selectStep,
    togglePause,
    setIsHovered,
    setIsFocused,
  };
}
