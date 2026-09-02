import { Evidence } from "@/components/site/Evidence";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { IntroProvider } from "@/components/site/Intro";
import { Lenses } from "@/components/site/Lenses";
import { Memory } from "@/components/site/Memory";
import { Method } from "@/components/site/Method";
import { Nav } from "@/components/site/Nav";
import { Orbit } from "@/components/site/Orbit";
import { WiseWords } from "@/components/site/WiseWords";

export default function Home() {
  return (
    <IntroProvider>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Method />
        <Lenses />
        <Evidence />
        <Orbit />
        <Memory />
        <WiseWords />
        <FinalCta />
      </main>
      <Footer />
    </IntroProvider>
  );
}
