"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(pointer: fine)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

interface AnimatedCursorProps {
  /** RGB triplet string, e.g. "58, 169, 159" (Socratink Teal) or "237, 17, 100" (Subzero Magenta) */
  color?: string;
  /** RGB triplet string when hovering over accent/teal buttons, e.g. "255, 252, 240" (Flexoki Creme) */
  cremeColor?: string;
  innerSize?: number;
  outerSize?: number;
  innerScale?: number;
  outerScale?: number;
  trailingSpeed?: number;
}

export function AnimatedCursor({
  color = "58, 169, 159", // Default to Socratink Teal
  cremeColor = "255, 252, 240", // Flexoki Creme / Paper
  innerSize = 10,
  outerSize = 10,
  innerScale = 0.7,
  outerScale = 3.2,
  trailingSpeed = 0.7,
}: AnimatedCursorProps) {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [isActiveClickable, setIsActiveClickable] = useState(false);
  const [isOverAccent, setIsOverAccent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isClickableRef = useRef(false);
  const isOverAccentRef = useRef(false);

  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );

  const endX = useRef(0);
  const endY = useRef(0);
  const cursorX = useRef(0);
  const cursorY = useRef(0);

  useEffect(() => {
    if (!isFinePointer) return;

    // Apply cursor: none to body while active
    document.body.classList.add("custom-cursor-active");

    const checkClickable = (target: HTMLElement | null) => {
      if (!target) return false;
      return Boolean(
        target.closest(
          'a, button, [role="button"], input, select, textarea, label, [data-cursor-hover], .clickable'
        )
      );
    };

    const checkAccentTarget = (target: HTMLElement | null) => {
      if (!target) return false;
      // Fast path: explicit class or attribute
      if (
        target.closest(
          '.btn-accent, .encounter-cta, .bg-accent, [data-cursor-creme], [data-cursor="creme"], [data-cursor="cream"]'
        )
      ) {
        return true;
      }
      // Check if inside a button/anchor with teal background
      const btn = target.closest('a, button, [role="button"]');
      if (btn) {
        const bg = window.getComputedStyle(btn).backgroundColor;
        if (bg.includes("36, 131, 123") || bg.includes("58, 169, 159")) {
          return true;
        }
      }
      return false;
    };

    const updateTargets = (target: HTMLElement | null) => {
      const clickable = checkClickable(target);
      if (clickable !== isClickableRef.current) {
        isClickableRef.current = clickable;
        setIsActiveClickable(clickable);
      }

      const accent = checkAccentTarget(target);
      if (accent !== isOverAccentRef.current) {
        isOverAccentRef.current = accent;
        setIsOverAccent(accent);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      endX.current = e.clientX;
      endY.current = e.clientY;

      if (!isVisible) setIsVisible(true);

      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.top = `${e.clientY}px`;
        cursorInnerRef.current.style.left = `${e.clientX}px`;
      }

      updateTargets(e.target as HTMLElement);
    };

    const onMouseDown = () => setIsActive(true);
    const onMouseUp = () => setIsActive(false);

    const onMouseLeave = () => {
      isClickableRef.current = false;
      isOverAccentRef.current = false;
      setIsActiveClickable(false);
      setIsOverAccent(false);
      setIsVisible(false);
    };

    const onMouseEnter = () => setIsVisible(true);

    const onMouseOver = (e: MouseEvent) => {
      updateTargets(e.target as HTMLElement);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    // rAF loop for smooth lerp trailing on outer circle (trailingSpeed: 0.7)
    let animationFrameId: number;
    const render = () => {
      cursorX.current += (endX.current - cursorX.current) * trailingSpeed;
      cursorY.current += (endY.current - cursorY.current) * trailingSpeed;

      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.top = `${cursorY.current}px`;
        cursorOuterRef.current.style.left = `${cursorX.current}px`;
      }

      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isFinePointer, isVisible, trailingSpeed]);

  if (!isFinePointer) return null;

  const activeColor = isOverAccent ? cremeColor : color;

  return (
    <>
      {/* Outer Halo / Follower (matches Subzero lerp) */}
      <div
        ref={cursorOuterRef}
        style={{
          width: `${outerSize}px`,
          height: `${outerSize}px`,
          boxSizing: "border-box",
          backgroundColor: `rgba(${activeColor}, ${
            isActiveClickable ? (isOverAccent ? 0.22 : 0.15) : 0.4
          })`,
          border: isActiveClickable
            ? `1px solid rgba(${activeColor}, ${isOverAccent ? 0.95 : 0.7})`
            : "1px solid transparent",
          boxShadow: isOverAccent
            ? "0 0 10px rgba(255, 252, 240, 0.45)"
            : "none",
          transform: `translate(-50%, -50%) scale(${
            isActive ? 0.75 : isActiveClickable ? outerScale : 1
          })`,
          opacity: isVisible ? 1 : 0,
          transition:
            "opacity 0.15s ease-in-out, transform 0.2s cubic-bezier(0.2, 0, 0, 1), background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
          zIndex: 999999,
          position: "fixed",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Inner Dot (1:1 tracking) */}
      <div
        ref={cursorInnerRef}
        style={{
          width: `${innerSize}px`,
          height: `${innerSize}px`,
          backgroundColor: `rgb(${activeColor})`,
          boxShadow: isOverAccent
            ? "0 0 4px rgba(255, 252, 240, 0.7)"
            : "none",
          transform: `translate(-50%, -50%) scale(${
            isActive ? 0.8 : isActiveClickable ? innerScale : 1
          })`,
          opacity: isVisible ? 1 : 0,
          transition:
            "opacity 0.15s ease-in-out, transform 0.15s ease-in-out, background-color 0.18s ease, box-shadow 0.18s ease",
          zIndex: 999999,
          position: "fixed",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
