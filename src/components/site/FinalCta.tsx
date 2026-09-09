import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { finalCta } from "@/lib/content";

export function FinalCta() {
  return (
    <section id="takeaway" className="close-act" data-sc-act="flow" aria-labelledby="close-title">
      <div className="close-horizon-wrap" aria-hidden="true">
        <div className="close-horizon" />
      </div>
      <div className="content-wrap close-content">
        <h2 id="close-title" className="notebook-display">
          {finalCta.titleSans}<br />{finalCta.titleSerif}
        </h2>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Link href={finalCta.button.href} className="btn-accent">
            {finalCta.button.label}<span aria-hidden="true">↗</span>
          </Link>
          <p className="text-[0.75rem] text-tx-2">{finalCta.sub}</p>
        </div>
      </div>
      <Footer />
    </section>
  );
}
