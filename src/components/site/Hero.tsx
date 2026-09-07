"use client";

import Link from "next/link";
import Image from "next/image";
import { OrganicSphere } from "@/components/ui/OrganicSphere";
import { hero, notebook } from "@/lib/content";
import { useActProgress } from "@/lib/scroll/use-act-progress";

export function Hero() {
  const { ref } = useActProgress(["start start", "end start"]);
  return (
    <section ref={ref} id="top" className="hero-act content-wrap" data-sc-act="flow">
      <div className="hero-copy" data-sc-cue="0 1 0 0" data-sc-rise="0">
        <Image src="/brand/socratink_wordmark.png" alt="Socratink" width={489} height={88} preload className="hero-wordmark" />
        <h1 className="hero-title notebook-display">{notebook.heroTitle}</h1>
        <p>{notebook.heroBody}</p>
        <p className="hero-form">{notebook.heroForm}</p>
        <Link href={hero.primary.href} className="btn-accent">{hero.primary.label}<span aria-hidden="true">↗</span></Link>
        <p className="hero-trust">{notebook.heroTrust}</p>
      </div>
      <figure className="hero-scene">
        <div className="hero-subject" aria-hidden="true"><OrganicSphere size={560} /></div>
        <figcaption>{notebook.heroNote}</figcaption>
      </figure>
    </section>
  );
}
