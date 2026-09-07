"use client";

import "./encounter-strip.css";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { encounterFrame, method } from "@/lib/content";

type Beat = "target" | "cost" | "attempt" | "provenance" | "bound" | "return";
type ChoiceKey = "a" | "b" | "c";

const BEAT_NAMES: Record<Beat, string> = {
  target: "Target",
  cost: "Fluency Ghost",
  attempt: "Attempt",
  provenance: "Ink vs Glow",
  bound: "Evidence Contract",
  return: "Time-Lapse",
};

const CUES: Record<Beat, string> = {
  target: "Learning target",
  cost: "Cost · scroll to dissolve",
  attempt: "Three choices · scroll never waits",
  provenance: "Ink vs glow",
  bound: "Evidence contract",
  return: "Day 0 → +5d",
};

const PRINCIPLES: Record<Beat, { left: string; right: string }> = {
  target: { left: "Recognition", right: "independent recall" },
  cost: { left: "AI fluency", right: "your memory" },
  attempt: { left: "Attempt", right: "answer key first" },
  provenance: { left: "Your work", right: "assisted completion" },
  bound: { left: "Correct click", right: "durable capability" },
  return: { left: "Immediate success", right: "still yours later" },
};

const CHOICES: Record<
  ChoiceKey,
  {
    text: string;
    reality: string;
    glow: string;
    contract: {
      target: string;
      observed: string;
      inference: string;
      nonInferences: string[];
    };
    horizon: { mark: string; state: string; kind: "prov" | "unt" | "pend"; label: string }[];
  }
> = {
  a: {
    text: "A larger sample averages bias away.",
    reality:
      "Conflation: sample size cannot cure a biased sampling process (a bigger bucket of salty water doesn't make it fresh).",
    glow: "Answer key withheld. 3-choice recognition · distractors present · answer key withheld.",
    contract: {
      target: "Sampling bias invariance under sample size / variance vs selection",
      observed: "Conflated variance with selection; stated “larger averages bias away” under prompt.",
      inference: "Misconception captured; salty-water repair indicated. Does not support independent capability.",
      nonInferences: [
        "Does NOT establish durable retention",
        "Does NOT establish unprompted reconstruction",
        "Does NOT establish transfer to novel domains",
      ],
    },
    horizon: [
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Concept Recognition (3-choice)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Independent Reconstruction (Cold)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Transfer to Unseen Domain" },
      { mark: "○", state: "PENDING (+5d)", kind: "pend", label: "5-Day Temporal Durability" },
    ],
  },
  b: {
    text: "Bias is about how you sample, not how many.",
    reality:
      "Surface recognition from a menu. Bounded: can identify the principle when prompted — not unassisted recall.",
    glow: "Answer key withheld. 3-choice recognition · distractors present · answer key withheld.",
    contract: {
      target: "Sampling bias invariance under sample size / variance vs selection",
      observed: "Selected correct principle from three options (surface recognition).",
      inference: "Can identify the principle when prompted under multiple-choice conditions.",
      nonInferences: [
        "Does NOT establish durable retention",
        "Does NOT establish unprompted reconstruction",
        "Does NOT establish transfer to novel domains",
      ],
    },
    horizon: [
      { mark: "●", state: "PROVISIONAL", kind: "prov", label: "Concept Recognition (3-choice)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Independent Reconstruction (Cold)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Transfer to Unseen Domain" },
      { mark: "○", state: "PENDING (+5d)", kind: "pend", label: "5-Day Temporal Durability" },
    ],
  },
  c: {
    text: "I don’t know yet.",
    reality: "Calibrated gap. Zero pollution — no misconception formed. Ready for a minimal scaffold.",
    glow: "Answer key withheld. Admission recorded; no recognition credit issued.",
    contract: {
      target: "Sampling bias invariance under sample size / variance vs selection",
      observed: "Calibrated admission of gap under prompt; no false claim of knowing.",
      inference: "Zero pollution; ready for minimal scaffold; no misconception formed.",
      nonInferences: [
        "Does NOT establish durable retention",
        "Does NOT establish unprompted reconstruction",
        "Does NOT establish transfer to novel domains",
      ],
    },
    horizon: [
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Concept Recognition (3-choice)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Independent Reconstruction (Cold)" },
      { mark: "○", state: "UNTESTED", kind: "unt", label: "Transfer to Unseen Domain" },
      { mark: "○", state: "PENDING (+5d)", kind: "pend", label: "5-Day Temporal Durability" },
    ],
  },
};

const EMPTY_CONTRACT = {
  target: "Sampling bias invariance under sample size / variance vs selection",
  observed: "No attempt on the slip yet.",
  inference: "Nothing bounded — no learner performance recorded.",
  nonInferences: [
    "Does NOT establish durable retention",
    "Does NOT establish unprompted reconstruction",
    "Does NOT establish transfer to novel domains",
  ],
};

const EMPTY_HORIZON = [
  { mark: "○", state: "UNTESTED", kind: "unt" as const, label: "Concept Recognition (3-choice)" },
  { mark: "○", state: "UNTESTED", kind: "unt" as const, label: "Independent Reconstruction (Cold)" },
  { mark: "○", state: "UNTESTED", kind: "unt" as const, label: "Transfer to Unseen Domain" },
  { mark: "○", state: "PENDING (+5d)", kind: "pend" as const, label: "5-Day Temporal Durability" },
];

const BEATS: Beat[] = ["target", "cost", "attempt", "provenance", "bound", "return"];

/**
 * Method intro flows. Cold Ledger sticks in a viewport-fit two-plane shell:
 * Encounter (left) + Evidence Ledger (right), scroll-scrubbed beats.
 */
export function EncounterStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<Beat>("target");
  const [choice, setChoice] = useState<ChoiceKey | null>(null);
  const [sampleTrace, setSampleTrace] = useState(false);
  const [costP, setCostP] = useState(0);
  const [returnP, setReturnP] = useState(0);
  const [reduced, setReduced] = useState(false);

  const effective = useCallback((): { key: ChoiceKey; sample: boolean } | null => {
    if (choice) return { key: choice, sample: false };
    if (sampleTrace) return { key: "b", sample: true };
    return null;
  }, [choice, sampleTrace]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const shell = shellRef.current;
    if (!track || !shell) return;

    const applyVars = (nextCost: number, nextReturn: number) => {
      const ghostOp = reduced ? (nextCost > 0.55 ? 0 : 1) : Math.max(0, 1 - nextCost);
      const ghostBlur = reduced ? 0 : nextCost * 7;
      const stampOp = reduced ? (nextCost > 0.35 ? 0.7 : 0.35) : 0.25 + nextCost * 0.65;
      const root = document.documentElement;
      root.style.setProperty("--enc-cost-p", String(nextCost));
      root.style.setProperty("--enc-return-p", String(nextReturn));
      root.style.setProperty("--enc-ghost-op", String(ghostOp));
      root.style.setProperty("--enc-ghost-blur", `${ghostBlur.toFixed(2)}px`);
      root.style.setProperty("--enc-stamp-op", String(stampOp));
    };

    const pick = () => {
      const nav = 56; // Nav h-14
      const shellTop = shell.getBoundingClientRect().top;
      // Pin gate: beat scrubbing only after sticky shell is actually stuck
      if (shellTop > nav + 1) {
        setBeat("target");
        setCostP(0);
        setReturnP(0);
        setSampleTrace(false);
        applyVars(0, 0);
        return;
      }

      // Document-relative progress (track.offsetTop is offsetParent-local and races
      // ahead by method-intro height before pin — ~630px on desktop).
      const trackTop = track.getBoundingClientRect().top;
      const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
      let p = Math.min(1, Math.max(0, (nav - trackTop) / travel));

      // Lead-in: hold Target for first ~10% of post-pin travel before Fluency Ghost
      const LEAD = 0.1;
      if (p < LEAD) p = 0;
      else p = (p - LEAD) / (1 - LEAD);

      let next: Beat;
      let nextCost = 0;
      let nextReturn = 0;
      if (p < 0.11) {
        next = "target";
      } else if (p < 0.32) {
        next = "cost";
        nextCost = (p - 0.11) / (0.32 - 0.11);
      } else if (p < 0.45) {
        next = "attempt";
        nextCost = 1;
      } else if (p < 0.58) {
        next = "provenance";
        nextCost = 1;
      } else if (p < 0.68) {
        next = "bound";
        nextCost = 1;
      } else if (p < 0.92) {
        next = "return";
        nextCost = 1;
        nextReturn = (p - 0.68) / (0.92 - 0.68);
      } else {
        next = "return";
        nextCost = 1;
        nextReturn = 1;
      }

      setBeat(next);
      setCostP(nextCost);
      setReturnP(nextReturn);

      setSampleTrace((prev) => {
        if (choice) return false;
        if (next === "provenance" || next === "bound" || next === "return") return true;
        if (next === "attempt" || next === "target" || next === "cost") return false;
        return prev;
      });

      applyVars(nextCost, nextReturn);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        pick();
        ticking = false;
      });
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [choice, reduced]);

  const ec = effective();
  const dayLabel = returnP < 0.08 ? "Day 0" : returnP >= 0.88 ? "+5d" : `+${Math.round(returnP * 5)}d`;
  const showSample =
    !!(ec && ec.sample && (beat === "attempt" || beat === "provenance" || beat === "bound" || beat === "return"));
  const ghostResidue =
    costP > 0.72 ? "You understood. You cannot yet produce it." : "Your head is empty until you produce it.";

  let cue = CUES[beat];
  if (beat === "attempt" && choice) cue = "Choice committed · keep scrolling";
  if (beat === "provenance") {
    cue = CUES.provenance;
  }
  if (beat === "return") {
    cue = dayLabel === "+5d" ? "Naked transfer ask" : CUES.return;
  }

  const principle = PRINCIPLES[beat];

  const provLeftMeta = ec
    ? ec.sample
      ? "Sample Trace on the right — click left to overwrite with your ink."
      : "Ink committed. Ledger shows conditions."
    : "Commit on the left — or keep scrolling for a Sample Trace.";

  const contract = ec ? CHOICES[ec.key].contract : EMPTY_CONTRACT;
  const horizon = ec ? CHOICES[ec.key].horizon : EMPTY_HORIZON;

  const onChoose = (key: ChoiceKey) => {
    setChoice(key);
    setSampleTrace(false);
  };

  return (
    <section data-sc-act="flow" id="method" className="relative scroll-mt-24">
      <div className="method-intro mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-10 sm:px-8 lg:flex-row lg:items-start lg:gap-20">
        <SectionHeading
          sans={method.titleSans}
          serif={method.titleSerif}
          align="left"
          className="lg:w-[28rem] lg:shrink-0"
        />
        <p className="max-w-xl text-[0.95rem] leading-relaxed text-pretty text-tx-2 lg:pt-9">
          {method.body}
        </p>
      </div>

      <div className="encounter-track" ref={trackRef} data-encounter="cold-ledger">
        <div
          className="encounter-shell"
          ref={shellRef}
          data-beat={beat}
          style={
            {
              ["--enc-cost-p" as string]: String(costP),
              ["--enc-return-p" as string]: String(returnP),
            } as CSSProperties
          }
        >
          <p className="encounter-principle content-wrap" key={beat} aria-live="polite">
            <span>{principle.left}</span>
            <span className="text-accent" aria-label="is not">
              ≠
            </span>
            <span>{principle.right}</span>
          </p>

          <div id="moves" className="encounter-stage scroll-mt-24">
            {/* LEFT: The Encounter */}
            <div className="encounter-left">
              <p className="encounter-plane">
                <strong>The Encounter</strong>
                <span className="encounter-walk-badge">{encounterFrame.walkthrough}</span>
              </p>
              <p className="encounter-cue">{cue}</p>
              <div className="encounter-panel">
                <div className={`encounter-beat${beat === "target" ? " is-on" : ""}`} inert={beat !== "target" ? true : undefined}>
                  <p className="encounter-label">Learning target · Sampling</p>
                  <p className="encounter-target">Why doesn’t a larger sample fix a biased one?</p>
                  <p className="encounter-meta">One attempt. Wrong is useful. Help comes after you choose.</p>
                </div>

                <div className={`encounter-beat${beat === "cost" ? " is-on" : ""}`} inert={beat !== "cost" ? true : undefined}>
                  <p className="encounter-label">Cost of fluent help</p>
                  <p className="encounter-target encounter-target--sm">Correct assistance can steal the retrieval.</p>
                  <p className="encounter-meta">Reading feels like understanding. You generated none of it.</p>
                </div>

                <div className={`encounter-beat${beat === "attempt" ? " is-on" : ""}`} inert={beat !== "attempt" ? true : undefined}>
                  <p className="encounter-label">Your attempt</p>
                  <p className="encounter-target encounter-target--sm">Which sentence would you give a colleague?</p>
                  <p className="encounter-scaffold-cap">{encounterFrame.scaffoldCap}</p>
                  <div className="encounter-choices" role="group" aria-label="Choose one attempt">
                    {(
                      [
                        ["a", CHOICES.a.text],
                        ["b", CHOICES.b.text],
                        ["c", CHOICES.c.text],
                      ] as const
                    ).map(([key, text]) => (
                      <button
                        key={key}
                        type="button"
                        data-choice={key}
                        aria-pressed={choice === key}
                        onClick={() => onChoose(key)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`encounter-beat${beat === "provenance" ? " is-on" : ""}`} inert={beat !== "provenance" ? true : undefined}>
                  <p className="encounter-label">Provenance</p>
                  <p className="encounter-target encounter-target--sm">Your ink. Their glow. Locked conditions.</p>
                  <p className="encounter-meta">{provLeftMeta}</p>
                </div>

                <div className={`encounter-beat${beat === "bound" ? " is-on" : ""}`} inert={beat !== "bound" ? true : undefined}>
                  <p className="encounter-label">Evidence contract</p>
                  <p className="encounter-target encounter-target--sm">What this observation can and cannot support.</p>
                  <p className="encounter-meta">Target · Observed · Bounded inference · Non-inferences. No mastery score.</p>
                </div>

                <div className={`encounter-beat${beat === "return" ? " is-on" : ""}`} inert={beat !== "return" ? true : undefined}>
                  <p className="encounter-label">Durable learning for hard material</p>
                  <p className="encounter-target encounter-target--sm">
                    Don&apos;t find out on the exam that you only had recognition.
                  </p>
                  <p className="encounter-meta">
                    Bring your syllabus, certifications, or technical texts. Socratink makes you do the thinking and keeps
                    the evidence.
                  </p>
                  <a className="btn-accent encounter-cta" href={encounterFrame.cta.href}>
                    {encounterFrame.cta.label}
                  </a>
                  <p className="encounter-cta-sub">{encounterFrame.ctaSub}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Evidence Ledger */}
            <aside className="encounter-ledger" aria-label="Evidence ledger">
              <div className="encounter-ledger__head">
                <div className="encounter-ledger__titles">
                  <p className="encounter-label">The Evidence Ledger</p>
                  <p className="encounter-ledger__quiet">what you showed · what it can support</p>
                </div>
                <span className="encounter-ledger__beat">{BEAT_NAMES[beat]}</span>
              </div>
              <div className="encounter-ledger__body">
                <span
                  className={`encounter-sample${showSample ? " show" : ""}`}
                  aria-live="polite"
                >
                  Demonstrating Option B · Click to test yourself
                </span>

                {/* Target slip */}
                <div className={`ledger-layer${beat === "target" ? " is-on" : ""}`} inert={beat !== "target" ? true : undefined}>
                  <article className="ledger-slip">
                    <h2 className="ledger-slip__title">Why doesn’t a larger sample fix a biased one?</h2>
                    <div className="ledger-slip__meta">
                      <span>Target</span>
                      <span>Sampling</span>
                      <span>Reconstruction ask</span>
                    </div>
                    <div className="ledger-block">
                      <div className="ledger-k">Object</div>
                      <p className="ledger-v">One question. Evidence begins when you attempt.</p>
                    </div>
                    <p className="ledger-contrast">
                      <strong>Recognition ≠ recall.</strong> Evidence begins when you attempt.
                    </p>
                  </article>
                </div>

                {/* Fluency Ghost */}
                <div className={`ledger-layer${beat === "cost" ? " is-on" : ""}`} inert={beat !== "cost" ? true : undefined}>
                  <article className="ledger-slip">
                    <p className="ghost-meta">Assisted explanation · correct</p>
                    <div className="ghost-stage">
                      <span className="ghost-stamp" aria-hidden="true">
                        AI FLUENCY ≠ YOUR MEMORY
                      </span>
                      <p className="ghost-text">
                        Bias is a property of the sampling process, not of sample size. Drawing more observations from the
                        same skewed process reproduces the skew with tighter variance — it does not cancel the systematic
                        error.
                      </p>
                      <p className="ghost-critique">Reading feels like understanding. You generated none of it.</p>
                      <div className="ghost-ruled">
                        <p>{ghostResidue}</p>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Attempt */}
                <div className={`ledger-layer${beat === "attempt" ? " is-on" : ""}`} inert={beat !== "attempt" ? true : undefined}>
                  <article className="ledger-slip">
                    {!ec ? (
                      <>
                        <h2 className="ledger-slip__title">Docket</h2>
                        <div className="ledger-slip__meta">
                          <span>Awaiting attempt</span>
                          <span>3-choice recognition</span>
                        </div>
                        <div className="ledger-block">
                          <div className="ledger-k">Status</div>
                          <p className="ledger-v">Empty — your sentence has not been written yet.</p>
                        </div>
                        <div className="ledger-block">
                          <div className="ledger-k">Conditions</div>
                          <p className="ledger-v">3-choice recognition · distractors present · answer key withheld</p>
                        </div>
                        <p className="ledger-contrast">
                          <strong>Choose on the left, or keep scrolling.</strong> Scroll never locks.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="ledger-slip__title">Attempt</h2>
                        <div className="ledger-slip__meta">
                          <span>{ec.sample ? "Sample Trace" : "Committed"}</span>
                          <span>Three options</span>
                        </div>
                        <div className="ink-block">
                          <p className="ink-tag">[YOU · UNASSISTED]</p>
                          <p className="ink-sentence">{CHOICES[ec.key].text}</p>
                        </div>
                        <div className="glow-block">
                          <p className="glow-tag">[AGENT · ANSWER KEY WITHHELD]</p>
                          <p className="glow-body">
                            Multiple-choice scaffold active. Correct option not revealed as feedback.
                          </p>
                        </div>
                        {ec.sample ? (
                          <p className="ledger-reality">Sample Trace — demonstration, not your evidence.</p>
                        ) : (
                          <p className="ledger-contrast">
                            <strong>Ink recorded.</strong> Scroll for provenance lock.
                          </p>
                        )}
                      </>
                    )}
                  </article>
                </div>

                {/* Provenance */}
                <div
                  className={`ledger-layer${beat === "provenance" ? " is-on" : ""}`}
                  inert={beat !== "provenance" ? true : undefined}
                >
                  <article className="ledger-slip">
                    {!ec ? (
                      <>
                        <h2 className="ledger-slip__title">Provenance</h2>
                        <div className="ledger-slip__meta">
                          <span>Waiting</span>
                        </div>
                        <p className="ink-sentence ink-sentence--empty">
                          No ink yet — choose left, or scroll for Sample Trace.
                        </p>
                      </>
                    ) : (
                      <div className="prov-stack">
                        <div className="ink-block">
                          <p className="ink-tag">[YOU · UNASSISTED]</p>
                          <p className="ink-sentence">{CHOICES[ec.key].text}</p>
                        </div>
                        <div className="glow-block">
                          <p className="glow-tag">[AGENT · ANSWER KEY WITHHELD]</p>
                          <p className="glow-body">{CHOICES[ec.key].glow}</p>
                        </div>
                        <div className="lock-row">
                          <span className="lock-pill">PROVENANCE LOCKED</span>
                          <span className="lock-pill">ZERO POLLUTION</span>
                        </div>
                        <p className="ledger-reality">
                          {CHOICES[ec.key].reality}
                          {ec.sample ? " · Sample Trace — not visitor evidence." : ""}
                        </p>
                      </div>
                    )}
                  </article>
                </div>

                {/* Evidence Contract */}
                <div className={`ledger-layer${beat === "bound" ? " is-on" : ""}`} inert={beat !== "bound" ? true : undefined}>
                  <article className="ledger-slip">
                    <p className="contract-meta">
                      EVIDENCE CONTRACT · RECONSTRUCTION PROTOCOL
                      {ec && ec.sample ? " · SAMPLE TRACE" : ""}
                    </p>
                    <h2 className="contract-title">Bound inference</h2>
                    <div className="ledger-block">
                      <div className="ledger-k">Target</div>
                      <p className="ledger-v">{contract.target}</p>
                    </div>
                    <div className="ledger-block">
                      <div className="ledger-k">Observed</div>
                      <p className="ledger-v">{contract.observed}</p>
                    </div>
                    <div className="ledger-block">
                      <div className="ledger-k">Bounded inference</div>
                      <p className="ledger-v">{contract.inference}</p>
                    </div>
                    <div className="non-inf">
                      <div className="non-inf__k">Non-inferences</div>
                      <ul>
                        {contract.nonInferences.map((n) => (
                          <li key={n}>
                            <span className="non-inf__x" aria-hidden="true">
                              ✕
                            </span>{" "}
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="horizon-compact">
                      <p className="horizon-meta">Capability horizon · boolean only</p>
                      <div className="horizon-matrix">
                        {horizon.map((r) => (
                          <div className="hz-row" key={r.label}>
                            <span className={`hz-mark ${r.mark === "●" ? "filled" : "hollow"}`}>{r.mark}</span>
                            <span className="hz-label">{r.label}</span>
                            <span className={`hz-state ${r.kind}`}>{r.state}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </div>

                {/* Time-lapse */}
                <div className={`ledger-layer${beat === "return" ? " is-on" : ""}`} inert={beat !== "return" ? true : undefined}>
                  <article className="ledger-slip">
                    <div className="tl-head">
                      <h2 className="ledger-slip__title">Scaffold strip</h2>
                      <span className="tl-day">{dayLabel}</span>
                    </div>
                    <div className="tl-track" aria-hidden="true">
                      <div className="tl-fill" />
                    </div>
                    <div className="tl-scaffold">
                      <div className="tl-opt">A · A larger sample averages bias away.</div>
                      <div className="tl-opt">B · Bias is about how you sample, not how many.</div>
                      <div className="tl-opt">C · I don’t know yet.</div>
                    </div>
                    <p className="tl-naked">
                      A medical study polls 25,000 opt-in mobile app users to estimate national diabetes rates. Identify the
                      structural error — without multiple choice.
                    </p>
                    <div className="tl-note">
                      <p>This page cannot schedule your +5 day verification.</p>
                      <p className="tl-promise">
                        The Socratink Learner Agent can — it remembers what you actually produced, and returns when the
                        scaffolding is gone.
                      </p>
                      <p className="tl-demo">This demo stores nothing.</p>
                    </div>
                  </article>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {BEATS.map((b) => (
          <div
            key={b}
            data-encounter-phase={b}
            className={`encounter-phase${b === "cost" ? " encounter-phase--cost" : ""}${b === "return" ? " encounter-phase--return" : ""}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  );
}
