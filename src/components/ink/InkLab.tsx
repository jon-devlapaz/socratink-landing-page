"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { InkSphere } from "./InkSphere";
import { INK_ARCHETYPES, type InkArchetype } from "@/lib/ink/random";
import { INK_EXPRESSIONS, type InkExpression } from "@/lib/ink/expressions";
import { INK_PRESETS } from "@/lib/ink/scene";
import {
  SOMATIC_METADATA,
  type SomaticState,
  type SomaticTelemetry,
} from "@/lib/ink/somatic";
import { SCULPT_CATALOG } from "@/lib/ink/sculpt";
import { inkToolDefinitions, type InkTool } from "@/lib/ink/tool";
import { toggleTheme } from "@/lib/theme";

const SOMATIC_STATES: { id: SomaticState; icon: string; title: string; hint: string }[] = [
  { id: "settled", icon: "🌱", title: "Settled", hint: "Rest & equilibrium" },
  { id: "listening", icon: "👂", title: "Listening", hint: "Receptive attention" },
  { id: "thinking", icon: "🧠", title: "Thinking", hint: "Deliberation & bifurcation" },
  { id: "explaining", icon: "💡", title: "Explaining", hint: "Insight articulation" },
];

export function InkLab() {
  const [tool, setTool] = useState<InkTool | null>(null);
  const [json, setJson] = useState(() =>
    JSON.stringify(INK_PRESETS.ink, null, 2),
  );
  const [message, setMessage] = useState("Initializing neural motor cortex…");
  const [sceneName, setSceneName] = useState(INK_PRESETS.ink.name);
  const [paused, setPaused] = useState(false);
  const [resolution, setResolution] = useState(0.75);

  // Somatic embodiment state
  const [somaticState, setSomaticState] = useState<SomaticState>("settled");
  const [somaticIntensity, setSomaticIntensity] = useState(0.7);
  const [conserveVolume, setConserveVolume] = useState(true);
  const [cognitionCycle, setCognitionCycle] = useState(false);
  const [telemetry, setTelemetry] = useState<SomaticTelemetry | null>(null);

  // Procedural archetype state
  const [autoMorph, setAutoMorph] = useState(false);
  const [activeArchetype, setActiveArchetype] = useState<InkArchetype | "any">("any");

  // Semantic concept sculpting state
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  const intensityRef = useRef(somaticIntensity);
  const conserveRef = useRef(conserveVolume);

  useEffect(() => {
    intensityRef.current = somaticIntensity;
    conserveRef.current = conserveVolume;
  }, [somaticIntensity, conserveVolume]);

  const triggerSculpt = useCallback(
    (conceptKey: string) => {
      setActiveConcept(conceptKey);
      setCognitionCycle(false);
      setAutoMorph(false);
      tool?.call("ink_sculpt", { concept: conceptKey });
    },
    [tool],
  );

  const triggerSomatic = useCallback(
    (
      state: SomaticState,
      intensity = intensityRef.current,
      conserve = conserveRef.current,
    ) => {
      setSomaticState(state);
      if (!tool) return;
      const result = tool.call("ink_somatic", {
        state,
        intensity,
        conserveVolume: conserve,
      });
      if (result && "somatic" in result && result.somatic) {
        setTelemetry(result.somatic as SomaticTelemetry);
      }
    },
    [tool],
  );

  useEffect(() => {
    if (!tool) return;
    const refresh = () => {
      const result = tool.call("ink_get_scene");
      if (result.ok) {
        setJson(JSON.stringify(result.scene, null, 2));
        setSceneName(result.scene.name);
        setPaused(result.rendering.paused);
        setResolution(result.rendering.resolution);
        setMessage(`${result.scene.name} · rev ${result.revision}`);
      }
    };
    refresh();
    return tool.subscribe(refresh);
  }, [tool]);

  // Autonomous Cognition Cycle: loops through realistic model reasoning flow
  useEffect(() => {
    if (!cognitionCycle || !tool || paused) return;
    const cycle: { state: SomaticState; duration: number }[] = [
      { state: "listening", duration: 3200 },
      { state: "thinking", duration: 4500 },
      { state: "explaining", duration: 5000 },
      { state: "settled", duration: 3800 },
    ];
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      const current = cycle[step];
      triggerSomatic(current.state);
      step = (step + 1) % cycle.length;
      timer = setTimeout(advance, current.duration);
    };

    advance();
    return () => clearTimeout(timer);
  }, [cognitionCycle, tool, paused, triggerSomatic]);

  const randomize = useCallback(
    (archetype?: InkArchetype) => {
      const chosen = archetype ?? (activeArchetype === "any" ? undefined : activeArchetype);
      tool?.call("ink_randomize", chosen ? { archetype: chosen } : {});
    },
    [tool, activeArchetype],
  );

  useEffect(() => {
    if (!autoMorph || !tool || paused) return;
    const interval = setInterval(() => {
      randomize();
    }, 3800);
    return () => clearInterval(interval);
  }, [autoMorph, tool, paused, randomize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "1") {
        e.preventDefault();
        triggerSomatic("settled");
      } else if (e.key === "2") {
        e.preventDefault();
        triggerSomatic("listening");
      } else if (e.key === "3") {
        e.preventDefault();
        triggerSomatic("thinking");
      } else if (e.key === "4") {
        e.preventDefault();
        triggerSomatic("explaining");
      } else if (e.key === " " || e.key === "r" || e.key === "R") {
        e.preventDefault();
        randomize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSomatic, randomize]);

  const expression = Object.values(INK_EXPRESSIONS).find(
    (entry) => entry.scene.name === sceneName,
  );

  const apply = (scene: unknown) => {
    const result = tool?.call("ink_set_scene", { scene });
    if (result && !result.ok) setMessage(result.error);
  };

  return (
    <main className="ink-lab">
      <header>
        <div className="flex items-center gap-3">
          <Link href="/">← Socratink</Link>
          <span style={{ opacity: 0.3 }}>|</span>
          <Link
            href="/ink-lab-v2"
            style={{
              color: "var(--accent)",
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            Studio v2 ✨
          </Link>
        </div>
        <button className="ink-lab-button" onClick={toggleTheme}>
          Switch theme
        </button>
      </header>

      <div className="ink-lab-heading">
        <p>Research Lab · Fluid Differential Geometry & Embodiment</p>
        <h1>Cognitive Embodiment of Living Ink</h1>
        <p>
          Translating model deliberation, uncertainty, and attention into
          real-time mass-conserving 3D fluid geometry.
        </p>
      </div>

      <div className="ink-lab-grid">
        <section className="ink-lab-stage" aria-label="Ink preview">
          <InkSphere onTool={setTool} autoCycle={false} />
          <div className="ink-lab-caption" aria-live="polite">
            <strong>{telemetry?.stateLabel ?? expression?.symbol ?? sceneName}</strong>
            <p>
              {telemetry?.description ??
                expression?.meaning ??
                "Implicit surface-tension raymarcher. Move pointer to interact."}
            </p>
          </div>
        </section>

        <section className="ink-lab-controls" aria-label="Ink controls">
          {/* Somatic Embodiment Section */}
          <div className="ink-somatic-panel">
            <div className="ink-somatic-header">
              <div className="ink-somatic-title">
                <strong>Model Embodiment Modes</strong>
                <span className="ink-tag-badge">Neural Motor Cortex</span>
              </div>
              <label className="ink-lab-toggle-label">
                <input
                  type="checkbox"
                  checked={cognitionCycle}
                  onChange={(e) => {
                    setCognitionCycle(e.target.checked);
                    if (e.target.checked) setAutoMorph(false);
                  }}
                  disabled={!tool}
                />
                <span>⚡ Autonomous Cycle</span>
              </label>
            </div>

            <div className="ink-somatic-grid">
              {SOMATIC_STATES.map((st) => (
                <button
                  key={st.id}
                  className={`ink-somatic-btn ${somaticState === st.id ? "is-active" : ""}`}
                  disabled={!tool}
                  onClick={() => {
                    setCognitionCycle(false);
                    triggerSomatic(st.id);
                  }}
                >
                  <span className="ink-somatic-icon">{st.icon}</span>
                  <span className="ink-somatic-name">{st.title}</span>
                  <span className="ink-somatic-hint">{st.hint}</span>
                </button>
              ))}
            </div>

            {/* Intensity Slider & Volume Toggle */}
            <div className="ink-somatic-adjusters">
              <div className="ink-slider-row">
                <label htmlFor="intensity-slider">
                  Somatic Intensity: <strong>{Math.round(somaticIntensity * 100)}%</strong>
                </label>
                <input
                  id="intensity-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={somaticIntensity}
                  disabled={!tool}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSomaticIntensity(val);
                    triggerSomatic(somaticState, val, conserveVolume);
                  }}
                />
              </div>

              <div className="ink-somatic-switches">
                <label className="ink-lab-toggle-label">
                  <input
                    type="checkbox"
                    checked={conserveVolume}
                    disabled={!tool}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setConserveVolume(val);
                      triggerSomatic(somaticState, somaticIntensity, val);
                    }}
                  />
                  <span>Conserve Fluid Mass (V = const)</span>
                </label>
              </div>

              {somaticState === "thinking" && (
                <div className="ink-thinking-spike-box">
                  <div className="ink-thinking-spike-header">
                    <span className="ink-thinking-spike-title">
                      ⚡ Deliberation: Stokes Liquid Bridge
                    </span>
                    <span className="ink-thinking-spike-badge">Coupled Kinematics</span>
                  </div>
                  <p className="ink-thinking-spike-desc">
                    Opposing capillary tug-of-war on binary lobes with neck thinning and resonant satellite bead.
                  </p>
                  <button
                    className="ink-eureka-btn"
                    disabled={!tool}
                    onClick={() => {
                      setCognitionCycle(false);
                      triggerSomatic("settled");
                    }}
                    title="Resolve deliberation and trigger surface-tension coalescence snap"
                  >
                    <span className="ink-eureka-main">✨ Eureka! Coalesce into Synthesis</span>
                    <span className="ink-eureka-sub">Triggers capillary snap & rebound wave</span>
                  </button>
                </div>
              )}
            </div>

            {/* Differential Geometry & Telemetry HUD */}
            <div className="ink-telemetry-card">
              <div className="ink-telemetry-status">
                <span className="ink-telemetry-dot" />
                <span>{telemetry ? SOMATIC_METADATA[telemetry.state].cognitiveSignal : "Awaiting motor dispatch"}</span>
              </div>
              <div className="ink-telemetry-metrics">
                <div className="ink-metric">
                  <span className="ink-metric-label">Displacement Vol (V)</span>
                  <span className="ink-metric-val">{telemetry?.estimatedVolume ?? "3.25"} u³</span>
                </div>
                <div className="ink-metric">
                  <span className="ink-metric-label">Mass Scale (kV)</span>
                  <span className="ink-metric-val">{telemetry?.conservationFactor ?? "1.00"}×</span>
                </div>
                <div className="ink-metric">
                  <span className="ink-metric-label">Surface Blend (k)</span>
                  <span className="ink-metric-val">{telemetry?.surfaceTension ?? "0.35"}</span>
                </div>
                <div className="ink-metric">
                  <span className="ink-metric-label">Vorticity (ω)</span>
                  <span className="ink-metric-val">{telemetry?.deliberationVorticity ?? "0.7"} rad/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semantic Concept Sculpting (Experimental) */}
          <div className="ink-sculpt-group">
            <div className="ink-sculpt-header">
              <div className="ink-sculpt-title">
                <strong>Semantic Concept Sculpting</strong>
                <span className="ink-tag-badge ink-badge-sculpt">
                  Endpoint Stroke DSL
                </span>
              </div>
            </div>
            <p className="paper-label" style={{ margin: 0, fontSize: "0.78rem" }}>
              Model prompts transformed into connected 3D fluid strokes and melted via smooth surface tension.
            </p>
            <div className="ink-sculpt-actions">
              {Object.entries(SCULPT_CATALOG).map(([key, item]) => (
                <button
                  key={key}
                  className={`ink-lab-button ${activeConcept === key ? "is-active ink-sculpt-btn-active" : ""}`}
                  disabled={!tool}
                  aria-pressed={activeConcept === key}
                  onClick={() => triggerSculpt(key)}
                  title={item.description}
                >
                  <span>{item.icon} {item.label}</span>
                </button>
              ))}
            </div>
            {activeConcept && SCULPT_CATALOG[activeConcept] && (
              <div className="ink-sculpt-info">
                <span>{SCULPT_CATALOG[activeConcept].description}</span>
                <span className="ink-sculpt-parts-tag">
                  {(SCULPT_CATALOG[activeConcept].definition.strokes?.length ?? 0) +
                    (SCULPT_CATALOG[activeConcept].definition.beads?.length ?? 0)}{" "}
                  fluid parts · blend {SCULPT_CATALOG[activeConcept].definition.blend}
                </span>
              </div>
            )}
          </div>

          {/* Fluid Archetypes Section */}
          <div className="ink-lab-random-group">
            <div className="ink-lab-random-header">
              <strong>Fluid Geometry Archetypes</strong>
              <label className="ink-lab-toggle-label">
                <input
                  type="checkbox"
                  checked={autoMorph}
                  onChange={(e) => {
                    setAutoMorph(e.target.checked);
                    if (e.target.checked) setCognitionCycle(false);
                  }}
                  disabled={!tool}
                />
                <span>Morph cycle</span>
              </label>
            </div>
            <div className="ink-lab-random-actions">
              <button
                className={`ink-lab-button ink-lab-btn-primary ${activeArchetype === "any" ? "is-active" : ""}`}
                disabled={!tool}
                onClick={() => {
                  setActiveArchetype("any");
                  randomize();
                }}
                title="Generate any random fluid archetype"
              >
                <span>🎲 Random Any</span>
              </button>
              {INK_ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  className="ink-lab-button"
                  disabled={!tool}
                  aria-pressed={activeArchetype === arch.id}
                  onClick={() => {
                    setActiveArchetype(arch.id);
                    randomize(arch.id);
                  }}
                  title={arch.description}
                >
                  <span>{arch.icon} {arch.label}</span>
                </button>
              ))}
            </div>
            <p className="paper-label" style={{ margin: 0, fontSize: "0.75rem" }}>
              Shortcuts: <kbd className="ink-kbd">1</kbd>–<kbd className="ink-kbd">4</kbd> for Embodied States · <kbd className="ink-kbd">Space</kbd> / <kbd className="ink-kbd">R</kbd> for Archetypes
            </p>
          </div>

          {/* Presets & Quality */}
          <div className="ink-lab-presets">
            <button
              className="ink-lab-button"
              disabled={!tool}
              onClick={() => tool?.call("ink_control", { paused: !paused })}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              className="ink-lab-button"
              disabled={!tool}
              onClick={() => {
                const result = tool?.call("ink_capture");
                if (result?.ok && result.image) {
                  const link = document.createElement("a");
                  link.href = result.image;
                  link.download = "living-ink.png";
                  link.click();
                }
              }}
            >
              Save PNG
            </button>
            <label>
              Quality{" "}
              <select
                aria-label="Render quality"
                value={resolution}
                disabled={!tool}
                onChange={(event) =>
                  tool?.call("ink_control", {
                    resolution: Number(event.target.value),
                  })
                }
              >
                <option value="0.5">Economy (0.5×)</option>
                <option value="0.75">Balanced (0.75×)</option>
                <option value="1">Native (1.0×)</option>
              </select>
            </label>
          </div>

          {/* Collapsible Learning Moments & JSON Scene */}
          <details>
            <summary>Material studies</summary>
            <div className="ink-lab-presets" style={{ marginTop: "0.5rem" }}>
              {Object.entries(INK_PRESETS).map(([id, sc]) => (
                <button
                  className="ink-lab-button"
                  key={id}
                  disabled={!tool}
                  onClick={() => apply(sc)}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          </details>

          <fieldset className="ink-lab-moments" style={{ marginTop: "0.5rem" }}>
            <legend>Try a learning moment</legend>
            {Object.entries(INK_EXPRESSIONS).map(([id, entry]) => (
              <button
                key={id}
                className="ink-lab-moment"
                disabled={!tool}
                aria-pressed={sceneName === entry.scene.name}
                onClick={() =>
                  tool?.call("ink_express", { expression: id as InkExpression })
                }
              >
                <span>{entry.label}</span>
                <small>{entry.symbol}</small>
              </button>
            ))}
          </fieldset>


          <details>
            <summary>Scene JSON & Raymarcher Recipe</summary>
            <textarea
              id="ink-scene"
              spellCheck={false}
              value={json}
              onChange={(event) => setJson(event.target.value)}
              style={{ marginTop: "0.5rem" }}
            />
            <button
              className="ink-lab-button ink-lab-apply"
              disabled={!tool}
              onClick={() => {
                try {
                  apply(JSON.parse(json));
                } catch {
                  setMessage("Invalid JSON. The current ink is unchanged.");
                }
              }}
              style={{ marginTop: "0.5rem" }}
            >
              Apply scene
            </button>
          </details>

          <p className="ink-lab-status" role="status">
            {message}
          </p>

          <details>
            <summary>Model Tool API Spec</summary>
            <p style={{ fontSize: "0.8rem", color: "var(--tx-2)" }}>
              Agents interact with <code>window.socratinkInk.call(name, args)</code>.
              Supports <code>ink_somatic</code>, <code>ink_randomize</code>, <code>ink_set_scene</code>, and <code>ink_capture</code>.
            </p>
            <pre>{JSON.stringify(inkToolDefinitions, null, 2)}</pre>
          </details>
        </section>
      </div>
    </main>
  );
}
