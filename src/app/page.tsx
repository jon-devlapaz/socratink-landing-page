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
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <EncounterStrip />
        <Orbit />
        <Memory />
        <FinalCta />
      </main>
      <ScrollCraft />
    </>
  );
}
