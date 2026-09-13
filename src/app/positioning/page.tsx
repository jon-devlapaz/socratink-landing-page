import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { AppearanceToggle } from "@/components/theme/AppearanceToggle";
import { positioning as copy } from "@/lib/positioning-content";
import styles from "./positioning.module.css";

export const metadata: Metadata = {
  title: { absolute: copy.seo.title },
  description: copy.seo.description,
  robots: { index: false, follow: false },
  openGraph: { title: copy.seo.title, description: copy.seo.description, url: "/positioning" },
  twitter: { title: copy.seo.title, description: copy.seo.description },
};

export default function PositioningPage() {
  return (
    <div className={styles.page}>
      <a href="#positioning-main" className="skip-link">Skip to content</a>
      <header className={styles.header}>
        <Wordmark />
        <div className={styles.headerActions}>
          <span className={styles.preview}>{copy.preview}</span>
          <Link href="/">{copy.currentPage}</Link>
          <AppearanceToggle />
        </div>
      </header>
      <main id="positioning-main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="positioning-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.hero.audience}</p>
            <h1 id="positioning-title">{copy.hero.title}</h1>
            <p className={styles.deck}>{copy.hero.body}</p>
            <a className="btn-accent" href="#sample-answer">{copy.cta}<span aria-hidden="true">↓</span></a>
            <p className={styles.fine}>{copy.hero.trust}</p>
            <p className={styles.heroNote}>{copy.hero.note}</p>
          </div>
          <article className={styles.sample} aria-labelledby="sample-title">
            <p className={styles.eyebrow}>{copy.sample.label}</p>
            <h2 id="sample-title">{copy.sample.title}</h2>
            <p className={styles.question}>{copy.sample.question}</p>
            <label htmlFor="sample-answer">{copy.sample.inputLabel}</label>
            <textarea id="sample-answer" rows={3} placeholder={copy.sample.placeholder} aria-describedby="sample-privacy" autoComplete="off" spellCheck={false} />
            <p id="sample-privacy" className={styles.fine}>{copy.sample.privacy}</p>
            <details className={styles.comparison}>
              <summary>{copy.sample.reveal}<span aria-hidden="true">+</span></summary>
              <div>
                <p className={styles.eyebrow}>{copy.sample.comparisonLabel}</p>
                <p>{copy.sample.explanation}</p>
                <ul>{copy.sample.checks.map((check) => <li key={check}>{check}</li>)}</ul>
                <p>{copy.sample.next}</p>
                <p className={styles.fine}>{copy.sample.boundary}</p>
              </div>
            </details>
          </article>
        </section>
        <section className={styles.section} aria-labelledby="benefits-title">
          <p className={styles.eyebrow}>{copy.benefits.label}</p>
          <div className={styles.intro}>
            <h2 id="benefits-title">{copy.benefits.title}</h2>
            <p>{copy.benefits.body}</p>
          </div>
          <div className={styles.columns}>
            {copy.benefits.items.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="steps-title">
          <p className={styles.eyebrow}>{copy.how.label}</p>
          <h2 id="steps-title">{copy.how.title}</h2>
          <ol className={styles.steps}>
            {copy.how.items.map((item, index) => <li key={item.title}><span aria-hidden="true">0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></li>)}
          </ol>
        </section>
        <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
          <div><p className={styles.eyebrow}>{copy.faq.label}</p><h2 id="faq-title">{copy.faq.title}</h2></div>
          <div>{copy.faq.items.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
        </section>
        <section className={styles.close} aria-labelledby="close-title">
          <h2 id="close-title">{copy.close.title}</h2>
          <p>{copy.close.body}</p>
          <a className="btn-accent" href="#sample-answer">{copy.cta}<span aria-hidden="true">↑</span></a>
          <p className={styles.fine}>{copy.hero.trust}</p>
        </section>
      </main>
      <footer className={styles.footer}><Wordmark /><span>{copy.preview}</span><Link href="/">{copy.currentPage}</Link></footer>
    </div>
  );
}
