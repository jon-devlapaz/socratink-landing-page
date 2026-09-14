"use client";

import { StepId, steps } from "./steps";

interface StepRailProps {
  activeStep: StepId | null;
}

/** Static step rail with nested descriptions: scroll-synced display only. No interaction. */
export function StepRail({ activeStep }: StepRailProps) {
  return (
    <ol className="how-tabs" aria-label="Learning session steps">
      {steps.map((step) => (
        <li
          key={step.id}
          className="how-step-tab"
          aria-current={activeStep === step.id ? "step" : undefined}
        >
          <span className="how-tab-mark" aria-hidden="true" />
          <span className="how-step-head">
            <span className="how-step-num">{step.stepNumber}</span> {step.title}
          </span>
          <p className="how-step-desc">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
