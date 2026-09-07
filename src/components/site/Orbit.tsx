"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  orbit,
  type OrbitDiscipline,
  type OrbitDisciplineId,
} from "@/lib/content";
import { useActProgress } from "@/lib/scroll/use-act-progress";

/** Flowing handoff after EncounterStrip unpin — not a third sticky. */
const BRIDGE =
  "One encounter for one target. Now your whole syllabus held to this standard.";

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
      className="orbit-act material-editorial content-wrap"
    >
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
    </section>
  );
}

function DisciplineCard({ active }: { active: OrbitDiscipline }) {
  return (
    <figure className="material-question" aria-live="polite">
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

function SubjectOrbit({
  activeId,
  onSelect,
}: {
  activeId: OrbitDisciplineId;
  onSelect: (id: OrbitDisciplineId) => void;
}) {
  const count = orbit.disciplines.length;

  return (
    <div className="orbit-phone">
      <div className="orbit-phone-track" aria-hidden="true" />
      <div className="orbit-phone-inner" aria-hidden="true" />
      <div className="orbit-phone-core" aria-hidden="true">
        <span className="orbit-phone-satellite" />
        <span className="orbit-phone-ink" />
      </div>
      <ul role="tablist" aria-label="Subjects for hard material">
        {orbit.disciplines.map((discipline, i) => {
          const angle = ((i * 360) / count - 90) * Math.PI / 180;
          const selected = discipline.id === activeId;
          return (
            <li
              key={discipline.id}
              className="orbit-phone-label-slot"
              style={{
                left: `calc(50% + (50% - 3rem) * ${Math.cos(angle).toFixed(5)})`,
                top: `calc(50% + (50% - 1.5rem) * ${Math.sin(angle).toFixed(5)})`,
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="material"
                className={`orbit-phone-label tile text-tx-2${selected ? " is-active" : ""}`}
                onClick={() => onSelect(discipline.id)}
              >
                {discipline.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
