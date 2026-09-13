"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { previewData } from "./steps";

interface StepPreviewProps {
  progress: number;
  isReducedMotion: boolean;
}

const reveal = (progress: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (progress - start) / (end - start)));

export function StepPreview({ progress, isReducedMotion }: StepPreviewProps) {
  // False during SSR, true after hydration: SSR/no-JS render the resolved folio.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const p = !mounted || isReducedMotion ? 1 : progress;
  const scaffold = reveal(p, 0.08, 0.24);
  const response = reveal(p, 0.28, 0.5);
  const inspect = reveal(p, 0.54, 0.76);
  const inkStyle = {
    "--scaffold": scaffold,
    "--response": response,
    "--inspect": inspect,
  } as CSSProperties;

  return (
    <figure className="how-folio" style={inkStyle} aria-label="Example session: a target becomes a record of learner-authored evidence">
      <figcaption className="how-folio-header">
        <span className="how-folio-subject">{previewData.target.category}</span>
      </figcaption>
      <div className="how-manuscript">
        <div className="how-folio-target">
          <h3>{previewData.target.activeTarget}</h3>
        </div>
        <div className="how-folio-scaffold how-reveal">
          <p className="how-prompt">{previewData.explain.prompt}</p>
        </div>
        <div className="how-folio-response how-reveal">
          <blockquote>
            “More responses should give us a more accurate estimate because the{" "}
            <span className="how-held-ink">law of large numbers</span> averages out{" "}
            <span className="how-gap-ink">individual errors</span>.”
          </blockquote>
        </div>
        <div className="how-folio-inspect how-reveal">
          <div className="how-annotations">
            <p><strong className="how-held-label">{previewData.inspect.held.label}</strong>{previewData.inspect.held.detail}</p>
            <p><strong className="how-gap-label">{previewData.inspect.gap.label}</strong>{previewData.inspect.gap.detail}</p>
          </div>
        </div>
      </div>
      <p className="how-folio-footer">Illustration only. This walkthrough stores nothing.</p>
    </figure>
  );
}
