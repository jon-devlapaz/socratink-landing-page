"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";
import {
  mountOrganicSphere,
  type OrganicSphereController,
  type SphereGround,
  type SphereShape,
} from "@/lib/sphere/organic-sphere";

type OrganicSphereProps = {
  /** Diameter in px. The canvas is square. */
  size: number;
  /** 0 = resting, 1 = agitated. */
  level?: number;
  /** Shape to morph into: "sphere" | "checkbox" | "ring" | "pill" | "star" */
  shape?: SphereShape | number;
  /** 0 = pure sphere, 1 = fully morphed into target shape */
  morph?: number;
  /** Automatically cycle through shapes organically as an ambient loop. Defaults to true if shape is omitted. */
  autoCycle?: boolean;
  /** Render at extra resolution if the element will be scaled up by a transform. */
  oversample?: number;
  className?: string;
  onClick?: () => void;
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function subscribeTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "socratink-theme") callback();
  };
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    media.removeEventListener("change", callback);
  };
}

function readTheme(): Theme {
  return resolveTheme(getStoredTheme());
}

function sphereGround(theme: Theme): SphereGround {
  return theme === "dark" ? "ink" : "paper";
}

/**
 * The Socratink ink sphere, as used in the app. WebGL; falls back to a plain
 * exact rendered poster if motion is reduced or the context can't be created.
 */
export function OrganicSphere({
  size,
  level = 0,
  shape,
  morph = 1,
  autoCycle,
  oversample = 1,
  className = "",
  onClick,
}: OrganicSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controller = useRef<OrganicSphereController | null>(null);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(reducedMotionQuery).matches, () => true);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);
  const ground = sphereGround(theme);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || reduce) return;
    try {
      controller.current = mountOrganicSphere(el, {
        oversample,
        ground,
        autoCycle: autoCycle ?? (shape === undefined),
        initialShape: shape,
      });
    } catch {
      el.replaceChildren();
    }
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, [ground, oversample, reduce, autoCycle, shape]);

  useEffect(() => {
    controller.current?.setLevel(level);
  }, [level]);

  useEffect(() => {
    if (shape !== undefined) {
      controller.current?.setShape(shape, morph);
    }
  }, [shape, morph]);

  useEffect(() => {
    controller.current?.setStill(Boolean(reduce));
  }, [reduce]);

  const handleClick = () => {
    controller.current?.nextShape();
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Interactive ink orb. Press Enter or click to transform."
      className={`sphere ${className}`}
      style={{
        width: size,
        height: size,
        cursor: "pointer",
        contain: "paint layout",
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Image
        className="sphere-poster"
        src="/brand/ink-sphere-poster.png"
        alt=""
        width={480}
        height={480}
        unoptimized
        priority
        loading="eager"
      />
      <div ref={mountRef} className="sphere-render" />
    </div>
  );
}
