import { Footer } from "@/components/site/Footer";
import { StartLearningLink } from "@/components/site/StartLearningLink";
import { hero, inkArtwork } from "@/lib/content";
import styles from "./ending.module.css";

export function Colophon() {
  return (
    <section id="colophon" className={styles.colophon}>
      <div className={`content-wrap ${styles.colophonInvite}`} data-colophon>
        <StartLearningLink />
        <p>{hero.subline}</p>
        <div className={styles.printersMark} aria-hidden="true" data-printers-mark>
          {inkArtwork.studies.map(({ id }) => {
            const mask = `url('/brand/signature-${id}.webp')`;
            return <span key={id} style={{ maskImage: mask, WebkitMaskImage: mask }} />;
          })}
        </div>
      </div>
      <Footer />
    </section>
  );
}
