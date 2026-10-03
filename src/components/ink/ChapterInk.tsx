"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { InkStudy } from "@/lib/ink/studies";
import { inkArtwork } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./chapter-ink.module.css";

export function ChapterInk({ study }: { study: InkStudy }) {
  const mount = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);
  const furthest = useRef(0);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();
  const description = inkArtwork.studies.find((item) => item.id === study)!;

  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    if (reduceMotion) {
      furthest.current = 1;
      hasEntered.current = true;
      return;
    }
    const figure = element.parentElement!;
    const track = figure.closest<HTMLElement>(".folio-section-track");
    if (!track) throw new Error("Chapter ink requires a folio track");
    // Hydrated artwork starts on clean paper; no-JS keeps the finished poster.
    figure.dataset.inkState = hasEntered.current ? "fallback" : "preparing";
    let disposed = false;
    let started = false;
    let painted = false;
    let frame = 0;
    let advance: ((progress: number) => void) | undefined;
    let cleanup = () => {};
    const updateProgress = () => {
      if (disposed || !innerHeight) return;
      if (furthest.current < 1) {
        const sheet = track.getBoundingClientRect();
        const mark = figure.getBoundingClientRect();
        // Use the sheet's arrival, not its pinned position or extra scroll length.
        const range = Math.min(innerHeight * 0.55, Math.max(innerHeight * 0.14,
          innerHeight - (mark.bottom - sheet.top) + mark.height * 0.15));
        element.dataset.inkScrollRange = range.toFixed(3);
        furthest.current = Math.max(furthest.current, Math.min(1, Math.max(0, 1 - sheet.top / range)));
      }
      advance?.(furthest.current);
    };
    const scheduleProgress = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(() => {
        frame = 0;
        updateProgress();
      });
    };
    const resize = new ResizeObserver(scheduleProgress);
    resize.observe(track);
    resize.observe(figure);
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    document.fonts.ready.then(scheduleProgress);
    updateProgress();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      import("@/lib/ink/study-renderer").then(({ mountInkStudy }) => {
        if (disposed) return;
        const ink = mountInkStudy(element, study, (value) => {
          if (disposed) return;
          if (value) {
            painted = true;
            hasEntered.current = true;
            figure.dataset.inkState = "ready";
          } else if (painted) {
            furthest.current = 1;
            figure.dataset.inkState = "fallback";
            scheduleProgress();
          }
          setReady(value);
        });
        advance = ink.setProgress;
        updateProgress();
        cleanup = () => ink.destroy();
      }).catch(() => {
        if (!disposed) {
          furthest.current = 1;
          figure.dataset.inkState = "fallback";
          setReady(false);
        }
      });
    }, { rootMargin: "240px 0px" });
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      cleanup();
      delete figure.dataset.inkState;
      delete element.dataset.inkScrollRange;
    };
  }, [study, reduceMotion]);

  return (
    <figure className={`how-map ${styles.figure}`} role="img"
      aria-label={`${description.name}. ${description.description}`} data-chapter-ink={study} data-ready={ready && !reduceMotion}
      style={{
        "--study-poster-light": `url('/brand/ink-${study}-light.webp')`,
        "--study-poster-dark": `url('/brand/ink-${study}-dark.webp')`,
      } as CSSProperties}>
      <div ref={mount} className={styles.canvas} data-study={study} />
      <div className={styles.poster} aria-hidden="true" />
    </figure>
  );
}
