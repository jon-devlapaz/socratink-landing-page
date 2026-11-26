"use client";

import { useState } from "react";
import { leafChapter } from "@/lib/content";
import styles from "./leaf-chapter.module.css";

const { exchanges } = leafChapter;

export function LeafChapter() {
  const [selected, setSelected] = useState(0);
  const exchange = exchanges[selected];
  const next = (selected + 1) % exchanges.length;

  return (
    <section className={`content-wrap how-chapter ${styles.chapter}`} aria-labelledby="leaf-title">
      <div className="how-chapter-text">
        <h2 id="leaf-title">{leafChapter.title}</h2>
        <dl id="leaf-exchange" className={styles.exchange} aria-live="polite" aria-atomic="true">
          <dt>{leafChapter.learnerLabel}</dt>
          <dd className={styles.answer}>{exchange.learner}</dd>
          <dt>{leafChapter.tutorLabel}</dt>
          <dd className={styles.question}>{exchange.tutor}</dd>
        </dl>
        <div className={styles.actions}>
          <button className="hero-secondary" type="button" aria-controls="leaf-exchange"
            onClick={() => setSelected(next)}>
            {next === 0 ? leafChapter.firstLabel : leafChapter.nextLabel} <span aria-hidden="true">→</span>
          </button>
          <a className="hero-secondary" href={leafChapter.askQuestion.href}>
            {leafChapter.askQuestion.label} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className={`how-map ${styles.branch}`} role="group" aria-label={leafChapter.branchLabel}>
        {exchanges.map((leaf, index) => (
          <div key={leaf.position} className={styles.leaf} data-position={leaf.position}>
            <button type="button" aria-label={leaf.label} aria-controls="leaf-exchange"
              aria-pressed={index === selected} onClick={() => setSelected(index)} />
          </div>
        ))}
      </div>
    </section>
  );
}
