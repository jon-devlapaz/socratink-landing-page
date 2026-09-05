"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Transcript } from "@/components/ui/Transcript";
import { lenses, lensesSection, type Lens } from "@/lib/content";

export function Lenses() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const lens = lenses[index];

  return (
    <section id="moves" className="scroll-mt-24 py-12 sm:py-16">
      <SectionHeading
        eyebrow={lensesSection.eyebrow}
        sans={lensesSection.titleSans}
        serif={lensesSection.titleSerif}
        align="left"
        className="mx-auto max-w-6xl px-5 sm:px-8"
      />

      <Reveal delay={0.15} y={30} className="mx-auto mt-10 max-w-6xl px-5 sm:px-8">
        <div className="card grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10 lg:p-9">
          <div className="window relative min-h-[22rem] p-5 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={lens.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              >
                <Transcript turns={lens.transcript} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div>
              <span className="text-tx-2">✦</span>
              <h3 className="mt-3 text-[1.25rem] leading-snug">
                <span className="text-tx">{lens.label}. </span>
                <span className="text-tx-2">{lens.tagline}</span>
              </h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-tx-2">{lens.description}</p>
            </div>
            <ul className="grid grid-cols-2 gap-2.5">
              {lens.tiles.map((tile) => (
                <li key={tile.label} className="tile flex flex-col gap-4 p-3.5 text-[0.8125rem] text-tx-2">
                  <span className="text-tx-2">{tile.icon}</span>
                  <span>{tile.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Moves active={index} onSelect={setIndex} />
      </Reveal>
    </section>
  );
}

function Moves({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div className="mt-8 grid gap-2.5 sm:grid-cols-3 sm:gap-3" role="group" aria-label="Moves">
      {lenses.map((lens: Lens, i) => {
        const isActive = i === active;
        return (
          <button
            key={lens.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
            className={`tile min-h-11 w-full p-4 text-left transition-[border-color,background-color,scale] duration-[180ms] ease-[var(--ease-press)] active:scale-[0.96] ${
              isActive
                ? "border-tx/20 bg-ui/70"
                : "[@media(hover:hover)]:hover:border-tx/16"
            }`}
          >
            <span className="block text-[0.75rem] tabular-nums tracking-[0.14em] text-tx-2">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`mt-2 block text-[1rem] leading-snug ${isActive ? "text-tx" : "text-tx-2"}`}>
              {lens.label}
            </span>
            <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-tx-2">{lens.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}
