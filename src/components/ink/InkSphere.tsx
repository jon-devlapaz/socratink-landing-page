"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import type { InkTool } from "@/lib/ink/tool";
import type { InkRenderer } from "@/lib/ink/renderer";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";
import { INK_EXPRESSIONS, type InkExpression } from "@/lib/ink/expressions";
import { HERO_FORMS, heroInkScene } from "@/lib/ink/forms";

const CYCLE_EXPRESSIONS: InkExpression[] = [
  "rest",
  "question",
  "lightbulb",
  "target",
  "key",
];

const DEFAULT_CYCLE_INTERVAL = 4200;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

type InkSphereProps = {
  size?: number;
  onTool?: (tool: InkTool | null) => void;
  autoCycle?: boolean;
  interaction?: "cycle" | "pulse";
  cycleInterval?: number;
};

function HeroInk({ size = 560 }: { size?: number }) {
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

export function InkSphere(props: InkSphereProps) {
  return props.interaction === "pulse" ? <HeroInk size={props.size} /> : <LabInkSphere {...props} />;
}

function LabInkSphere({
  size = 560,
  onTool,
  autoCycle = true,
  interaction = "cycle",
  cycleInterval = DEFAULT_CYCLE_INTERVAL,
}: {
  size?: number;
  onTool?: (tool: InkTool | null) => void;
  autoCycle?: boolean;
  interaction?: "cycle" | "pulse";
  cycleInterval?: number;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const toolRef = useRef<InkTool | null>(null);
  const rendererRef = useRef<InkRenderer | null>(null);
  const cycleIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);
  const isReducedRef = useRef(false);
  const [error, setError] = useState("");
  const [currentExpr, setCurrentExpr] = useState<InkExpression>("rest");
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  useEffect(() => {
    isReducedRef.current = reduceMotion;
  }, [reduceMotion]);

  const advance = useCallback(() => {
    const tool = toolRef.current;
    if (!tool || isReducedRef.current) return;
    const status = tool.call("ink_get_scene");
    if (status.ok && status.rendering.paused) return;
    cycleIndexRef.current =
      (cycleIndexRef.current + 1) % CYCLE_EXPRESSIONS.length;
    const nextExpr = CYCLE_EXPRESSIONS[cycleIndexRef.current];
    setCurrentExpr(nextExpr);
    tool.call("ink_express", { expression: nextExpr });
  }, []);

  const startCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (interaction === "pulse" || !autoCycle || isHoveredRef.current || isReducedRef.current) return;
    timerRef.current = setInterval(() => {
      advance();
    }, cycleInterval);
  }, [autoCycle, interaction, cycleInterval, advance]);

  const stopCycle = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const initRendererRef = useRef<() => void>(() => {});

  const handleManualAdvance = () => {
    if (!toolRef.current) {
      initRendererRef.current();
      return;
    }
    rendererRef.current?.triggerImpulse(1.0);
    if (interaction === "cycle") advance();
    startCycle();
  };

  useEffect(() => {
    if (reduceMotion) {
      initRendererRef.current = () => {};
      return;
    }
    const element = mount.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    let started = false;

    const initRenderer = () => {
      if (started || disposed) return;
      started = true;

      // The heavy ink runtime (renderer + tool subsystems including the
      // sculpt catalog) loads lazily so the landing hero stays lightweight.
      Promise.all([import("@/lib/ink/renderer"), import("@/lib/ink/tool")])
        .then(([{ mountInk }, { createInkTool, readInitialInk }]) => {
          if (disposed) return;
          // Pulse mode disables cycling but still allows the landing to preview
          // an explicitly saved scene from the ink lab.
          const initial = readInitialInk();
          const renderer = mountInk(element, initial, () => {
            if (element.dataset.inkReady !== "true")
              element.dataset.inkReady = "true";
          });
          rendererRef.current = renderer;
          const tool = createInkTool(renderer, initial);
          toolRef.current = tool;
          window.socratinkInk = tool;
          onTool?.(tool);

          const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
          const theme = window.matchMedia("(prefers-color-scheme: dark)");

          const updateTheme = () =>
            renderer.setTheme(resolveTheme(getStoredTheme()));

          const updateMotion = () => {
            const reduced = motion.matches;
            isReducedRef.current = reduced;
            renderer.setReduced(reduced);
            if (reduced) {
              stopCycle();
              setCurrentExpr("rest");
              tool.call("ink_express", { expression: "rest" });
            } else {
              startCycle();
            }
          };

          updateTheme();
          updateMotion();

          window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
          window.addEventListener("storage", updateTheme);
          theme.addEventListener("change", updateTheme);
          motion.addEventListener("change", updateMotion);

          let lastScrollY = window.scrollY;
          let lastScrollTime = performance.now();
          const handleScroll = () => {
            const now = performance.now();
            const dt = Math.max(0.008, (now - lastScrollTime) / 1000);
            lastScrollTime = now;
            const currentY = window.scrollY;
            const v = (currentY - lastScrollY) / dt;
            lastScrollY = currentY;
            renderer.setScrollVelocity(v);
          };
          window.addEventListener("scroll", handleScroll, { passive: true });

          const unsubscribeTool = tool.subscribe(() => {
            const status = tool.call("ink_get_scene");
            if (status.ok && status.rendering.paused) {
              stopCycle();
            } else if (!isHoveredRef.current && !isReducedRef.current) {
              startCycle();
            }
          });

          startCycle();

          cleanup = () => {
            window.removeEventListener("scroll", handleScroll);
            unsubscribeTool();
            stopCycle();
            renderer.destroy();
            rendererRef.current = null;
            if (window.socratinkInk === tool) delete window.socratinkInk;
            toolRef.current = null;
            onTool?.(null);
            window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
            window.removeEventListener("storage", updateTheme);
            theme.removeEventListener("change", updateTheme);
            motion.removeEventListener("change", updateMotion);
          };
        })
        .catch((cause) => {
          if (!disposed)
            setError(
              cause instanceof Error ? cause.message : "WebGL unavailable",
            );
        });
    };

    initRendererRef.current = initRenderer;
    initRenderer();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onTool, interaction, startCycle, stopCycle, reduceMotion]);

  return (
    <div
      className="sphere ink-sphere"
      style={{ width: size, height: size, cursor: "pointer" }}
      aria-label={interaction === "pulse"
        ? "Living ink droplet. Click or press Enter or Space to gently pulse."
        : `Living ink orb: ${INK_EXPRESSIONS[currentExpr]?.label ?? "At rest"} (${INK_EXPRESSIONS[currentExpr]?.symbol ?? "Ink droplet"}). Click to advance.`}
      role="button"
      tabIndex={0}
      onClick={handleManualAdvance}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleManualAdvance();
        }
      }}
      onMouseEnter={() => {
        isHoveredRef.current = true;
        stopCycle();
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        startCycle();
      }}
    >
      <span className="sr-only" aria-live="polite">
        {INK_EXPRESSIONS[currentExpr]?.meaning}
      </span>
      {reduceMotion ? (
        <img
          className="ink-poster"
          src="/brand/living-ink-poster.png"
          alt=""
          width={560}
          height={560}
        />
      ) : null}
      <div ref={mount} className="ink-render" />
      {error ? (
        <span className="sr-only">
          Static ink illustration. Interactive rendering unavailable.
        </span>
      ) : null}
    </div>
  );
}
