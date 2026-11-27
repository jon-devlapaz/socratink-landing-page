"use client";

import { useEffect } from "react";

export function CinematicScroller() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    let disposed = false;
    let cleanupFn = () => {};
    let started = false;

    const initScroller = () => {
      if (started || disposed) return;
      started = true;

      Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/CustomEase"),
        import("lenis/dist/lenis.css"),
      ]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }, { CustomEase }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger, CustomEase);

        const isCoarse = window.matchMedia("(pointer: coarse)").matches;
        let lenis: InstanceType<typeof Lenis> | null = null;
        let tickerCallback: ((time: number) => void) | null = null;

        if (!isCoarse) {
          lenis = new Lenis({
            lerp: 0.065,
            smoothWheel: true,
            wheelMultiplier: 0.8,
          });

          lenis.on("scroll", ScrollTrigger.update);

          tickerCallback = (time: number) => {
            lenis?.raf(time * 1000);
          };

          gsap.ticker.add(tickerCallback);
          gsap.ticker.lagSmoothing(0);
        }

        // The chapter canvases own their living motion. Only the closing
        // invitation uses this one-time scroll reveal.
        const inkEase = CustomEase.create("ink", "0.2, 0, 0, 1");

        gsap.utils.toArray<HTMLElement>("[data-colophon]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            duration: 0.5,
            ease: inkEase,
            scrollTrigger: { trigger: el, start: "top 75%", once: true },
          });
        });

        const revealFocus = (event: FocusEvent) => {
          if (!(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
          const rect = event.target.getBoundingClientRect();
          if (rect.top < 72 || rect.bottom > window.innerHeight) {
            event.target.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        };
        document.addEventListener("focusin", revealFocus);

        const refreshTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 250);

        cleanupFn = () => {
          clearTimeout(refreshTimer);
          document.removeEventListener("focusin", revealFocus);
          if (tickerCallback) gsap.ticker.remove(tickerCallback);
          lenis?.destroy();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      });
    };

    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const win = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(initScroller, { timeout: 1500 });
    } else {
      timerId = setTimeout(initScroller, 800);
    }

    const triggerNow = () => initScroller();
    window.addEventListener("scroll", triggerNow, { once: true, passive: true });
    window.addEventListener("pointerdown", triggerNow, { once: true, passive: true });

    return () => {
      disposed = true;
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timerId !== null) clearTimeout(timerId);
      window.removeEventListener("scroll", triggerNow);
      window.removeEventListener("pointerdown", triggerNow);
      cleanupFn();
    };
  }, []);

  return null;
}
