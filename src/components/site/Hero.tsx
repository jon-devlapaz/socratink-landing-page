"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { InkSphere } from "@/components/ink/InkSphere";
import type { SphereShape } from "@/lib/sphere/organic-sphere";
import { hero, notebook } from "@/lib/content";

const OrganicSphere = dynamic(() => import("@/components/ui/OrganicSphere").then((module) => module.OrganicSphere));

function subscribeLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getQueryShape(): SphereShape | undefined {
  if (typeof window === "undefined") return undefined;
  const s = new URLSearchParams(window.location.search).get("shape");
  return s ? (s as SphereShape) : undefined;
}

function getQueryMorph(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const m = new URLSearchParams(window.location.search).get("morph");
  return m ? parseFloat(m) : undefined;
}

export function Hero() {
  const testShape = useSyncExternalStore(subscribeLocation, getQueryShape, () => undefined);
  const testMorph = useSyncExternalStore(subscribeLocation, getQueryMorph, () => undefined);

  return (
    <section id="top" className="hero-act">
      <div className="hero-grid content-wrap">
        <div className="hero-copy">
          {notebook.heroEyebrow ? (
            <div className="hero-eyebrow">{notebook.heroEyebrow}</div>
          ) : null}
          <h1 className="hero-title notebook-display" data-split-reveal>
            {notebook.heroTitle}
          </h1>
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
          <div className="hero-subject">
            {testShape ? (
              <OrganicSphere size={560} shape={testShape} morph={testMorph} />
            ) : (
              <InkSphere />
            )}
          </div>
          <figcaption>{notebook.heroNote}</figcaption>
        </figure>
      </div>
    </section>
  );
}
