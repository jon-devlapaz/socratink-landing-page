"use client";

import Link from "next/link";
import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { hero, notebook } from "@/lib/content";

export function Hero() {
  return (
    <section id="top" className="hero-act">
      <div className="hero-grid content-wrap">
        <div className="hero-copy">
          <h1 className="hero-title notebook-display">{notebook.heroTitle}</h1>
          <p>{notebook.heroBody}</p>
          <div className="hero-actions">
            <Link href={hero.primary.href} className="btn-accent">
              <span>{hero.primary.label}</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <p className="hero-trust">{notebook.heroTrust}</p>
          </div>
        </div>
        <figure className="hero-scene">
          <div className="hero-subject" aria-hidden="true">
            <OrganicSphere size={560} />
          </div>
          <figcaption>{notebook.heroNote}</figcaption>
        </figure>
      </div>
    </section>
  );
}
