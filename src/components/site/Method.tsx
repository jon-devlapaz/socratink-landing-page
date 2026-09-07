import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ReactNode } from "react";
import { method } from "@/lib/content";

export function Method({ children }: { children: ReactNode }) {
  return (
    <section data-sc-act="flow" id="method" className="relative scroll-mt-24 py-12 sm:py-16">
      <div className="method-intro mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-start lg:gap-20">
        <SectionHeading
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
      <p className="method-principle content-wrap">
        <span>assisted success</span>
        <span className="text-accent" aria-label="is not">
          ≠
        </span>
        <span>independent capability</span>
      </p>
      {children}
    </section>
  );
}
