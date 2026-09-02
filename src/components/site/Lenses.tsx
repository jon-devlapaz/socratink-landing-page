"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Transcript } from "@/components/ui/Transcript";
import { lenses, lensesSection, type Lens } from "@/lib/content";

const AUTO_ADVANCE_MS = 7000;

/**
 * lazy.so's tabbed showcase (Articles / Twitter / YouTube): a large card with a
 * product mock on the left, copy plus a 2x2 tile grid on the right, and a row of
 * tabs beneath whose underline fills as a progress bar before auto-advancing.
 * The CSS fill animation is the clock: when it ends, the next tab is selected,
 * so pausing the bar on hover also pauses the advance.
 */
export function Lenses() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const lens = lenses[index];
  const advance = () => setIndex((i) => (i + 1) % lenses.length);

  return (
    <section id="moves" className="scroll-mt-24 py-28 sm:py-36">
      <SectionHeading
        eyebrow={lensesSection.eyebrow}
        sans={lensesSection.titleSans}
        serif={lensesSection.titleSerif}
      />

      <Reveal
        delay={0.15}
        y={30}
        className="mx-auto mt-14 max-w-6xl px-5 sm:px-8"
      >
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="card grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10 lg:p-9"
        >
          <div className="window relative min-h-[22rem] p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={lens.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              >
                <Transcript turns={lens.transcript} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div>
              <span className="text-accent">✦</span>
              <h3 className="mt-3 text-[1.25rem] leading-snug">
                <span className="text-tx">{lens.label}. </span>
                <span className="text-tx-2">{lens.tagline}</span>
              </h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-tx-2">{lens.description}</p>
            </div>
            <ul className="grid grid-cols-2 gap-2.5">
              {lens.tiles.map((tile) => (
                <li key={tile.label} className="tile flex flex-col gap-4 p-3.5 text-[0.8125rem] text-tx-2">
                  <span className="text-tx-3">{tile.icon}</span>
                  <span>{tile.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Tabs active={index} paused={paused} onSelect={setIndex} onComplete={advance} />
      </Reveal>
    </section>
  );
}

function Tabs({
  active,
  paused,
  onSelect,
  onComplete,
}: {
  active: number;
  paused: boolean;
  onSelect: (i: number) => void;
  onComplete: () => void;
}) {
  return (
    <div role="tablist" aria-label="Moves" className="mt-8 grid gap-6 sm:grid-cols-3">
      {lenses.map((lens: Lens, i) => {
        const isActive = i === active;
        return (
          <button
            key={lens.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onSelect(i)}
            className="group text-left"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[1rem] ${isActive ? "text-tx" : "text-tx-2 group-hover:text-tx"}`}>
                {lens.label}
              </span>
            </div>
            <div className="relative mt-2.5 h-px w-full bg-tx/10">
              {isActive ? (
                <div
                  key={lens.id}
                  data-paused={paused}
                  onAnimationEnd={onComplete}
                  className="tab-progress absolute inset-y-0 left-0 bg-tx"
                  style={{
                    ["--tab-duration" as string]: `${AUTO_ADVANCE_MS}ms`,
                    boxShadow: "0 0 12px rgba(206,205,195,0.6)",
                  }}
                />
              ) : null}
            </div>
            <p className={`mt-3 text-[0.8125rem] leading-relaxed ${isActive ? "text-tx" : "text-tx-2"}`}>
              {lens.tagline}
            </p>
          </button>
        );
      })}
    </div>
  );
}
