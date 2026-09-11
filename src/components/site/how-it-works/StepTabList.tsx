"use client";

import { useRef } from "react";
import { StepId, steps } from "./steps";

interface StepTabListProps {
  activeStep: StepId;
  progress: number;
  isPaused: boolean;
  isReducedMotion: boolean;
  onSelectStep: (id: StepId) => void;
  onTogglePause: () => void;
}

export function StepTabList({
  activeStep,
  progress,
  isPaused,
  isReducedMotion,
  onSelectStep,
  onTogglePause,
}: StepTabListProps) {
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (index + 1) % steps.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (index - 1 + steps.length) % steps.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = steps.length - 1;
    } else {
      return;
    }

    const nextStep = steps[nextIndex];
    onSelectStep(nextStep.id);
    const targetButton = tablistRef.current?.querySelector<HTMLButtonElement>(
      `#tab-${nextStep.id}`
    );
    targetButton?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Roving tabindex tablist */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-orientation="vertical"
        aria-label="Diagnostic session steps"
        className="flex flex-col gap-3"
      >
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              id={`tab-${step.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${step.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectStep(step.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`how-step-tab text-left transition-all ${
                isActive ? "is-active" : "is-inactive"
              }`}
            >
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`font-mono text-xs font-semibold ${
                    isActive ? "text-accent" : "text-tx-2"
                  }`}
                >
                  {step.stepNumber}
                </span>
                <span className="font-serif text-base sm:text-lg font-medium text-tx">
                  {step.title}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-tx-2 leading-relaxed ps-7">
                {step.description}
              </p>

              {/* Progress bar track & scaleX indicator */}
              {!isReducedMotion && (
                <div className="how-progress-track" aria-hidden="true">
                  <div
                    className="how-progress-bar"
                    style={{
                      transform: `scaleX(${isActive ? progress : 0})`,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explicit Accessible Pause/Resume Control (WCAG 2.2.2) */}
      {!isReducedMotion && (
        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onTogglePause}
            aria-pressed={isPaused}
            className="inline-flex items-center gap-1.5 text-xs text-tx-2 hover:text-tx focus-visible:outline-2 focus-visible:outline-accent rounded px-2 py-1 transition-colors"
          >
            <span aria-hidden="true" className="text-xs">
              {isPaused ? "▶" : "❚❚"}
            </span>
            <span>{isPaused ? "Resume automatic steps" : "Pause automatic steps"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
