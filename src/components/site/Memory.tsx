import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { memory } from "@/lib/content";

/**
 * Macro-loop Memory: six-month trajectory of continuity (DEC-0005 themes in
 * customer language). Deliberately avoids method-demo echoes: no attempt
 * docket, single-question ledger, or ≠ principle-bar rerun.
 */
export function Memory() {
  return (
    <section data-sc-act="flow" id="memory" className="relative isolate scroll-mt-24 overflow-hidden pt-12 pb-12 sm:pt-12 sm:pb-16">
      <SectionHeading sans={memory.titleSans} serif={memory.titleSerif} />

      <div className="mx-auto mt-14 grid max-w-6xl gap-x-12 gap-y-12 px-5 sm:px-8 md:grid-cols-3 [&>*]:min-w-0">
        {memory.cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08} className="memory-column flex flex-col border-t border-tx/20 pt-6">
            <h3 className="text-[1.25rem] text-tx">{card.title}</h3>
            <p className="mt-1 font-serif text-[1.1rem] text-tx-2">{card.sub}</p>
            <div className="my-7 flex-1">
              {i === 0 ? <AccumulationArc /> : i === 1 ? <ModelIndependence /> : <AgencyKeys />}
            </div>
            <p className="text-base leading-relaxed text-tx-2">{card.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Illustration: how attempts could stack over time in the app (not this demo). */
function AccumulationArc() {
  const points = [
    { t: "Week 1", label: "First attempts", marks: 2 },
    { t: "Later", label: "Targets compound", marks: 5 },
    { t: "Over time", label: "A record you can read", marks: 9 },
  ];
  return (
    <ol className="relative flex flex-col gap-5 border-s border-tx/10 ps-5 text-[0.8125rem]">
      {points.map((p, idx) => (
        <li key={p.t} className="relative">
          <span
            aria-hidden
            className={`absolute -start-5 top-1.5 h-[7px] w-[7px] rounded-full ${
              idx === points.length - 1 ? "bg-accent" : "bg-tx-3"
            }`}
          />
          <p className="text-[0.75rem] uppercase tracking-[0.15em] text-tx-2">{p.t}</p>
          <p className={idx === points.length - 1 ? "text-tx" : "text-tx-2"}>{p.label}</p>
          <span className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
            {Array.from({ length: p.marks }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i < Math.ceil(p.marks * 0.55) ? "bg-accent/80" : "bg-tx/25"}`}
              />
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Open data formats and portability. */
function ModelIndependence() {
  const formats = ["Markdown", "Plain text", "JSON"];
  return (
    <div className="flex flex-col gap-4 text-[0.8125rem]">
      <p className="text-[0.75rem] uppercase tracking-[0.15em] text-tx-2">Open formats</p>
      <ul className="flex flex-wrap gap-2">
        {formats.map((name, i) => (
          <li
            key={name}
            className={`tile px-3 py-1.5 ${i === formats.length - 1 ? "border border-dashed border-tx/25 text-tx-2" : "text-tx"}`}
          >
            {name}
          </li>
        ))}
      </ul>
      <p className="border-t border-tx/10 pt-3 text-tx-2">
        Your notes and diagnostic evaluations stay stored in open formats so your study history is never locked into a closed platform.
      </p>
    </div>
  );
}

/** Learner agency: inspect, correct, export, delete. */
function AgencyKeys() {
  const actions = [
    { verb: "Inspect", note: "Review past explanations" },
    { verb: "Correct", note: "Update as your recall grows" },
    { verb: "Export", note: "Download study logs anytime" },
    { verb: "Delete", note: "Erase records in one click" },
  ];
  return (
    <ul className="divide-y divide-tx/10 text-sm">
      {actions.map((a) => (
        <li key={a.verb} className="flex items-baseline justify-between gap-3 py-3">
          <span className="text-tx">{a.verb}</span>
          <span className="text-end text-[0.75rem] text-tx-2">{a.note}</span>
        </li>
      ))}
    </ul>
  );
}
