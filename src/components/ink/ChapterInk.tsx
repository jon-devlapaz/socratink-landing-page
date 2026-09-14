"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { INK_STUDIES, type InkStudy } from "@/lib/ink/studies";
import styles from "./chapter-ink.module.css";

export function ChapterInk({ study }: { study: InkStudy }) {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const description = INK_STUDIES.find((item) => item.id === study)!;

  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    let disposed = false;
    let started = false;
    let cleanup = () => {};
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      import("@/lib/ink/study-renderer").then(({ mountInkStudy }) => {
        if (disposed) return;
        const ink = mountInkStudy(element, study, (value) => {
          if (!disposed) setReady(value);
        });
        cleanup = () => ink.destroy();
      }).catch(() => { if (!disposed) setReady(false); });
    }, { rootMargin: "240px 0px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); cleanup(); };
  }, [study]);

  return (
    <figure className={`how-map ${styles.figure}`} role="img"
      aria-label={`${description.name}. ${description.description}`} data-chapter-ink={study} data-ready={ready}
      style={{
        "--study-poster-light": `url('/brand/ink-${study}-light.png')`,
        "--study-poster-dark": `url('/brand/ink-${study}-dark.png')`,
      } as CSSProperties}>
      <div ref={mount} className={styles.canvas} data-study={study} />
      <div className={styles.poster} aria-hidden="true" />
    </figure>
  );
}
