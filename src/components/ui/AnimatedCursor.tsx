"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

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

export function AnimatedCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  useEffect(() => {
    if (!isFinePointer) return;

    const hide = () => {
      if (containerRef.current) containerRef.current.style.opacity = "0";
      document.body.classList.remove("custom-cursor-active");
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        hide();
        return;
      }
      if (!containerRef.current) return;
      containerRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      containerRef.current.style.opacity = "1";
      document.body.classList.add("custom-cursor-active");
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-ink-cursor=""
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 999999,
        opacity: 0,
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "var(--mark-fill)",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
