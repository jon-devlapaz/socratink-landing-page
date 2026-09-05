import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Starfield } from "@/components/ui/Starfield";
import { memory } from "@/lib/content";

/** lazy.so's "Let serendipity blossom": two tall cards, then a wide one. */
export function Memory() {
  return (
    <section id="memory" className="relative isolate scroll-mt-24 overflow-hidden pt-12 pb-12 sm:pt-12 sm:pb-16">
      <Starfield count={40} seed={23} />
      <SectionHeading eyebrow={memory.eyebrow} sans={memory.titleSans} serif={memory.titleSerif} />

      <div className="mx-auto mt-14 grid max-w-6xl gap-4 px-5 sm:px-8 md:grid-cols-2 [&>*]:min-w-0">
        {memory.cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08} className="card flex flex-col p-6 sm:p-8">
            <h3 className="text-[1.25rem] text-tx">{card.title}</h3>
            <p className="mt-1 font-serif text-[1.1rem] text-tx-2">{card.sub}</p>
            <div className="my-7 flex-1">
              {i === 0 ? <EvidenceLedger /> : <ReturnTimeline />}
            </div>
            <p className="text-[0.8125rem] leading-relaxed text-tx-2">{card.body}</p>
          </Reveal>
        ))}

        <Reveal delay={0.16} className="card p-6 sm:p-8 md:col-span-2">
          <div className="text-center">
            <h3 className="text-[1.25rem] text-tx">{memory.boundary.title}</h3>
            <p className="mt-1 font-serif text-[1.1rem] text-tx-2">{memory.boundary.sub}</p>
          </div>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-2 sm:grid-cols-2">
            {memory.boundary.rules.map(([left, right]) => (
              <li
                key={left}
                className="tile flex items-center justify-center gap-3 px-4 py-3 font-mono text-[0.75rem] text-tx-2 sm:text-[0.8rem]"
              >
                <span>{left}</span>
                <span className="text-accent">≠</span>
                <span className="text-tx">{right}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function EvidenceLedger() {
  const rows = [
    { what: "Stated the central limit theorem", how: "unassisted", ok: true },
    { what: "Defined a p-value conditionally", how: "after 1 reveal", ok: true },
    { what: "Chose the right test for paired data", how: "revealed", ok: false },
  ];
  return (
    <ul className="tile divide-y divide-tx/6 text-[0.8125rem]">
      {rows.map((r) => (
        <li key={r.what} className="flex items-start gap-3 px-3.5 py-2.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.ok ? "bg-accent" : "bg-tx-3"}`}
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-pretty text-tx-2">{r.what}</span>
          <span className="shrink-0 pt-0.5 text-[0.75rem] text-tx-2">{r.how}</span>
        </li>
      ))}
    </ul>
  );
}

function ReturnTimeline() {
  const points = [
    { t: "Today", label: "You reconstructed it", state: "done" },
    { t: "+9 days", label: "Asked again, no notes", state: "next" },
    { t: "+5 weeks", label: "A new problem, same idea", state: "later" },
  ];
  return (
    <ol className="relative flex flex-col gap-5 pl-5 text-[0.8125rem]">
      <span aria-hidden className="absolute left-[3px] top-1 bottom-1 w-px bg-tx/10" />
      {points.map((p) => (
        <li key={p.t} className="relative">
          <span
            aria-hidden
            className={`absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full ${
              p.state === "done" ? "bg-accent" : p.state === "next" ? "bg-tx" : "bg-tx-3"
            }`}
          />
          <p className="text-[0.75rem] uppercase tracking-[0.15em] text-tx-2">{p.t}</p>
          <p className={p.state === "later" ? "text-tx-2" : "text-tx"}>{p.label}</p>
        </li>
      ))}
    </ol>
  );
}
