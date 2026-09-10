"use client";

import { useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  orbit,
  type OrbitDiscipline,
  type OrbitDisciplineId,
} from "@/lib/content";
import { useActProgress } from "@/lib/scroll/use-act-progress";

const BRIDGE = orbit.eyebrow;

/** The subject field stays legible; orbit labels switch the editorial card in place. */
export function Orbit() {
  const { ref } = useActProgress(["start end", "end start"]);
  const [activeId, setActiveId] = useState<OrbitDisciplineId>(orbit.defaultId);
  const active = useMemo(
    () =>
      orbit.disciplines.find((d) => d.id === activeId) ?? orbit.disciplines[0],
    [activeId],
  );

  return (
    <section
      id="material"
      data-sc-act="flow"
      ref={ref}
      className="orbit-act w-full h-full flex flex-col justify-center py-8 sm:py-12"
    >
      <div className="content-wrap w-full">
        <div className="max-w-3xl mb-6 sm:mb-10">
          <p className="forest-bridge text-sm uppercase tracking-wider text-accent font-medium mb-3">
            {BRIDGE}
          </p>
          <SectionHeading
            sans={orbit.titleSans}
            serif={orbit.titleSerif}
            align="left"
          />
          <p className="mt-3.5 text-sm sm:text-base text-tx-2 leading-relaxed max-w-2xl">
            {orbit.bridge}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Dossier Card Specimen */}
          <div className="lg:col-span-7">
            <DossierCard active={active} />
          </div>

          {/* Right: Concentric Orbit Dial */}
          <div className="lg:col-span-5 flex justify-center">
            <SubjectOrbit activeId={activeId} onSelect={setActiveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DossierCard({ active }: { active: OrbitDiscipline }) {
  return (
    <figure
      id="material-dossier"
      role="tabpanel"
      aria-labelledby={`orbit-tab-${active.id}`}
      tabIndex={0}
      aria-live="polite"
      className="rounded-2xl border border-tx/15 bg-paper-2/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden focus:outline-none"
      style={{
        boxShadow:
          "0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05) inset",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tx/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <figcaption className="text-xs font-semibold uppercase tracking-wider text-tx-2">
            Curriculum Specimen · {active.label}
          </figcaption>
        </div>
        <span className="text-xs font-mono text-tx-3">DIAGNOSTIC PROBE</span>
      </div>

      <h3 className="font-serif text-xl sm:text-2xl text-tx font-medium leading-snug mb-6">
        {active.target}
      </h3>

      <div className="space-y-4 mb-8">
        {/* AI Trap */}
        <div className="rounded-xl border border-error/20 bg-error/5 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.7rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-error/15 text-error">
              The AI Trap
            </span>
            <span className="text-xs text-tx-3">
              Where unassisted mastery diverges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-tx-2 leading-relaxed italic">
            {active.aiTrap}
          </p>
        </div>

        {/* Unassisted Ask */}
        <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.7rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
              Unassisted Ask
            </span>
            <span className="text-xs text-tx-3">
              Proved under test conditions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-tx leading-relaxed">
            {active.transferAsk}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-tx/10">
        <span className="text-xs text-tx-3 font-mono">
          One question for one concept
        </span>
        <a
          href={orbit.cta.href}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-ink font-medium text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-98 transition-all"
        >
          {orbit.cta.label}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </figure>
  );
}

const INNER_DISCIPLINE_IDS = new Set(["stats", "boards", "law", "analysis"]);

function SubjectOrbit({
  activeId,
  onSelect,
}: {
  activeId: OrbitDisciplineId;
  onSelect: (id: OrbitDisciplineId) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const count = orbit.disciplines.length;

  const innerDisciplines = useMemo(
    () => orbit.disciplines.filter((d) => INNER_DISCIPLINE_IDS.has(d.id)),
    []
  );
  const outerDisciplines = useMemo(
    () => orbit.disciplines.filter((d) => !INNER_DISCIPLINE_IDS.has(d.id)),
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent, id: OrbitDisciplineId) => {
    const currentIndex = orbit.disciplines.findIndex((d) => d.id === id);
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % count;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + count) % count;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = count - 1;
    } else {
      return;
    }
    const nextDiscipline = orbit.disciplines[nextIndex];
    onSelect(nextDiscipline.id);
    const targetButton = containerRef.current?.querySelector<HTMLButtonElement>(
      `#orbit-tab-${nextDiscipline.id}`
    );
    targetButton?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="orbit-phone orbit-container relative flex items-center justify-center scale-85 sm:scale-100 transition-transform"
      aria-label="Discipline selector orbit"
    >
      {/* Subtle Orbital Path Guides */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        <circle
          cx="200"
          cy="200"
          r="72"
          className="stroke-tx/12 dark:stroke-tx/15"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="162"
          className="stroke-tx/12 dark:stroke-tx/15"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
      </svg>

      {/* Center Ink Hub */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-paper-2 border border-tx/15 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.18)]"
        aria-hidden="true"
      >
        <span className="h-5 w-5 rounded-full bg-tx shadow-inner" />
      </div>

      {/* Concentric Orbiting Discipline Tabs */}
      <div role="tablist" aria-label="Subjects for hard material" className="contents">
        {/* Inner Ring (4 subjects, counter-clockwise) */}
        {innerDisciplines.map((discipline, i) => {
          const angle = (i * 360) / innerDisciplines.length;
          const selected = discipline.id === activeId;
          return (
            <button
              key={discipline.id}
              type="button"
              role="tab"
              id={`orbit-tab-${discipline.id}`}
              aria-selected={selected}
              aria-controls="material-dossier"
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(discipline.id)}
              onKeyDown={(e) => handleKeyDown(e, discipline.id)}
              style={
                {
                  "--radius": 72,
                  "--duration": "42s",
                  "--angle": angle,
                } as React.CSSProperties
              }
              className={`orbit-node-pill orbit-phone-label is-reverse tile text-tx-2${
                selected ? " is-active" : ""
              }`}
            >
              {discipline.label}
            </button>
          );
        })}

        {/* Outer Ring (6 subjects, clockwise) */}
        {outerDisciplines.map((discipline, i) => {
          const angle = (i * 360) / outerDisciplines.length + 15;
          const selected = discipline.id === activeId;
          return (
            <button
              key={discipline.id}
              type="button"
              role="tab"
              id={`orbit-tab-${discipline.id}`}
              aria-selected={selected}
              aria-controls="material-dossier"
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(discipline.id)}
              onKeyDown={(e) => handleKeyDown(e, discipline.id)}
              style={
                {
                  "--radius": 162,
                  "--duration": "62s",
                  "--angle": angle,
                } as React.CSSProperties
              }
              className={`orbit-node-pill orbit-phone-label tile text-tx-2${
                selected ? " is-active" : ""
              }`}
            >
              {discipline.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
