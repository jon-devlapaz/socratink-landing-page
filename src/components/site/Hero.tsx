import { StartLearningLink } from "@/components/site/StartLearningLink";
import { InkSphere } from "@/components/ink/InkSphere";
import { hero, site } from "@/lib/content";

export function Hero() {
  return (
    <section id="top" className="hero-act">
      <div className="hero-grid content-wrap">
        <div className="hero-copy">
          <h1 className="hero-title notebook-display">
            {hero.title}
          </h1>
          <p>{site.description}</p>
          <div className="hero-actions">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <StartLearningLink />
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
