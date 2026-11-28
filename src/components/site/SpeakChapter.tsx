import "@/components/site/how-it-works/how-it-works.css";
import { ChapterInk } from "@/components/ink/ChapterInk";
import { speakChapter } from "@/lib/content";

export function SpeakChapter() {
  return (
    <section id="speak" className="content-wrap how-chapter" aria-labelledby="speak-title">
      <div className="how-chapter-text">
        <h2 id="speak-title">{speakChapter.title}</h2>
        <p>{speakChapter.body}</p>
      </div>
      <ChapterInk study="speak" />
    </section>
  );
}
