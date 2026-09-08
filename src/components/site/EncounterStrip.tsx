"use client";

import "./encounter-strip.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { contractSlip } from "@/lib/content";

type Beat = "cold" | "ghost" | "ink" | "bound" | "exit";
type InkKind = "typed" | "sample" | "refuse";

type InkState = {
  text: string;
  kind: InkKind;
};

const BEATS: Beat[] = ["cold", "ghost", "ink", "bound", "exit"];

function ghostCharStyle(
  index: number,
  total: number,
  progress: number,
  reduced: boolean,
): CSSProperties {
  const voided = progress >= 0.88;
  if (voided) {
    return { opacity: 0, visibility: "hidden" };
  }
  const t = index / Math.max(1, total);
  const local = Math.min(1, Math.max(0, (progress - t * 0.38) / 0.48));
  if (reduced) {
    return { opacity: 1 - progress };
  }
  const scatter = local * local;
  return {
    opacity: 1 - scatter,
    transform: `translate(${(index % 5 - 2) * scatter * 12}px, ${scatter * 26}px) rotate(${scatter * (index % 2 ? 16 : -16)}deg)`,
    filter: `blur(${scatter * 7}px)`,
  };
}

/**
 * Contract-slip spine: one question, one ruled slip, five beats.
 * Cold → Ghost Cost (no stamp) → Ink → Bound climax → Exit CTA.
 */
export function EncounterStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const inkInputRef = useRef<HTMLInputElement>(null);
  const boundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const belowBoundRef = useRef(true);
  const beatRef = useRef<Beat>("cold");
  const boundPlayedRef = useRef(false);

  const [beat, setBeat] = useState<Beat>("cold");
  const [ghostProgress, setGhostProgress] = useState(0);
  const [ink, setInk] = useState<InkState | null>(null);
  const [inkDraft, setInkDraft] = useState("");
  const [inkLocked, setInkLocked] = useState(false);
  const [showSampleBadge, setShowSampleBadge] = useState(false);
  const [boundPlayed, setBoundPlayed] = useState(false);
  const [landedClaims, setLandedClaims] = useState(0);
  const [claimsDismissed, setClaimsDismissed] = useState(false);
  const [showNonInferences, setShowNonInferences] = useState(false);
  const [revealedNonInferences, setRevealedNonInferences] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [pinned, setPinned] = useState(false);

  const ghostChars = useMemo(
    () => Array.from(contractSlip.ghostText),
    [],
  );

  const cancelBoundSchedule = useCallback(() => {
    if (boundTimerRef.current) {
      clearTimeout(boundTimerRef.current);
      boundTimerRef.current = null;
    }
  }, []);

  const resetBound = useCallback(() => {
    cancelBoundSchedule();
    boundPlayedRef.current = false;
    setBoundPlayed(false);
    setLandedClaims(0);
    setClaimsDismissed(false);
    setShowNonInferences(false);
    setRevealedNonInferences(0);
  }, [cancelBoundSchedule]);

  const playBoundRefusal = useCallback(() => {
    if (boundPlayedRef.current) return;
    boundPlayedRef.current = true;
    setBoundPlayed(true);
    cancelBoundSchedule();
    setLandedClaims(0);
    setClaimsDismissed(false);
    setShowNonInferences(false);
    setRevealedNonInferences(0);

    const claimCount = contractSlip.claims.length;
    const landStagger = reduced ? 80 : 420;
    const landLead = reduced ? 0 : 220;
    const overlapHold = reduced ? 80 : 250;
    const nonInfStagger = reduced ? 50 : 160;

    contractSlip.claims.forEach((_, i) => {
      const landDelay = landLead + i * landStagger;
      window.setTimeout(() => {
        setLandedClaims((n) => Math.max(n, i + 1));
      }, landDelay);
    });

    const lastLand = landLead + (claimCount - 1) * landStagger;

    window.setTimeout(() => {
      setShowNonInferences(true);
      contractSlip.nonInferences.forEach((_, i) => {
        window.setTimeout(() => {
          setRevealedNonInferences((n) => Math.max(n, i + 1));
        }, i * nonInfStagger);
      });
    }, lastLand);

    window.setTimeout(() => {
      setClaimsDismissed(true);
    }, lastLand + overlapHold);
  }, [cancelBoundSchedule, reduced]);

  const scheduleBoundRefusal = useCallback(() => {
    if (boundPlayedRef.current || boundTimerRef.current) return;
    boundTimerRef.current = setTimeout(() => {
      boundTimerRef.current = null;
      playBoundRefusal();
    }, reduced ? 60 : 120);
  }, [playBoundRefusal, reduced]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => cancelBoundSchedule();
  }, [cancelBoundSchedule]);

  useEffect(() => {
    const track = trackRef.current;
    const shell = shellRef.current;
    if (!track || !shell) return;

    let maxGhost = 0;
    let costLocked = false;

    const applyProgress = (p: number) => {
      const setBeatAndMaybeBound = (nextBeat: Beat) => {
        const prevBeat = beatRef.current;
        if (nextBeat !== prevBeat) {
          if (nextBeat === "bound") {
            scheduleBoundRefusal();
          } else if (nextBeat === "exit" && !boundPlayedRef.current) {
            playBoundRefusal();
          }
          beatRef.current = nextBeat;
        }
        setBeat(nextBeat);
      };

      if (p < 0.08) {
        maxGhost = 0;
        costLocked = false;
        belowBoundRef.current = true;
        setPinned(false);
        beatRef.current = "cold";
        setBeat("cold");
        setGhostProgress(0);
        setInk(null);
        setInkDraft("");
        setInkLocked(false);
        setShowSampleBadge(false);
        resetBound();
        return;
      }

      const nav = 56;
      const shellTop = shell.getBoundingClientRect().top;
      setPinned(shellTop <= nav + 1);

      if (p < 0.58) {
        if (!belowBoundRef.current) {
          resetBound();
        }
        belowBoundRef.current = true;
      } else {
        belowBoundRef.current = false;
      }

      if (p < 0.34) {
        setBeatAndMaybeBound("ghost");
        let g = (p - 0.08) / (0.34 - 0.08);
        maxGhost = Math.max(maxGhost, g);
        if (costLocked) g = maxGhost;
        if (g > 0.15) costLocked = true;
        setGhostProgress(g);
      } else if (p < 0.58) {
        setBeatAndMaybeBound("ink");
        setGhostProgress(1);
      } else if (p < 0.82) {
        setBeatAndMaybeBound("bound");
        setGhostProgress(1);
      } else {
        setBeatAndMaybeBound("exit");
        setGhostProgress(1);
      }
    };

    const pick = () => {
      const nav = 56;
      const shellTop = shell.getBoundingClientRect().top;
      if (shellTop > nav + 1) {
        applyProgress(0);
        return;
      }

      const trackTop = track.getBoundingClientRect().top;
      const travel = Math.max(1, track.offsetHeight - shell.offsetHeight);
      const p = Math.min(1, Math.max(0, (nav - trackTop) / travel));
      applyProgress(p);
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
  }, [resetBound, scheduleBoundRefusal, playBoundRefusal]);

  const effectiveInk: InkState | null =
    ink ??
    (beat === "bound" || beat === "exit"
      ? { text: contractSlip.sampleText, kind: "sample" }
      : null);

  const badgeVisible =
    showSampleBadge || effectiveInk?.kind === "sample";

  const ghostHint =
    ghostProgress >= 0.88
      ? contractSlip.hints.ghostGone
      : ghostProgress > 0.35
        ? contractSlip.hints.ghostLeaving
        : contractSlip.hints.ghostArrive;

  const inkHint = (() => {
    if (!ink) return contractSlip.hints.inkDefault;
    switch (ink.kind) {
      case "sample":
        return contractSlip.hints.inkSampleScroll;
      case "refuse":
        return contractSlip.hints.inkRefuse;
      case "typed":
        return contractSlip.hints.inkRecorded;
      default: {
        const _exhaustive: never = ink.kind;
        return _exhaustive;
      }
    }
  })();

  const contractInkText =
    effectiveInk?.kind === "refuse"
      ? contractSlip.refuseText
      : effectiveInk?.text ?? contractSlip.hints.boundNoInk;

  const contractCond = (() => {
    if (!effectiveInk) return "";
    switch (effectiveInk.kind) {
      case "sample":
        return "";
      case "refuse":
        return "Visitor refused · productive absence";
      case "typed":
        return "Visitor ink · unassisted on this slip · no answer key";
      default: {
        const _exhaustive: never = effectiveInk.kind;
        return _exhaustive;
      }
    }
  })();

  const onCommitInk = () => {
    const t = inkDraft.trim();
    if (!t) {
      inkInputRef.current?.focus();
      return;
    }
    setInk({ text: t, kind: "typed" });
    setInkLocked(true);
    setShowSampleBadge(false);
  };

  const onSample = () => {
    setInk({ text: contractSlip.sampleText, kind: "sample" });
    setInkDraft(contractSlip.sampleText);
    setInkLocked(true);
    setShowSampleBadge(true);
  };

  const onRefuse = () => {
    setInk({ text: contractSlip.refuseText, kind: "refuse" });
    setInkDraft("");
    setInkLocked(true);
    setShowSampleBadge(false);
  };

  const ghostVoidOpacity =
    ghostProgress > 0.5 ? Math.min(1, (ghostProgress - 0.5) / 0.35) : 0;

  return (
    <section data-sc-act="flow" id="method" className="relative scroll-mt-24">
      <div className="encounter-lead" aria-hidden="true" />
      <div className="encounter-track" ref={trackRef} data-encounter="contract-slip">
        <div
          className={`encounter-shell${pinned ? " is-pinned" : ""}`}
          ref={shellRef}
          data-beat={beat}
        >
          <div className="encounter-rail-stage">
            <p className="encounter-rail-label">{contractSlip.railLabel}</p>
            <article className="encounter-slip" id="slip">
              <p className="encounter-q">{contractSlip.question}</p>
              <span
                className={`encounter-badge${badgeVisible ? " show" : ""}`}
                id="demoBadge"
              >
                {contractSlip.sampleTraceBadge}
              </span>

              <div className="encounter-stage">
                <section
                  className={`encounter-panel${beat === "cold" ? " is-live" : ""}`}
                  data-panel="cold"
                  id="panelCold"
                  inert={beat !== "cold" ? true : undefined}
                >
                  <p className="encounter-hint">{contractSlip.hints.cold}</p>
                  <div className="encounter-ruled" aria-hidden="true" />
                  <p className="encounter-hint">{contractSlip.hints.coldScroll}</p>
                </section>

                <section
                  className={`encounter-panel${beat === "ghost" ? " is-live" : ""}`}
                  data-panel="ghost"
                  id="panelGhost"
                  inert={beat !== "ghost" ? true : undefined}
                >
                  <div className="encounter-ghost-block">
                    <p className="encounter-ghost-copy" id="ghostCopy">
                      {ghostChars.map((ch, i) => (
                        <span
                          key={`${i}-${ch}`}
                          className="encounter-ghost-char"
                          style={ghostCharStyle(i, ghostChars.length, ghostProgress, reduced)}
                        >
                          {ch === " " ? "\u00a0" : ch}
                        </span>
                      ))}
                    </p>
                    <div
                      className="encounter-ghost-void"
                      id="ghostVoid"
                      aria-hidden="true"
                      style={{ opacity: ghostVoidOpacity }}
                    />
                  </div>
                  <p className="encounter-hint" id="ghostHint">
                    {ghostHint}
                  </p>
                </section>

                <section
                  className={`encounter-panel${beat === "ink" ? " is-live" : ""}`}
                  data-panel="ink"
                  id="panelInk"
                  inert={beat !== "ink" ? true : undefined}
                >
                  <p className="encounter-hint">{contractSlip.hints.ink}</p>
                  <div className="encounter-paper-ink">
                    <input
                      ref={inkInputRef}
                      id="inkInput"
                      maxLength={160}
                      placeholder={contractSlip.inkPlaceholder}
                      autoComplete="off"
                      readOnly={inkLocked}
                      value={inkDraft}
                      onChange={(e) => setInkDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onCommitInk();
                      }}
                    />
                  </div>
                  <div className="encounter-ink-row">
                    <button
                      type="button"
                      className={`encounter-ink-btn primary${ink?.kind === "typed" || ink?.kind === "sample" ? " is-press" : ""}`}
                      id="commitBtn"
                      onClick={onCommitInk}
                    >
                      {contractSlip.commitLabel}
                    </button>
                    <button
                      type="button"
                      className="encounter-ink-btn"
                      id="sampleBtn"
                      onClick={onSample}
                    >
                      {contractSlip.sampleLabel}
                    </button>
                    <button
                      type="button"
                      className="encounter-ink-btn"
                      id="refuseBtn"
                      onClick={onRefuse}
                    >
                      {contractSlip.refuseLabel}
                    </button>
                  </div>
                  <p className="encounter-hint" id="inkHint">
                    {inkHint}
                  </p>
                </section>

                <section
                  className={`encounter-panel encounter-panel--contract${beat === "bound" ? " is-live" : ""}`}
                  data-panel="contract"
                  id="panelContract"
                  inert={beat !== "bound" ? true : undefined}
                >
                  {effectiveInk?.kind !== "sample" ? (
                    <p className="encounter-hint">{contractSlip.hints.bound}</p>
                  ) : null}
                  <p
                    className={`encounter-ink-line${!effectiveInk ? " empty" : ""}`}
                    id="contractInk"
                    data-ink-kind={effectiveInk?.kind}
                  >
                    {contractInkText}
                  </p>
                  {contractCond ? (
                    <p className="encounter-cond" id="contractCond">
                      {contractCond}
                    </p>
                  ) : null}
                  <div
                    className={`encounter-claim-layer${boundPlayed ? " is-hot" : ""}${claimsDismissed ? " is-dismissed" : ""}`}
                    id="claimLayer"
                    aria-live="polite"
                  >
                    {contractSlip.claims.map((claim, i) => {
                      const landed = i < landedClaims;
                      return (
                        <div
                          key={claim}
                          className={`encounter-claim-stamp${landed ? " is-landed" : ""}`}
                        >
                          <span className="encounter-claim-text">{claim}</span>
                        </div>
                      );
                    })}
                  </div>
                  <ul
                    className={`encounter-noninf${showNonInferences ? " is-live" : ""}`}
                    id="nonInferenceList"
                    aria-label="Non-inferences"
                    hidden={!showNonInferences}
                  >
                    {showNonInferences
                      ? contractSlip.nonInferences.map((text, i) => (
                          <li
                            key={text}
                            data-non-inference="1"
                            className={i < revealedNonInferences ? "is-revealed" : ""}
                          >
                            <span className="encounter-noninf-x" aria-hidden="true">
                              ✕
                            </span>
                            {text}
                          </li>
                        ))
                      : null}
                  </ul>
                </section>

                <section
                  className={`encounter-panel${beat === "exit" ? " is-live" : ""}`}
                  data-panel="exit"
                  id="panelExit"
                  inert={beat !== "exit" ? true : undefined}
                >
                  <p className="encounter-hint">{contractSlip.hints.exit}</p>
                  <a className="btn-accent encounter-cta" href={contractSlip.cta.href}>
                    {contractSlip.cta.label}
                  </a>
                  <p className="encounter-cta-sub">{contractSlip.ctaSub}</p>
                  {beat === "exit" ? (
                    <p className="encounter-walkthrough-note encounter-demo-note">
                      {contractSlip.hints.exitWalkthrough}
                    </p>
                  ) : null}
                </section>
              </div>
            </article>
          </div>
        </div>

        {BEATS.map((b) => (
          <div
            key={b}
            data-encounter-phase={b}
            className={`encounter-phase${b === "ghost" ? " encounter-phase--ghost" : ""}${b === "exit" ? " encounter-phase--exit" : ""}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  );
}
