import { Footer } from "@/components/site/Footer";
import { colophon, inkArtwork } from "@/lib/content";
import styles from "./ending.module.css";

export function Colophon() {
  return (
    <section id="colophon" className={styles.colophon}>
      <div className={`content-wrap ${styles.colophonInvite}`} data-colophon>
        <a href={colophon.button.href}>{colophon.button.label}</a>
        <p>{colophon.subline}</p>
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
