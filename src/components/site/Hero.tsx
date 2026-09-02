"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { INTRO, IntroOverlay, useIntro } from "@/components/site/Intro";
import { LiveDemo } from "@/components/site/LiveDemo";
import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { hero } from "@/lib/content";

const SPHERE_SIZE = 128;

export function Hero() {
  const { phase, skipped } = useIntro();
  const [demoLevel, setDemoLevel] = useState(0);

  // Reveals start when the sphere begins to settle; skipped intro means straight away.
  const ready = phase !== "drop";
  const base = skipped ? 0 : (INTRO.revealAt - INTRO.settleAt) / 1000;

  const sphereLevel = phase === "drop" ? 0.65 : phase === "settle" ? 0.2 : demoLevel;

  return (
    <section className="relative isolate overflow-x-clip pt-32 pb-28 sm:pt-40 sm:pb-36">
      <Eclipse />
      <IntroOverlay />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        <Rise ready={ready} delay={base}>
          <p className="flex items-center gap-3 text-[0.75rem] text-tx-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-tx-3" />
            <span className="text-tx">{hero.eyebrowA}</span>
            <span className="h-3 w-px bg-tx-3" />
            <span>{hero.eyebrowB}</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-tx-3" />
          </p>
        </Rise>

        <Rise ready={ready} delay={base + 0.08}>
          <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-[3.6rem] lg:text-[4.25rem]">
            <span className="h-sans">{hero.titleSans} </span>
            <span className="h-serif">{hero.titleSerif}</span>
          </h1>
        </Rise>

        <Rise ready={ready} delay={base + 0.16}>
          <p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-tx-2">
            {hero.subtitle}
          </p>
        </Rise>

        <Rise ready={ready} delay={base + 0.24} className="mt-8 flex items-center gap-4">
          <Link href={hero.primary.href} className="btn-accent">
            {hero.primary.label}
          </Link>
          <Link href={hero.secondary.href} className="btn-ghost">
            {hero.secondary.label} →
          </Link>
        </Rise>
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-2xl px-5">
        <Rise ready={ready} delay={base + 0.34} y={28}>
          <LightStreak />
        </Rise>
        <div className="relative flex flex-col items-center">
          <HeroSphere level={sphereLevel} />
          <Rise ready={ready} delay={base + 0.34} y={28} className="mt-8 w-full">
            <LiveDemo onActivity={setDemoLevel} />
          </Rise>
        </div>
      </div>

      <Rise ready={ready} delay={base + 0.5}>
        <p className="mx-auto mt-12 max-w-sm px-5 text-center text-[0.8125rem] leading-relaxed text-tx-2">
          <span className="text-tx">{hero.demoHint.strong}.</span> {hero.demoHint.rest}
        </p>
      </Rise>
    </section>
  );
}

/** Fade-and-rise gated on the intro instead of viewport visibility. */
function Rise({
  ready,
  delay,
  y = 18,
  className,
  children,
}: {
  ready: boolean;
  delay: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, ease: INTRO.ease, delay: ready ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The sphere lives in an in-flow slot. During the intro it is translated to the
 * viewport centre and enlarged; on "settle" it animates back to the slot.
 */
function HeroSphere({ level }: { level: number }) {
  const { phase, skipped } = useIntro();
  const slotRef = useRef<HTMLDivElement>(null);
  const [drop, setDrop] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const rect = slot.getBoundingClientRect();
    setDrop({
      x: window.innerWidth / 2 - (rect.left + rect.width / 2),
      y: window.innerHeight * INTRO.dropCentreY - (rect.top + rect.height / 2),
    });
  }, []);

  const dropped = phase === "drop";
  const canRender = skipped || drop !== null;

  return (
    <div
      ref={slotRef}
      className="relative"
      style={{ width: SPHERE_SIZE, height: SPHERE_SIZE, zIndex: phase === "done" ? undefined : 45 }}
    >
      {canRender ? (
        <motion.div
          className="absolute inset-0"
          initial={
            skipped
              ? false
              : { x: drop!.x, y: drop!.y, scale: INTRO.dropScale * 0.72, opacity: 0 }
          }
          animate={
            dropped
              ? { x: drop!.x, y: drop!.y, scale: INTRO.dropScale, opacity: 1 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={
            dropped
              ? { duration: 1.1, ease: INTRO.ease }
              : { duration: 1.0, ease: INTRO.ease }
          }
        >
          <OrganicSphere size={SPHERE_SIZE} level={level} oversample={INTRO.dropScale} />
        </motion.div>
      ) : null}
    </div>
  );
}

/** lazy.so's giant dark disc with a lit rim, behind the hero. */
function Eclipse() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-[12%] h-[160vw] w-[160vw] max-h-[1400px] max-w-[1400px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #100f0f 0%, #100f0f 62%, #141312 78%, #100f0f 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(206,205,195,0.10), inset 0 0 120px -40px rgba(206,205,195,0.18), 0 0 180px -60px rgba(206,205,195,0.22)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(58,169,159,0.10), transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-paper" />
    </div>
  );
}

/** Horizontal lens-flare behind the composer. */
function LightStreak() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[62%] -z-10 h-px">
      <div
        className="mx-auto h-px w-[140%] -translate-x-[14%]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(206,205,195,0.55) 20%, rgba(206,205,195,0.1) 40%, rgba(206,205,195,0.1) 60%, rgba(206,205,195,0.55) 80%, transparent 100%)",
          boxShadow: "0 0 40px 2px rgba(206,205,195,0.25)",
        }}
      />
    </div>
  );
}
