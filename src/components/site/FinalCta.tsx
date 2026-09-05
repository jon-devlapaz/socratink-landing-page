import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { finalCta } from "@/lib/content";

/** lazy.so's closing: headline left, wide button right, a lit horizon arc rising from below. */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden pt-12 pb-36 sm:pt-16 sm:pb-44">
      <Horizon />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <h2 className="flex flex-col text-[2.4rem] leading-[1.05] sm:text-[3rem]">
            <span className="h-sans">{finalCta.titleSans}</span>
            <span className="h-serif">{finalCta.titleSerif}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col items-start gap-3 md:items-end">
          <Link href={finalCta.button.href} className="btn-accent min-w-[16rem] justify-center py-3 text-[0.875rem]">
            {finalCta.button.label}
          </Link>
          <p className="text-[0.75rem] text-tx-2">{finalCta.sub}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Horizon() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[12rem] overflow-hidden sm:h-[16rem]">
      <div
        className="absolute left-1/2 top-[12%] h-[220vw] w-[220vw] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, #131211 0%, #100f0f 70%)",
          boxShadow:
            "inset 0 1px 0 0 rgba(206,205,195,0.28), inset 0 30px 90px -40px rgba(206,205,195,0.25), 0 -20px 120px -60px rgba(58,169,159,0.35)",
        }}
      />
    </div>
  );
}
