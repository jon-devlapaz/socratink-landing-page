import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { evidence } from "@/lib/content";

/** lazy.so's "Universal Inbox" bento, retargeted at Socratink's evidence model. */
export function Evidence() {
  const { steps, bounded, voice, keyboard, model } = evidence.cards;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={evidence.eyebrow}
          sans={evidence.titleSans}
          serif={evidence.titleSerif}
          align="left"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
          <Reveal className="card flex flex-col p-6 sm:p-7">
            <CardHead title={steps.title} sub={steps.sub} />
            <ol className="mt-6 flex flex-col gap-2">
              {steps.items.map((item, i) => (
                <li
                  key={item}
                  className={`tile flex items-start gap-3 px-3.5 py-2.5 text-[0.8125rem] ${
                    i === steps.items.length - 1 ? "text-tx" : "text-tx-2"
                  }`}
                >
                  <span className="w-4 shrink-0 text-right text-[0.75rem] text-tx-2">{i + 1}</span>
                  <span className="min-w-0 text-pretty">{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-tx-2">{steps.body}</p>
          </Reveal>

          <Reveal delay={0.08} className="card flex flex-col p-6 sm:p-7">
            <CardHead title={bounded.title} sub={bounded.sub} />
            <ul className="mt-6 flex flex-col gap-3">
              {bounded.states.map((s) => (
                <li key={s.label} className="flex items-start justify-between gap-4 text-[0.8125rem]">
                  <span className="min-w-0 flex-1 text-pretty text-tx-2">{s.label}</span>
                  <span className="flex shrink-0 items-center gap-3 pt-0.5">
                    <span className="text-[0.75rem] text-tx-2">{s.note}</span>
                    <span className="flex gap-1" aria-label={`evidence strength ${s.level} of 3`}>
                      {[1, 2, 3].map((n) => (
                        <span
                          key={n}
                          className={`h-1.5 w-5 rounded-full ${n <= s.level ? "bg-accent" : "bg-ui-2"}`}
                        />
                      ))}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-tx-2">{bounded.body}</p>
          </Reveal>

          <Reveal delay={0.12} className="card flex items-center gap-6 p-6 sm:p-7">
            <OrganicSphere size={64} level={0.35} className="shrink-0" />
            <div>
              <h3 className="text-[1.05rem] text-tx">{voice.title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-tx-2">{voice.body}</p>
            </div>
          </Reveal>

          <Reveal delay={0.16} className="card flex items-center gap-6 p-6 sm:p-7">
            <div className="flex shrink-0 items-center gap-1.5">
              {keyboard.kbd.map((k) => (
                <span key={k} className="kbd h-8 min-w-8 px-2 text-[0.8rem]">
                  {k}
                </span>
              ))}
            </div>
            <div>
              <h3 className="text-[1.05rem] text-tx">{keyboard.title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-tx-2">{keyboard.body}</p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7 md:col-span-2">
            <div className="flex shrink-0 gap-2">
              {model.chips.map((c, i) => (
                <span
                  key={c}
                  className={`tile px-3 py-1.5 text-[0.8125rem] ${i === 0 ? "text-tx" : "text-tx-2"}`}
                >
                  {c}
                </span>
              ))}
              <span className="tile px-3 py-1.5 text-[0.8125rem] text-tx-2">…</span>
            </div>
            <div>
              <h3 className="text-[1.05rem] text-tx">{model.title}</h3>
              <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-tx-2">{model.body}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3 className="text-[1.25rem] text-tx">{title}</h3>
      <p className="mt-1 font-serif text-[1.1rem] text-tx-2">{sub}</p>
    </div>
  );
}
