"use client";

import Link from "next/link";
import { useState } from "react";
import { LiveDemo } from "@/components/site/LiveDemo";
import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { hero } from "@/lib/content";

const SPHERE_SIZE = 128;

export function Hero() {
  const [demoLevel, setDemoLevel] = useState(0);

  return (
    <section className="relative isolate overflow-x-clip pt-24 pb-12 sm:pt-32 sm:pb-16">
      <Eclipse />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <div>
              <p className="eyebrow">{hero.eyebrow}</p>
            </div>

            <div>
              <h1 className="flex flex-col text-[2.6rem] leading-[1.05] text-balance sm:text-[3.4rem] lg:text-[3.75rem]">
                <span className="h-sans">{hero.titleSans}</span>
                <span className="h-serif">{hero.titleSerif}</span>
              </h1>
            </div>
          </div>

          <div>
            <p className="max-w-lg text-[1.05rem] leading-[1.55] text-pretty text-tx-2">{hero.subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href={hero.primary.href} className="btn-accent min-h-11">
              {hero.primary.label}
            </Link>
            <Link href={hero.secondary.href} className="btn-ghost inline-flex min-h-11 items-center">
              {hero.secondary.label} →
            </Link>
          </div>
        </div>

        <div className="relative flex w-full max-w-2xl flex-col items-center gap-5 lg:max-w-none lg:flex-1">
          <div>
            <p className="max-w-sm text-center text-[0.8125rem] leading-relaxed text-pretty text-tx-2">
              <span className="text-tx">{hero.demoHint.strong}.</span> {hero.demoHint.rest}
            </p>
          </div>
          <div className="relative flex w-full flex-col items-center gap-5">
            <div className="pointer-events-none absolute inset-0">
              <LightStreak />
            </div>
            <OrganicSphere size={SPHERE_SIZE} level={demoLevel} />
            <div className="w-full">
              <LiveDemo onActivity={setDemoLevel} />
            </div>
          </div>
        </div>
      </div>
    </section>
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
