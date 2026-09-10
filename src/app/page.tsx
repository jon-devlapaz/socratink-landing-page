import { AnimatedCursor } from "@/components/ui/AnimatedCursor";
import { EncounterStrip } from "@/components/site/EncounterStrip";
import { FinalCta } from "@/components/site/FinalCta";
import { CinematicScroller } from "@/components/site/CinematicScroller";
import { Preloader } from "@/components/site/Preloader";
import { Hero } from "@/components/site/Hero";
import { Memory } from "@/components/site/Memory";
import { Nav } from "@/components/site/Nav";
import { Orbit } from "@/components/site/Orbit";

export default function Home() {
  return (
    <>
      <Preloader />
      <AnimatedCursor />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <EncounterStrip />
        <div className="folio-section-track folio-track-material" data-story-section>
          <div className="folio-section-shell">
            <Orbit />
          </div>
        </div>
        <div className="folio-section-track folio-track-memory" data-story-section>
          <div className="folio-section-shell">
            <Memory />
          </div>
        </div>
        <div className="folio-section-track folio-track-takeaway" data-story-section>
          <div className="folio-section-shell">
            <FinalCta />
          </div>
        </div>
      </main>
      <CinematicScroller />
    </>
  );
}
