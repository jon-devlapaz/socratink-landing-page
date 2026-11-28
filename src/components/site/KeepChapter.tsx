import "@/components/site/how-it-works/how-it-works.css";
import { ChapterInk } from "@/components/ink/ChapterInk";
import { keepChapter } from "@/lib/content";

export function KeepChapter() {
  return (
    <section id="keep" className="content-wrap how-chapter" aria-labelledby="keep-title">
      <div className="how-chapter-text">
        <h2 id="keep-title">{keepChapter.title}</h2>
        <p>{keepChapter.body}</p>
      </div>
      <ChapterInk study="teacher" />
    </section>
  );
}
