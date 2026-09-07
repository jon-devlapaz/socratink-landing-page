"use client";

import { useLayoutEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { evidence } from "@/lib/content";

/** lazy.so's "Universal Inbox" bento, retargeted at Socratink's evidence model. */
export function Evidence() {
  const { steps, bounded } = evidence.cards;
  const sectionRef = useRef<HTMLElement>(null);
  const recordRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: recordRef, offset: ["start 70%", "end 45%"] });
  const paint = (value: number) => sectionRef.current?.style.setProperty("--evidence-p", value.toFixed(4));
  useLayoutEffect(() => { paint(scrollYProgress.get()); }, [scrollYProgress]);
  useMotionValueEvent(scrollYProgress, "change", paint);

  return (
    <section ref={sectionRef} id="evidence" data-sc-act="flow" className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          sans={evidence.titleSans}
          serif={evidence.titleSerif}
          align="left"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
          <Reveal className="card flex flex-col p-6 sm:p-7">
            <CardHead title={steps.title} sub={steps.sub} />
            <ol ref={recordRef} className="evidence-record mt-6 flex flex-col gap-2">
              {steps.items.map((item, i) => (
                <li
                  key={item}
                  className={`tile flex items-start gap-3 px-3.5 py-2.5 text-[0.8125rem] ${
                    i === steps.items.length - 1 ? "text-tx" : "text-tx-2"
                  }`}
                >
                  <span className="w-4 shrink-0 text-right text-[0.75rem] text-tx-2">{i + 1}</span>
                  <span className="min-w-0 text-pretty">
                    {i === 1 ? <>{item.slice(0, 10)}<span className="evidence-reveal">{item.slice(10)}</span></>
                      : i === steps.items.length - 1 ? <>{item.slice(0, item.indexOf("after one reveal"))}<span className="evidence-assistance">after one reveal</span></>
                      : item}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-tx-2">{steps.body}</p>
          </Reveal>

          <Reveal delay={0.05} className="card flex flex-col p-6 sm:p-7">
            <CardHead title={bounded.title} sub={bounded.sub} />
            <ul className="mt-6 flex flex-col gap-3">
              {bounded.states.map((s) => (
                <li key={s.label} className="flex items-start justify-between gap-4 text-[0.8125rem]">
                  <span className="min-w-0 flex-1 text-pretty text-tx-2">{s.label}</span>
                  <span className="flex shrink-0 items-center gap-3 pt-0.5">
                    <span className={`text-[0.75rem] text-tx-2 ${s.note === "after 1 reveal" ? "evidence-assessment" : ""}`}>{s.note}</span>
                    <span className="flex gap-1" aria-hidden="true">
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
