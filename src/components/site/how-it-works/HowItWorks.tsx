"use client";

import { useRef } from "react";
import { StepRail } from "./StepRail";
import { StepPreview } from "./StepPreview";
import { useStepScrollProgress } from "./useStepScrollProgress";
import "./how-it-works.css";

export function HowItWorks() {
  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const { active, progress, isReducedMotion } =
    useStepScrollProgress({ trackRef, stickyRef });

  return (
    <section id="how-it-works" ref={trackRef} aria-labelledby="how-it-works-title"
      className="how-track" data-reduced-motion={isReducedMotion}>
      <div ref={stickyRef} className="how-sticky">
        <div className="how-composition">
          <div className="how-introduction">
            <h2 id="how-it-works-title">
              <span className="how-duet-sans">Your thinking,</span>
              <span className="how-duet-serif">made visible.</span>
            </h2>
            <StepRail activeStep={active} />
          </div>
          <StepPreview progress={progress} isReducedMotion={isReducedMotion} />
        </div>
      </div>
    </section>
  );
}
