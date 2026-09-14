"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { orbit, orbitDisciplines, type OrbitDisciplineId } from "@/archive/landing/content";
import styles from "./orbit.module.css";

const INNER_IDS = new Set<OrbitDisciplineId>(["stats", "boards", "biochem", "law", "analysis"]);
const innerDisciplines = orbitDisciplines.filter((d) => INNER_IDS.has(d.id));
const outerDisciplines = orbitDisciplines.filter((d) => !INNER_IDS.has(d.id));

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function Orbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const [arrival, setArrival] = useState(0);
  const [selectedId, setSelectedId] = useState<OrbitDisciplineId>("stats");

  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (isReducedMotion) return;

    let target = 0;
    let current = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.001) {
        current = target;
        isRunning = false;
      }
      setArrival(current);
      if (isRunning) rafId = window.requestAnimationFrame(tick);
    };

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp01((vh - rect.top) / (vh * 0.75));
      if (!isRunning) {
        isRunning = true;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion]);

  const q = !mounted || isReducedMotion ? 1 : arrival;
  const activeDiscipline =
    orbitDisciplines.find((d) => d.id === selectedId) ?? orbitDisciplines[0];
  const isCarriedThread = activeDiscipline.id === "stats";

  return (
    <section
      id="material"
      ref={sectionRef}
      aria-labelledby="material-title"
      className={styles.section}
    >
      <div className={`content-wrap ${styles.composition}`}>
        <div className={styles.introduction}>
          <span className={styles.kicker}>Your material</span>
          <h2 id="material-title">
            <span className={styles.duetSans}>Put your subject</span>
            <span className={styles.duetSerif}>to the test.</span>
          </h2>
          <p className={styles.lede}>
            A curated set across demanding fields, revolving around your thinking.
            The page turns, the specimens arrive — or bring your own syllabus.
          </p>
          <p className={styles.sublede}>{orbit.ownMaterial}</p>
        </div>

        <div className={styles.celestialStage} style={{ opacity: 0.2 + 0.8 * q }}>
          {/* Background Orbital Rings & Revolving Constellation */}
          <div className={styles.orbitSystem}>
            <svg className={styles.celestialRings} viewBox="0 0 720 640" aria-hidden="true">
              <circle cx="360" cy="320" r="215" className={styles.ringInner} />
              <circle cx="360" cy="320" r="305" className={styles.ringOuter} />
            </svg>

            {/* Inner Ring Constellation (5 disciplines · 64s revolution) */}
            {innerDisciplines.map((d, i) => {
              const angle = (i * 360) / innerDisciplines.length;
              const isSelected = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  aria-pressed={isSelected}
                  className={`${styles.celestialPill} ${styles.pillInner}`}
                  data-selected={isSelected ? "true" : undefined}
                  style={
                    {
                      "--angle": `${angle}deg`,
                      "--radius": "215px",
                      "--duration": "64s",
                    } as CSSProperties
                  }
                >
                  {d.label}
                  {d.id === "stats" && <span className={styles.threadDot} aria-hidden="true"> ●</span>}
                </button>
              );
            })}

            {/* Outer Ring Constellation (5 disciplines · 96s revolution) */}
            {outerDisciplines.map((d, i) => {
              const angle = (i * 360) / outerDisciplines.length + 36;
              const isSelected = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  aria-pressed={isSelected}
                  className={`${styles.celestialPill} ${styles.pillOuter}`}
                  data-selected={isSelected ? "true" : undefined}
                  style={
                    {
                      "--angle": `${angle}deg`,
                      "--radius": "305px",
                      "--duration": "96s",
                    } as CSSProperties
                  }
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          {/* Foreground Gravitational Anchor: The Archival Folio */}
          <div
            className={styles.centralFolio}
            style={{
              transform: `translateY(calc(12px * (1 - ${q})))`,
            }}
          >
            {/* Palimpsest peek layer */}
            <button
              type="button"
              onClick={() => setSelectedId(isCarriedThread ? "boards" : "stats")}
              className={styles.palimpsestTab}
              aria-label={`Switch to ${isCarriedThread ? "Board exams" : "Statistics"}`}
            >
              <span className={styles.palimpsestTag}>
                {isCarriedThread ? "Board exams" : "Statistics · carried thread"}
              </span>
              <span className={styles.palimpsestHook}>
                {isCarriedThread
                  ? "Bayesian PPV in Low-Prevalence Screening"
                  : "Sampling Bias Invariance under Sample Size"}
              </span>
            </button>

            {/* Primary Folio Sheet: Populated by active discipline */}
            <article
              key={activeDiscipline.id}
              className={styles.dossierCard}
              aria-label={`${activeDiscipline.label} specimen`}
            >
              <header className={styles.dossierHeader}>
                <div className={styles.tagGroup}>
                  <span className={styles.disciplineTagActive}>
                    {activeDiscipline.label}
                  </span>
                  {isCarriedThread && (
                    <span className={styles.carriedBadge}>
                      <span className={styles.beadDot} aria-hidden="true">●</span> carried thread
                    </span>
                  )}
                </div>
                <span className={styles.dossierHookActive}>
                  {activeDiscipline.question}
                </span>
              </header>

              <div className={styles.dossierBody}>
                <h3 className={styles.dossierTitleHero}>
                  {activeDiscipline.target}
                </h3>
                <blockquote className={styles.promptHero}>
                  “{activeDiscipline.transferAsk}”
                </blockquote>
                <p className={styles.dossierFootnote}>
                  Illustration specimen. Revolving disciplines shown; click any subject to test.
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
