"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { mountOrganicSphere, type OrganicSphereController } from "@/lib/sphere/organic-sphere";

type OrganicSphereProps = {
  /** Diameter in px. The canvas is square. */
  size: number;
  /** 0 = resting, 1 = agitated. */
  level?: number;
  /** Render at extra resolution if the element will be scaled up by a transform. */
  oversample?: number;
  className?: string;
};

/**
 * The Socratink ink sphere, as used in the app. WebGL; falls back to a plain
 * ink disc if the context can't be created.
 */
export function OrganicSphere({ size, level = 0, oversample = 1, className = "" }: OrganicSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controller = useRef<OrganicSphereController | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    try {
      controller.current = mountOrganicSphere(el, { oversample });
    } catch {
      el.replaceChildren();
      el.classList.add("sphere-fallback");
    }
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, [oversample]);

  useEffect(() => {
    controller.current?.setLevel(level);
  }, [level]);

  useEffect(() => {
    controller.current?.setStill(Boolean(reduce));
  }, [reduce]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={`sphere ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
