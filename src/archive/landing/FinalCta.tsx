import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { finalCta } from "@/archive/landing/content";
import styles from "./ending.module.css";

export function FinalCta() {
  return (
    <section id="takeaway" className={styles.close} aria-labelledby="close-title" data-story-section>
      <div className={`content-wrap ${styles.closeContent}`}>
        <div className={styles.invitation} data-reveal-item>
          <h2 id="close-title" className="notebook-display" data-split-reveal>{finalCta.title}</h2>
          <p className={styles.closePrompt}>{finalCta.prompt}</p>
          <Link href={finalCta.button.href} className="btn-accent">
            {finalCta.button.label}<span aria-hidden="true">↗</span>
          </Link>
          <p className={styles.closeTrust}>{finalCta.sub}</p>
        </div>
        <Image
          className={styles.closeInk}
          src="/brand/living-ink-poster.png"
          alt=""
          width={360}
          height={360}
          sizes="(max-width: 640px) 160px, 360px"
          data-reveal-item
        />
      </div>
      <Footer />
    </section>
  );
}
