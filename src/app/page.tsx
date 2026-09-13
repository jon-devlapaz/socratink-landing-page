import { AnimatedCursor } from "@/components/ui/AnimatedCursor";
import { FinalCta } from "@/components/site/FinalCta";
import { CinematicScroller } from "@/components/site/CinematicScroller";
import { Preloader } from "@/components/site/Preloader";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/how-it-works/HowItWorks";
import { RetentionCurve } from "@/components/site/RetentionCurve";
import { Memory } from "@/components/site/Memory";
import { Faq } from "@/components/site/Faq";
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
        <div className="folio-section-track folio-track-how" data-story-section>
          <div className="folio-section-shell">
            <HowItWorks />
          </div>
        </div>
        <div className="folio-section-track folio-track-material" data-story-section>
          <div className="folio-section-shell">
            <Orbit />
          </div>
        </div>
        <div className="folio-section-track folio-track-retention">
          <RetentionCurve />
        </div>
        <div className="folio-section-track folio-track-memory">
          <div className="folio-section-shell">
            <Memory />
          </div>
        </div>
        <div className="folio-section-track folio-track-faq" data-story-section>
          <div className="folio-section-shell">
            <Faq />
          </div>
        </div>
        <div className="folio-section-track folio-track-takeaway">
          <div className="folio-section-shell">
            <FinalCta />
          </div>
        </div>
      </main>
      <CinematicScroller />
    </>
  );
}
