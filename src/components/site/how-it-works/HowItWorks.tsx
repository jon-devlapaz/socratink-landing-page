import "@/components/site/how-it-works/how-it-works.css";
import { ChapterInk } from "@/components/ink/ChapterInk";
import { mapChapter } from "@/lib/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-chapter" aria-labelledby="how-it-works-title">
      <div className="how-chapter-text">
        <span className="how-chapter-cue" aria-hidden="true">{mapChapter.cue}</span>
        <h2 id="how-it-works-title">{mapChapter.title}</h2>
        <div className="how-chapter-journey">
          {mapChapter.journey.map((line) => <p key={line}>{line}</p>)}
        </div>
      </div>
      <ChapterInk study="map" />
    </section>
  );
}
