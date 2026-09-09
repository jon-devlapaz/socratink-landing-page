import { AnimatedCursor } from "@/components/ui/AnimatedCursor";
import { EncounterStrip } from "@/components/site/EncounterStrip";
import { FinalCta } from "@/components/site/FinalCta";
import { ScrollCraft } from "@/components/site/ScrollCraft";
import { Hero } from "@/components/site/Hero";
import { Memory } from "@/components/site/Memory";
import { Nav } from "@/components/site/Nav";
import { Orbit } from "@/components/site/Orbit";

export default function Home() {
  return (
    <>
      <AnimatedCursor color="58, 169, 159" innerSize={10} outerSize={10} trailingSpeed={0.7} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <EncounterStrip />
        <div className="folio-section-track folio-track-material">
          <div className="folio-section-shell">
            <Orbit />
          </div>
        </div>
        <div className="folio-section-track folio-track-memory">
          <div className="folio-section-shell">
            <Memory />
          </div>
        </div>
        <div className="folio-section-track folio-track-takeaway">
          <div className="folio-section-shell">
            <FinalCta />
          </div>
        </div>
      </main>
      <ScrollCraft />
    </>
  );
}
