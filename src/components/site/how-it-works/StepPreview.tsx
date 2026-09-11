"use client";

import { StepId, previewData } from "./steps";

interface StepPreviewProps {
  activeStep: StepId;
  isReducedMotion: boolean;
}

export function StepPreview({ activeStep }: StepPreviewProps) {
  return (
    <div
      className="how-window-mock"
      role="region"
      aria-label="Diagnostic session preview"
    >
      {/* Window Header / Mac-style Ink Dots */}
      <div className="how-window-header">
        <div className="how-window-dots" aria-hidden="true">
          <span className="how-dot how-dot-close" />
          <span className="how-dot how-dot-min" />
          <span className="how-dot how-dot-max" />
        </div>
        <div className="how-window-title">
          <span className="how-window-indicator" aria-hidden="true" />
          <span>Socratink Session · Diagnostic Specimen</span>
        </div>
        <div className="w-12" aria-hidden="true" />
      </div>

      {/* Window Body with Deterministic Panels */}
      <div className="how-window-body">
        {/* Step 1: Target Specimen Selection */}
        <div
          id="panel-target"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby="tab-target"
          className={`how-panel ${activeStep === "target" ? "is-active" : "is-hidden"}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-tx/10 pb-3">
              <div>
                <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-tx-2">
                  Target Curriculum
                </span>
                <p className="text-sm font-semibold text-tx">
                  {previewData.target.category}
                </p>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[0.6875rem] font-medium text-accent">
                Active Selection
              </span>
            </div>

            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-paper">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-medium text-tx">
                    {previewData.target.activeTarget}
                  </p>
                  <p className="mt-1 text-xs text-tx-2">
                    {previewData.target.activeContext}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[0.6875rem] font-mono text-tx-2">
                Other syllabus targets
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {previewData.target.otherTargets.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-lg border border-tx/10 bg-paper-2/40 p-2.5 text-xs text-tx-2 opacity-75"
                  >
                    <span className="block text-[0.625rem] font-mono text-tx-3">
                      {t.subject}
                    </span>
                    <span className="line-clamp-1 font-medium text-tx">
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Explain Unaided Prompt & Response */}
        <div
          id="panel-explain"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby="tab-explain"
          className={`how-panel ${activeStep === "explain" ? "is-active" : "is-hidden"}`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tx/10 pb-3">
              <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-tx-2">
                Unassisted Free Response
              </span>
              <div className="flex items-center gap-1.5">
                {previewData.explain.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-tx/15 bg-paper-2 px-2 py-0.5 text-[0.625rem] font-medium text-tx-2"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Simulated Prompt */}
            <div className="rounded-lg border border-tx/10 bg-paper-2/60 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-tx-2 mb-1">
                Prompt
              </p>
              <p className="text-xs sm:text-sm text-tx font-serif leading-relaxed">
                {previewData.explain.prompt}
              </p>
            </div>

            {/* Simulated Student Response Box (Read-only demonstrative preview) */}
            <div className="rounded-lg border border-accent/30 bg-paper p-3.5 shadow-inner">
              <div className="flex items-center justify-between text-[0.6875rem] text-tx-2 mb-1.5">
                <span className="font-mono">Learner Submission</span>
                <span className="inline-flex items-center gap-1 text-[0.6875rem] text-accent font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  Recorded
                </span>
              </div>
              <p className="text-xs sm:text-sm text-tx leading-relaxed">
                {previewData.explain.response}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Inspect What Holds Diagnostic Readout */}
        <div
          id="panel-inspect"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby="tab-inspect"
          className={`how-panel ${activeStep === "inspect" ? "is-active" : "is-hidden"}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-tx/10 pb-3">
              <span className="text-[0.6875rem] font-mono uppercase tracking-wider text-tx-2">
                {previewData.inspect.subject}
              </span>
              <span className="rounded-full border border-tx/15 bg-paper-2 px-2.5 py-0.5 text-[0.6875rem] font-medium text-tx-2">
                Session Complete
              </span>
            </div>

            {/* Held Concept */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-paper" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {previewData.inspect.held.label}
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm text-tx leading-relaxed">
                    {previewData.inspect.held.detail}
                  </p>
                </div>
              </div>
            </div>

            {/* Identified Gap */}
            <div className="rounded-xl border border-amber-600/30 bg-amber-500/5 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-paper" aria-hidden="true">
                  !
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {previewData.inspect.gap.label}
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm text-tx leading-relaxed">
                    {previewData.inspect.gap.detail}
                  </p>
                </div>
              </div>
            </div>

            {/* Continuity Probe */}
            <div className="rounded-xl border border-tx/15 bg-paper-2/60 p-3">
              <div className="flex items-center gap-2 text-xs text-tx-2">
                <span className="text-sm font-mono text-accent" aria-hidden="true">◷</span>
                <span className="font-semibold text-tx">{previewData.inspect.schedule.label}:</span>
                <span>{previewData.inspect.schedule.detail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
