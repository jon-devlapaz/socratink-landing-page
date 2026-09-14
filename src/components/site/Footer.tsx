import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { footer, site } from "@/lib/content";
import styles from "./ending.module.css";

export function Footer() {
  return (
    <footer className={`content-wrap ${styles.footer}`}>
      <div className={styles.footerBrand}>
        <Wordmark />
        <p>© {site.name} {site.year}. {footer.legalNote}</p>
      </div>
      <nav aria-label="Footer">
        <ul className={styles.footerLinks}>
          {footer.legal.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("/") ? (
                <Link href={link.href}>{link.label}</Link>
              ) : (
                <a href={link.href}>{link.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
