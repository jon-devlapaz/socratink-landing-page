"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (containerRef.current) containerRef.current.style.display = "none";
      return;
    }

    const bar = barRef.current;
    const container = containerRef.current;
    if (!bar || !container) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        if (container) container.style.display = "none";
      },
    });

    tl.fromTo(bar, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.65 })
      .to(container, { opacity: 0, duration: 0.35, ease: "power2.inOut" }, "+=0.08");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-preloader
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-[2px] pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        data-preloader-bar
        className="h-full w-full bg-accent scale-x-0 origin-left shadow-[0_0_8px_var(--color-accent)]"
      />
    </div>
  );
}

