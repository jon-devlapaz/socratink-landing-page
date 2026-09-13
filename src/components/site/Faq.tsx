"use client";

import { faq } from "@/lib/content";
import styles from "./faq.module.css";

export function Faq() {
  return (
    <section id="faq" className={styles.faqSection} aria-labelledby="faq-title" data-story-section>
      <div className={`content-wrap ${styles.faqGrid}`}>
        <div className={styles.faqIntro}>
          <span className={styles.faqEyebrow}>{faq.eyebrow}</span>
          <h2 id="faq-title" className={styles.faqTitle} data-split-reveal>
            {faq.title}
          </h2>
          <p className={styles.faqDeck}>
            {faq.deck}
          </p>
          <div className={styles.faqContactNote}>
            <span>Have a specific syllabus or question?</span>
            <a href="mailto:support@socratink.ai">support@socratink.ai</a>
          </div>
        </div>

        <div className={styles.faqList} role="region" aria-label="Frequently asked questions">
          {faq.items.map((item, idx) => (
            <details
              key={item.id}
              className={styles.faqItem}
              data-reveal-item
              // First question open by default to give immediate value and answer
              open={idx === 0 ? true : undefined}
            >
              <summary className={styles.faqTrigger}>
                <span className={styles.questionText}>{item.question}</span>
                <span className={styles.toggleGlyph} aria-hidden="true">
                  +
                </span>
              </summary>
              <div className={styles.answerContent}>
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
