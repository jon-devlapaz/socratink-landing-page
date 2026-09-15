import { InkSphere } from "@/components/ink/InkSphere";
import { hero, notebook } from "@/lib/content";

export function Hero() {
  return (
    <section id="top" className="hero-act">
      <div className="hero-grid content-wrap">
        <div className="hero-copy">
          <h1 className="hero-title notebook-display">
            {notebook.heroTitle}
          </h1>
          <p>{notebook.heroBody}</p>
          <div className="hero-actions">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a href={hero.primary.href} className="btn-accent">
                <span>{hero.primary.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a href={hero.secondary.href} className="hero-secondary">
                <span>{hero.secondary.label}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-subline">{hero.subline}</p>
          </div>
        </div>
        <figure className="hero-scene">
          <div className="hero-subject">
            <InkSphere />
          </div>
        </figure>
      </div>
    </section>
  );
}
