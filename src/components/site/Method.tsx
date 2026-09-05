import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Transcript } from "@/components/ui/Transcript";
import { method } from "@/lib/content";

export function Method() {
  return (
    <section id="method" className="relative scroll-mt-24 pt-12 pb-8 sm:pt-16 sm:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-start lg:gap-20">
        <SectionHeading
          eyebrow={method.eyebrow}
          sans={method.titleSans}
          serif={method.titleSerif}
          align="left"
          className="lg:w-[28rem] lg:shrink-0"
        />
        <Reveal delay={0.1}>
          <p className="max-w-xl text-[0.95rem] leading-relaxed text-pretty text-tx-2 lg:pt-9">
            {method.body}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.2} y={30} className="mx-auto mt-14 max-w-2xl px-5 sm:px-8">
        <div className="window">
          <div className="flex items-center gap-2 border-b border-tx/6 px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ui-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-ui-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-ui-3" />
            <span className="ml-3 flex-1 rounded-md bg-paper/60 px-3 py-1 text-[0.75rem] text-tx-2">
              app.socratink.ai
            </span>
          </div>
          <div className="p-5 sm:p-7">
            <Transcript turns={method.transcript} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
