"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createInkTool, readInitialInk, type InkTool } from "@/lib/ink/tool";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";

export function InkSphere({
  size = 560,
  onTool,
}: {
  size?: number;
  onTool?: (tool: InkTool | null) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    import("@/lib/ink/renderer")
      .then(({ mountInk }) => {
        if (disposed) return;
        const initial = readInitialInk();
        const renderer = mountInk(element, initial, () => {
          if (element.dataset.inkReady !== "true")
            element.dataset.inkReady = "true";
        });
        const tool = createInkTool(renderer, initial);
        window.socratinkInk = tool;
        onTool?.(tool);
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const theme = window.matchMedia("(prefers-color-scheme: dark)");
        const updateTheme = () =>
          renderer.setTheme(resolveTheme(getStoredTheme()));
        const updateMotion = () => renderer.setReduced(motion.matches);
        updateTheme();
        updateMotion();
        window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
        window.addEventListener("storage", updateTheme);
        theme.addEventListener("change", updateTheme);
        motion.addEventListener("change", updateMotion);
        cleanup = () => {
          renderer.destroy();
          if (window.socratinkInk === tool) delete window.socratinkInk;
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
    return () => {
      disposed = true;
      cleanup();
    };
  }, [onTool]);
  return (
    <div
      className="sphere ink-sphere"
      style={{ width: size, height: size }}
      aria-label="Living ink"
      role="img"
    >
      <Image
        className="ink-poster"
        src="/brand/living-ink-poster.png"
        alt=""
        width={1120}
        height={1120}
        unoptimized
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
