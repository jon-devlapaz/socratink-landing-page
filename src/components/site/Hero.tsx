"use client";

import Link from "next/link";
import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { hero, notebook } from "@/lib/content";
import { useMorphSpike } from "@/lib/sphere/use-morph-spike";

export function Hero() {
  const { active, level, tendril } = useMorphSpike();

  return (
    <section id="top" className="hero-act">
      <div className="hero-grid content-wrap">
        <div className="hero-copy">
          <h1 className="hero-title notebook-display">{notebook.heroTitle}</h1>
          <p>{notebook.heroBody}</p>
          <div className="hero-actions">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href={hero.primary.href} className="btn-accent">
                <span>{hero.primary.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <a
                href={hero.secondary.href}
                className="inline-flex min-h-11 items-center gap-1.5 text-xs sm:text-sm font-medium text-tx-2 hover:text-tx transition-colors px-1"
              >
                <span>{hero.secondary.label}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-trust">{notebook.heroTrust}</p>
          </div>
        </div>
        <figure className="hero-scene">
          <div className="hero-subject" aria-hidden="true">
            <OrganicSphere size={560} level={active ? level : 0} tendril={active ? tendril : 0} />
          </div>
          <figcaption>{notebook.heroNote}</figcaption>
        </figure>
      </div>
    </section>
  );
}
