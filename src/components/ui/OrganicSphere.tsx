"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
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

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * The Socratink ink sphere, as used in the app. WebGL; falls back to a plain
 * exact rendered poster if motion is reduced or the context can't be created.
 */
export function OrganicSphere({ size, level = 0, oversample = 1, className = "" }: OrganicSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controller = useRef<OrganicSphereController | null>(null);
  const reduce = useSyncExternalStore(subscribeMotion, () => window.matchMedia(reducedMotionQuery).matches, () => true);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || reduce) return;
    try {
      controller.current = mountOrganicSphere(el, { oversample });
    } catch {
      el.replaceChildren();
    }
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, [oversample, reduce]);

  useEffect(() => {
    controller.current?.setLevel(level);
  }, [level]);

  useEffect(() => {
    controller.current?.setStill(Boolean(reduce));
  }, [reduce]);

  return (
    <div
      aria-hidden
      className={`sphere ${className}`}
      style={{ width: size, height: size }}
    >
      <Image className="sphere-poster" src="/brand/ink-sphere-poster.png" alt="" width={480} height={480} unoptimized loading="eager" />
      <div ref={mountRef} className="sphere-render" />
    </div>
  );
}
