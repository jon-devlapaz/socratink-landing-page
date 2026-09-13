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
      <nav aria-label="Footer" className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
        <ul className={styles.footerLinks}>
          {footer.index.map((link) => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
          ))}
        </ul>
        <span className="hidden sm:inline text-tx/20 text-xs" aria-hidden="true">·</span>
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
