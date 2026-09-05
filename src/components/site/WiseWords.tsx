import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { wiseWords } from "@/lib/content";

/**
 * lazy.so closes with stacked testimonial cards. Socratink has no testimonials to
 * quote yet, so the slot holds the older voices the method descends from.
 */
export function WiseWords() {
  return (
    <section className="py-12 sm:py-16">
      <SectionHeading eyebrow={wiseWords.eyebrow} sans={wiseWords.titleSans} serif={wiseWords.titleSerif} />

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 px-5 sm:px-8 md:grid-cols-3">
        {wiseWords.quotes.map((q, i) => (
          <Reveal key={q.who} delay={i * 0.08} className="card flex flex-col justify-between gap-8 p-6 sm:p-7">
            <blockquote className="font-serif text-[1.35rem] leading-snug text-tx">
              “{q.text}”
            </blockquote>
            <figcaption className="text-[0.8125rem]">
              <p className="text-tx">{q.who}</p>
              <p className="text-tx-2">{q.where}</p>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
