"use client";

import { useMemo, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  orbit,
  type OrbitDiscipline,
  type OrbitDisciplineId,
} from "@/lib/content";
import { useActProgress } from "@/lib/scroll/use-act-progress";

/** Flowing handoff after EncounterStrip unpin; not a third sticky. */
const BRIDGE =
  "One question for one concept. Now across your whole syllabus.";

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
      className="orbit-act w-full"
    >
      <div className="material-editorial content-wrap">
        <div className="material-copy">
          <p className="forest-bridge">{BRIDGE}</p>
          <SectionHeading
            sans={orbit.titleSans}
            serif={orbit.titleSerif}
            align="left"
          />
          <DisciplineCard active={active} />
        </div>
        <SubjectOrbit activeId={activeId} onSelect={setActiveId} />
      </div>
    </section>
  );
}

function DisciplineCard({ active }: { active: OrbitDiscipline }) {
  return (
    <figure
      id="material-dossier"
      role="tabpanel"
      aria-labelledby={`orbit-tab-${active.id}`}
      tabIndex={0}
      className="material-question focus:outline-none"
      aria-live="polite"
    >
      <figcaption className="paper-label">
        Learning Target · {active.label}
      </figcaption>
      <blockquote>{active.target}</blockquote>
      <p className="orbit-trap">
        <span className="orbit-card-kicker">The Trap:</span> {active.aiTrap}
      </p>
      <p className="orbit-ask">
        <span className="orbit-card-kicker">Unassisted ask:</span>{" "}
        {active.transferAsk}
      </p>
      <p className="orbit-card-cta-wrap">
        <a className="orbit-card-cta" href={orbit.cta.href}>
          {orbit.cta.label}
          <span aria-hidden="true"> →</span>
        </a>
      </p>
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
