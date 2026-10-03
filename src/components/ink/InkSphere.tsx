"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";
import { HERO_FORMS, heroInkScene } from "@/lib/ink/forms";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { inkArtwork } from "@/lib/content";
import { afterInkPosterPaint } from "@/lib/ink/poster";

const HOLD_SECONDS = 4.8;
const MORPH_SECONDS = 4.2;

export function InkSphere({ size = 560 }: { size?: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const interact = useRef<(reset?: boolean) => void>(() => {});
  const playback = useRef<(paused: boolean) => void>(() => {});
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [form, setForm] = useState(0);
  const [available, setAvailable] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = mount.current;
    if (!element || reduceMotion) return;
    let disposed = false;
    let cleanup = () => {};

    const start = () => import("@/lib/ink/renderer").then(({ mountInk }) => {
      if (disposed) return;
      let current = 0;
      let untilNextForm = HOLD_SECONDS;
      const renderer = mountInk(element, heroInkScene(0), (dt) => {
        if (pausedRef.current) {
          untilNextForm = Math.max(HOLD_SECONDS, untilNextForm - dt);
          return false;
        }
        untilNextForm -= dt;
        if (untilNextForm <= 0) {
          show((current + 1) % HERO_FORMS.length);
          untilNextForm = MORPH_SECONDS + HOLD_SECONDS;
        }
        return true;
      }, (ready) => {
        if (!disposed) setAvailable(ready);
      }, { morphDuration: MORPH_SECONDS });
      function show(next: number) {
        current = next;
        renderer.setScene(heroInkScene(next));
        setForm(next);
      }
      renderer.setPaused(pausedRef.current);
      playback.current = renderer.setPaused;
      interact.current = (reset = false) => {
        untilNextForm = MORPH_SECONDS + HOLD_SECONDS;
        // An explicit gesture can still reshape the ink while autoplay is paused.
        renderer.setPaused(false);
        renderer.triggerImpulse(0.12);
        show(reset ? 0 : (current + 1) % HERO_FORMS.length);
      };
      const updateTheme = () => renderer.setTheme(resolveTheme(getStoredTheme()));
      const theme = window.matchMedia("(prefers-color-scheme: dark)");
      updateTheme();
      window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
      window.addEventListener("storage", updateTheme);
      theme.addEventListener("change", updateTheme);
      setForm(0);

      cleanup = () => {
        interact.current = () => {};
        playback.current = () => {};
        window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
        window.removeEventListener("storage", updateTheme);
        theme.removeEventListener("change", updateTheme);
        renderer.destroy();
      };
    }).catch(() => {
      if (!disposed) setAvailable(false);
    });

    const cancelStartup = afterInkPosterPaint(element.previousElementSibling as HTMLElement, start);
    return () => {
      disposed = true;
      cancelStartup();
      cleanup();
      setAvailable(false);
    };
  }, [reduceMotion]);

  const interactive = available && !reduceMotion;
  return (
    <button
      type="button"
      className="sphere ink-sphere hero-living-ink"
      style={{ width: size, height: size, padding: 0, border: 0, borderRadius: 0, overflow: "visible", background: "transparent", color: "var(--tx-2)", cursor: interactive ? "pointer" : "default", touchAction: "pan-y" }}
      aria-label={interactive
        ? `${inkArtwork.hero.label}, ${HERO_FORMS[form]}. ${inkArtwork.hero.reshape} ${paused ? inkArtwork.hero.play : inkArtwork.hero.pause}`
        : inkArtwork.hero.still}
      aria-disabled={!interactive}
      aria-keyshortcuts={interactive ? "Space" : undefined}
      tabIndex={interactive ? 0 : -1}
      onClick={() => { if (interactive) interact.current(); }}
      onKeyDown={(event) => {
        if (!interactive) return;
        if (event.key === "Escape") interact.current(true);
        if (event.key === " ") {
          event.preventDefault();
          if (event.repeat) return;
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
          playback.current(pausedRef.current);
        }
      }}
    >
      <span className="ink-poster" aria-hidden="true"
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
