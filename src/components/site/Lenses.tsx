"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Transcript } from "@/components/ui/Transcript";
import { lenses, lensesSection, type Lens } from "@/lib/content";

export function Lenses() {
  const [index, setIndex] = useState(0);
  const lens = lenses[index];

  return (
    <div id="moves" className="scroll-mt-24 mt-8 sm:mt-10">
      <Reveal delay={0.15} y={30} className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-4 text-sm text-tx-2">{lensesSection.hint}</p>
        <Moves active={index} onSelect={setIndex} />
        <div className="move-workspace grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div id="move-example" className="window relative p-5 sm:p-6" aria-live="polite">
            <p className="paper-label mb-4">Scripted example · {lens.short}</p>
            <Transcript turns={lens.transcript} />
          </div>

          <div className="flex flex-col justify-between gap-8">
            <div>
              <h3 className="mt-3 text-[1.25rem] leading-snug">
                <span className="text-tx">{lens.label}. </span>
                <span className="text-tx-2">{lens.tagline}</span>
              </h3>
              <p className="mt-3 text-base leading-relaxed text-tx-2">{lens.description}</p>
            </div>
            <ul className="grid gap-3 border-t border-tx/10 pt-6">
              {lens.tiles.map((tile) => (
                <li key={tile.label} className="flex items-center gap-3 text-sm text-tx-2">
                  <span className="text-tx-2">{tile.icon}</span>
                  <span>{tile.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Moves({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-3" role="group" aria-label="Moves">
      {lenses.map((lens: Lens, i) => {
        const isActive = i === active;
        return (
          <button
            key={lens.id}
            type="button"
            aria-pressed={isActive}
            aria-controls="move-example"
            aria-label={`${lens.label} ${lens.tagline}`}
            onClick={() => onSelect(i)}
            className={`min-h-11 w-full rounded-sm border-b p-3 text-center transition-[border-color,background-color,scale] duration-150 ease-[var(--ease-press)] active:scale-[0.96] ${
              isActive
                ? "border-accent bg-ui/70"
                : "border-tx/20 [@media(hover:hover)]:hover:bg-ui/40"
            }`}
          >
            <span className={`block text-sm leading-snug ${isActive ? "text-tx" : "text-tx-2"}`}>
              {lens.short}
            </span>
          </button>
        );
      })}
    </div>
  );
}
