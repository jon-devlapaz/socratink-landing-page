import { Colophon } from "@/components/site/Colophon";
import { CinematicScroller } from "@/components/site/CinematicScroller";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/how-it-works/HowItWorks";
import { SpeakChapter } from "@/components/site/SpeakChapter";
import { KeepChapter } from "@/components/site/KeepChapter";
import { Nav } from "@/components/site/Nav";

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <div className="folio-section-track folio-track-how">
          <div className="folio-section-shell">
            <HowItWorks />
          </div>
        </div>
        <div className="folio-section-track folio-track-speak">
          <div className="folio-section-shell">
            <SpeakChapter />
          </div>
        </div>
        <div className="folio-section-track folio-track-keep">
          <div className="folio-section-shell">
            <KeepChapter />
          </div>
        </div>
        <div className="folio-section-track folio-track-takeaway">
          <div className="folio-section-shell">
            <Colophon />
          </div>
        </div>
      </main>
      <CinematicScroller />
    </>
  );
}
