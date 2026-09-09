"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type EncounterStage = "hero" | "cold" | "ghost" | "ink" | "bound" | "exit";

export type MorphState = {
  active: boolean;
  stage: EncounterStage;
  tendril: number;
  level: number;
};

export const STAGE_TARGETS: Record<EncounterStage, { tendril: number; level: number }> = {
  hero: { tendril: 0, level: 0 },
  cold: { tendril: 0, level: 0 },
  ghost: { tendril: 0.25, level: 0.15 },
  ink: { tendril: 0.50, level: 0.35 },
  bound: { tendril: 1.00, level: 0.85 },
  exit: { tendril: 0, level: 0 },
};

function checkMorphParam(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const val = params.get("morph");
  return val === "1" || val === "true" || (window as unknown as { __MORPH_SPIKE__?: boolean }).__MORPH_SPIKE__ === true;
}

function subscribeNoop() {
  return () => {};
}

export function useMorphFlag(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    checkMorphParam,
    () => false,
  );
}

export function useMorphSpike(): MorphState {
  const active = useMorphFlag();
  const [stage, setStage] = useState<EncounterStage>("hero");

  useEffect(() => {
    if (!active) return;

    // Listen to custom encounter-beat event dispatched by EncounterStrip
    const onEncounterBeat = (event: Event) => {
      const custom = event as CustomEvent<{ beat: string }>;
      const beat = custom.detail?.beat;
      if (beat && beat in STAGE_TARGETS) {
        setStage(beat as EncounterStage);
      }
    };
    window.addEventListener("encounter-beat", onEncounterBeat);

    // Fallback/direct IntersectionObserver across encounter phases
    const phaseElements = document.querySelectorAll<HTMLElement>("[data-encounter-phase]");
    let observer: IntersectionObserver | null = null;
    if (phaseElements.length > 0) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const phase = entry.target.getAttribute("data-encounter-phase");
              if (phase && phase in STAGE_TARGETS) {
                setStage(phase as EncounterStage);
              }
            }
          }
        },
        { threshold: 0.3 },
      );
      phaseElements.forEach((el) => observer?.observe(el));
    }

    // Check if scrolled back up to top (hero)
    const onScroll = () => {
      if (window.scrollY < 180) {
        setStage("hero");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("encounter-beat", onEncounterBeat);
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [active]);

  const targets = STAGE_TARGETS[stage] ?? STAGE_TARGETS.hero;

  return {
    active,
    stage,
    tendril: active ? targets.tendril : 0,
    level: active ? targets.level : 0,
  };
}
