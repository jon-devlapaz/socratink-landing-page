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

/**
 * Authentic Socratink Smooth Cursor, ported from app.socratink.ai.
 * - In neutral space: organic ink orb matching brand mark (var(--mark-fill)).
 * - Over text / typography: morphs into an elegant vertical ink caret (1.5px x 18px).
 * - Over clickable actions: morphs into a responsive ring.
 */
export function AnimatedCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);

  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  const cursorX = useRef(0);
  const cursorY = useRef(0);
  const endX = useRef(0);
  const endY = useRef(0);

  const targetStateRef = useRef<"default" | "text" | "clickable">("default");

  useEffect(() => {
    if (!isFinePointer) return;

    document.body.classList.add("custom-cursor-active");

    const checkState = (target: HTMLElement | null): "default" | "text" | "clickable" => {
      if (!target) return "default";

      // 1. Check clickable first
      if (
        target.closest(
          'a, button, [role="button"], [data-cursor="clickable"], .btn-primary, .btn-accent, .btn-ghost',
        )
      ) {
        return "clickable";
      }

      // 2. Check text elements
      if (
        target.closest(
          'h1, h2, h3, h4, h5, h6, p, blockquote, figcaption, input, textarea, [data-cursor="text"], .notebook-display, .hero-title, .hero-trust, .encounter-q',
        )
      ) {
        return "text";
      }

      return "default";
    };

    const applyState = (state: "default" | "text" | "clickable", activePress = false) => {
      if (!orbRef.current || !caretRef.current) return;

      if (state === "text") {
        orbRef.current.style.opacity = "0";
        orbRef.current.style.transform = "translate(-50%, -50%) scale(0.25)";
        orbRef.current.style.filter = "blur(4px)";

        caretRef.current.style.opacity = "1";
        caretRef.current.style.transform = `translate(-50%, -50%) scale(${activePress ? 0.9 : 1})`;
        caretRef.current.style.filter = "none";
      } else if (state === "clickable") {
        orbRef.current.style.opacity = "1";
        orbRef.current.style.transform = `translate(-50%, -50%) scale(${activePress ? 1.3 : 1.6})`;
        orbRef.current.style.filter = "none";

        caretRef.current.style.opacity = "0";
        caretRef.current.style.transform = "translate(-50%, -50%) scale(0.25)";
        caretRef.current.style.filter = "blur(4px)";
      } else {
        orbRef.current.style.opacity = "1";
        orbRef.current.style.transform = `translate(-50%, -50%) scale(${activePress ? 0.85 : 1})`;
        orbRef.current.style.filter = "none";

        caretRef.current.style.opacity = "0";
        caretRef.current.style.transform = "translate(-50%, -50%) scale(0.25)";
        caretRef.current.style.filter = "blur(4px)";
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      endX.current = e.clientX;
      endY.current = e.clientY;

      if (!isVisible) setIsVisible(true);

      const nextState = checkState(e.target as HTMLElement);
      if (nextState !== targetStateRef.current) {
        targetStateRef.current = nextState;
        applyState(nextState);
      }
    };

    const onMouseDown = () => applyState(targetStateRef.current, true);
    const onMouseUp = () => applyState(targetStateRef.current, false);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    let rafId: number;
    const render = () => {
      cursorX.current += (endX.current - cursorX.current) * 0.85;
      cursorY.current += (endY.current - cursorY.current) * 0.85;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${cursorX.current}px, ${cursorY.current}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isFinePointer, isVisible]);

  if (!isFinePointer) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "20px",
        height: "20px",
        pointerEvents: "none",
        zIndex: 999999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.15s ease-out",
        willChange: "transform",
      }}
    >
      {/* Signature Organic Ink Orb (app.socratink.ai parity) */}
      <div
        ref={orbRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "10px",
          height: "10px",
          borderRadius: "48% 52% 49% 51% / 52% 48%",
          background: "var(--mark-fill)",
          boxShadow: "inset 0 -1px 2px rgba(255, 255, 255, 0.08), 0 0.5px 2px rgba(16, 15, 15, 0.28)",
          transformOrigin: "50% 50%",
          transform: "translate(-50%, -50%) scale(1)",
          transition:
            "transform 0.16s cubic-bezier(0.2, 0, 0, 1), opacity 0.16s cubic-bezier(0.2, 0, 0, 1), filter 0.16s cubic-bezier(0.2, 0, 0, 1)",
        }}
      />

      {/* Typography Text Caret (app.socratink.ai parity) */}
      <div
        ref={caretRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1.5px",
          height: "18px",
          borderRadius: "1px",
          backgroundColor: "var(--tx)",
          opacity: 0,
          filter: "blur(4px)",
          transformOrigin: "50% 50%",
          transform: "translate(-50%, -50%) scale(0.25)",
          transition:
            "transform 0.16s cubic-bezier(0.2, 0, 0, 1), opacity 0.16s cubic-bezier(0.2, 0, 0, 1), filter 0.16s cubic-bezier(0.2, 0, 0, 1)",
        }}
      />
    </div>
  );
}
