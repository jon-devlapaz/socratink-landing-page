import { wiseWords } from "@/lib/content";

/** A single editorial coda after the product has made its case. */
export function WiseWords() {
  const quote = wiseWords.quotes[0];
  return (
    <section id="wise-words" data-sc-act="flow" className="wise-editorial content-wrap">
      <div>
        <h2 className="text-base text-tx">{wiseWords.titleSans}</h2>
        <p className="mt-1 text-sm text-tx-2">{wiseWords.titleSerif}</p>
      </div>
      <figure>
        <blockquote className="wise-pullquote">“{quote.text}”</blockquote>
        <figcaption className="mt-6 text-sm text-tx-2">{quote.who} · {quote.where}</figcaption>
      </figure>
    </section>
  );
}
