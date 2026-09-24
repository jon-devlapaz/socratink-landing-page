"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";
import { HERO_FORMS, heroInkScene } from "@/lib/ink/forms";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function InkSphere({ size = 560 }: { size?: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const interact = useRef<(reset?: boolean) => void>(() => {});
  const [form, setForm] = useState(0);
  const [available, setAvailable] = useState(false);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  useEffect(() => {
    const element = mount.current;
    if (!element || reduceMotion) return;
    let disposed = false;
    let cleanup = () => {};

    import("@/lib/ink/renderer").then(({ mountInk }) => {
      if (disposed) return;
      let onIdleFrame: (dt: number) => void = () => {};
      const renderer = mountInk(element, heroInkScene(0), (dt) => onIdleFrame(dt), setAvailable);
      let current = 0;
      let untilNextForm = 6;
      const show = (next: number) => {
        current = next;
        renderer.setScene(heroInkScene(next));
        setForm(next);
      };
      interact.current = (reset = false) => {
        untilNextForm = 12;
        renderer.triggerImpulse(0.35);
        show(reset ? 0 : (current + 1) % HERO_FORMS.length);
      };
      const updateTheme = () => renderer.setTheme(resolveTheme(getStoredTheme()));
      const theme = window.matchMedia("(prefers-color-scheme: dark)");
      updateTheme();
      window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
      window.addEventListener("storage", updateTheme);
      theme.addEventListener("change", updateTheme);
      setForm(0);

      // Count visible animation time, so returning to the page never skips
      // ahead. Give each gesture a quiet hold before the next one unfolds.
      onIdleFrame = (dt) => {
        if (element.parentElement?.matches(":hover, :focus-within")) return;
        untilNextForm -= dt;
        if (untilNextForm > 0) return;
        show((current + 1) % HERO_FORMS.length);
        untilNextForm = current === 0 ? 10 : 8;
      };
      cleanup = () => {
        interact.current = () => {};
        window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
        window.removeEventListener("storage", updateTheme);
        theme.removeEventListener("change", updateTheme);
        renderer.destroy();
      };
    }).catch(() => {
      if (!disposed) setAvailable(false);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduceMotion]);

  const interactive = available && !reduceMotion;
  return (
    <button
      type="button"
      className="sphere ink-sphere hero-living-ink"
      style={{ width: size, height: size, padding: 0, border: 0, borderRadius: 0, overflow: "visible", background: "transparent", color: "var(--tx-2)", cursor: interactive ? "pointer" : "default", touchAction: "pan-y" }}
      aria-label={interactive
        ? `Living ink, ${HERO_FORMS[form]}. Click or press Enter to reshape. Escape returns to the sphere.`
        : "Ink sphere"}
      aria-disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      onClick={() => { if (interactive) interact.current(); }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && interactive) interact.current(true);
      }}
    >
      <img className="ink-poster" src="/brand/living-ink-poster.png" alt="" width={560} height={560}
        style={{ opacity: interactive ? 0 : 1, pointerEvents: "none" }} />
      <div ref={mount} className="ink-render" style={{ visibility: reduceMotion ? "hidden" : "visible" }} />
      <span className="hero-ink-focus" aria-hidden="true" />
      <style>{`
        .hero-living-ink:focus-visible { outline: none; }
        .hero-living-ink:focus-visible .hero-ink-focus {
          position: absolute;
          inset: 18%;
          border: 2px solid var(--accent);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
    </button>
  );
}
