"use client";

import { useRef } from "react";
import { StepTabList } from "./StepTabList";
import { StepPreview } from "./StepPreview";
import { useStepAutoAdvance } from "./useStepAutoAdvance";
import "./how-it-works.css";

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);

  const {
    active,
    progress,
    isPaused,
    isReducedMotion,
    selectStep,
    togglePause,
    setIsHovered,
    setIsFocused,
  } = useStepAutoAdvance({ containerRef });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      aria-labelledby="how-it-works-title"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Section Heading */}
      <div className="mb-10 sm:mb-14">
        <div className="text-[0.6875rem] font-mono font-semibold uppercase tracking-[0.14em] text-accent mb-2">
          The diagnostic loop
        </div>
        <h2
          id="how-it-works-title"
          className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-tx"
        >
          How a session works
        </h2>
        <p className="mt-2 text-sm sm:text-base text-tx-2 max-w-xl leading-relaxed">
          Three quick steps to test what you actually know.
        </p>
      </div>

      {/* Grid: Left Tabs, Right Mockup Window */}
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-12 min-w-0">
        <div className="md:col-span-5 min-w-0">
          <StepTabList
            activeStep={active}
            progress={progress}
            isPaused={isPaused}
            isReducedMotion={isReducedMotion}
            onSelectStep={selectStep}
            onTogglePause={togglePause}
          />
        </div>

        <div className="md:col-span-7 min-w-0">
          <StepPreview
            activeStep={active}
            isReducedMotion={isReducedMotion}
          />
        </div>
      </div>
    </section>
  );
}
