import { Footer } from "@/components/site/Footer";
import { colophon } from "@/lib/content";
import styles from "./ending.module.css";

export function Colophon() {
  return (
    <section id="colophon" className={styles.colophon}>
      <div className={`content-wrap ${styles.colophonInvite}`} data-colophon>
        <a href={colophon.button.href}>{colophon.button.label}</a>
        <p>{colophon.subline}</p>
      </div>
      <Footer />
    </section>
  );
}
