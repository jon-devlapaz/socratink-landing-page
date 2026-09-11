"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import type { InkTool } from "@/lib/ink/tool";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";
import { INK_EXPRESSIONS, type InkExpression } from "@/lib/ink/expressions";

const CYCLE_EXPRESSIONS: InkExpression[] = [
  "rest",
  "question",
  "lightbulb",
  "target",
  "key",
];

const DEFAULT_CYCLE_INTERVAL = 4200;

export function InkSphere({
  size = 560,
  onTool,
  autoCycle = true,
  cycleInterval = DEFAULT_CYCLE_INTERVAL,
}: {
  size?: number;
  onTool?: (tool: InkTool | null) => void;
  autoCycle?: boolean;
  cycleInterval?: number;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const toolRef = useRef<InkTool | null>(null);
  const cycleIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);
  const isReducedRef = useRef(false);
  const [error, setError] = useState("");
  const [currentExpr, setCurrentExpr] = useState<InkExpression>("rest");

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
    if (!autoCycle || isHoveredRef.current || isReducedRef.current) return;
    timerRef.current = setInterval(() => {
      advance();
    }, cycleInterval);
  }, [autoCycle, cycleInterval, advance]);

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
    advance();
    startCycle();
  };

  useEffect(() => {
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
          const initial = readInitialInk();
          const renderer = mountInk(element, initial, () => {
            if (element.dataset.inkReady !== "true")
              element.dataset.inkReady = "true";
          });
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
            unsubscribeTool();
            stopCycle();
            renderer.destroy();
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

    // Defer heavy WebGL initialization until idle or user interaction
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (typeof window !== "undefined") {
      const win = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(initRenderer, { timeout: 1800 });
      } else {
        timerId = setTimeout(initRenderer, 1000);
      }
    }

    const triggerImmediate = () => initRenderer();
    element.addEventListener("pointerenter", triggerImmediate, { once: true, passive: true });
    element.addEventListener("pointerdown", triggerImmediate, { once: true, passive: true });
    window.addEventListener("scroll", triggerImmediate, { once: true, passive: true });

    return () => {
      disposed = true;
      const win = window as unknown as {
        cancelIdleCallback?: (id: number) => void;
      };
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
      if (timerId !== null) clearTimeout(timerId);
      element.removeEventListener("pointerenter", triggerImmediate);
      element.removeEventListener("pointerdown", triggerImmediate);
      window.removeEventListener("scroll", triggerImmediate);
      cleanup();
    };
  }, [onTool, startCycle, stopCycle]);

  return (
    <div
      className="sphere ink-sphere"
      style={{ width: size, height: size, cursor: "pointer" }}
      aria-label={`Living ink orb: ${INK_EXPRESSIONS[currentExpr]?.label ?? "At rest"} (${INK_EXPRESSIONS[currentExpr]?.symbol ?? "Ink droplet"}). Click to advance.`}
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
      <Image
        className="ink-poster"
        src="/brand/living-ink-poster.png"
        alt="Living ink droplet"
        width={560}
        height={560}
        sizes="(max-width: 768px) 280px, 560px"
        priority
        fetchPriority="high"
      />
      <div ref={mount} className="ink-render" />
      {error ? (
        <span className="sr-only">
          Static ink illustration. Interactive rendering unavailable.
        </span>
      ) : null}
    </div>
  );
}
