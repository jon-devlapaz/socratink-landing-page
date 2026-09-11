import { Wordmark } from "@/components/ui/Wordmark";
import { footer, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-rail">
        <div className="site-footer-brand">
          <Wordmark />
          <p className="site-footer-copy">
            © {site.name} {site.year}. {footer.legalNote}
          </p>
        </div>

        <div className="site-footer-bands">
          <div className="site-footer-band">
            <p className="site-footer-kicker">{footer.indexLabel}</p>
            <ul>
              {footer.index.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-band">
            <p className="site-footer-kicker">{footer.legalLabel}</p>
            <ul>
              <li>
                <span className="site-footer-quiet">{footer.quiet}</span>
              </li>
            </ul>
          </div>

          <div className="site-footer-band site-footer-band-attempt">
            <p className="site-footer-kicker">{footer.attemptLabel}</p>
            <a className="site-footer-cta" href={footer.attempt.href}>
              {footer.attempt.label}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
