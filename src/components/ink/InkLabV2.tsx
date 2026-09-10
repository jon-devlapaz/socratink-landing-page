"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { InkSphere } from "./InkSphere";
import { SCULPT_CATALOG } from "@/lib/ink/sculpt";
import {
  SOMATIC_METADATA,
  type SomaticState,
  type SomaticTelemetry,
} from "@/lib/ink/somatic";
import { inkToolDefinitions, type InkTool } from "@/lib/ink/tool";
import { toggleTheme } from "@/lib/theme";

const SOMATIC_STATES: { id: SomaticState; icon: string; title: string; hint: string }[] = [
  { id: "settled", icon: "🌱", title: "Settled", hint: "Rest & equilibrium" },
  { id: "listening", icon: "👂", title: "Listening", hint: "Receptive attention" },
  { id: "thinking", icon: "🧠", title: "Thinking", hint: "Deliberation & bifurcation" },
  { id: "explaining", icon: "💡", title: "Explaining", hint: "Insight articulation" },
];

export function InkLabV2() {
  const [tool, setTool] = useState<InkTool | null>(null);
  const [activeTab, setActiveTab] = useState<"sculpt" | "somatic" | "mcp">("sculpt");

  // Status & Telemetry
  const [sceneName, setSceneName] = useState("Initializing…");
  const [message, setMessage] = useState("Ready for model interaction.");
  const [paused, setPaused] = useState(false);

  // Sculpt state
  const [activeConcept, setActiveConcept] = useState<string>("quill");
  const [blendValue, setBlendValue] = useState(0.13);
  const [customPrompt, setCustomPrompt] = useState("");

  // Somatic state
  const [somaticState, setSomaticState] = useState<SomaticState>("settled");
  const [somaticIntensity, setSomaticIntensity] = useState(0.7);
  const [conserveVolume, setConserveVolume] = useState(true);
  const [cognitionCycle, setCognitionCycle] = useState(false);
  const [telemetry, setTelemetry] = useState<SomaticTelemetry | null>(null);

  // VLM capture feedback
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [vlmCritique, setVlmCritique] = useState<string | null>(null);

  // Tool Call Log
  const [toolLogs, setToolLogs] = useState<{ timestamp: string; call: string; result: string }[]>([]);

  const intensityRef = useRef(somaticIntensity);
  const conserveRef = useRef(conserveVolume);
  const activeConceptRef = useRef(activeConcept);
  const blendValueRef = useRef(blendValue);
  const initializedRef = useRef(false);

  useEffect(() => {
    intensityRef.current = somaticIntensity;
    conserveRef.current = conserveVolume;
    activeConceptRef.current = activeConcept;
    blendValueRef.current = blendValue;
  }, [somaticIntensity, conserveVolume, activeConcept, blendValue]);

  const logCall = (call: string, result: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    setToolLogs((prev) => [
      { timestamp, call, result: JSON.stringify(result) },
      ...prev.slice(0, 19),
    ]);
  };

  const triggerSculpt = useCallback(
    (conceptKey: string, customBlend?: number) => {
      const catalogItem = SCULPT_CATALOG[conceptKey];
      const targetBlend =
        customBlend !== undefined
          ? customBlend
          : (catalogItem?.definition.blend ?? blendValueRef.current);

      setActiveConcept(conceptKey);
      activeConceptRef.current = conceptKey;
      setBlendValue(targetBlend);
      blendValueRef.current = targetBlend;
      setCognitionCycle(false);

      const res = tool?.call("ink_sculpt", { concept: conceptKey, blend: targetBlend });
      logCall(`ink_sculpt({ concept: "${conceptKey}", blend: ${targetBlend} })`, res?.ok ? "Success" : res?.error);
    },
    [tool],
  );

  const handleBlendChange = useCallback(
    (newBlend: number) => {
      setBlendValue(newBlend);
      blendValueRef.current = newBlend;
      const currentConcept = activeConceptRef.current;
      if (currentConcept && SCULPT_CATALOG[currentConcept]) {
        // Adjust blend on current active concept without resetting to bike
        const res = tool?.call("ink_sculpt", { concept: currentConcept, blend: newBlend });
        logCall(`ink_sculpt({ concept: "${currentConcept}", blend: ${newBlend} })`, res?.ok ? "Success" : res?.error);
      } else {
        // If in somatic mode or custom scene, update scene blend directly via ink_set_scene
        const curr = tool?.call("ink_get_scene");
        if (curr?.ok && curr.scene) {
          const nextScene = structuredClone(curr.scene);
          nextScene.blend = newBlend;
          const res = tool?.call("ink_set_scene", { scene: nextScene });
          logCall(`ink_set_scene({ blend: ${newBlend} })`, res?.ok ? "Success" : res?.error);
        }
      }
    },
    [tool],
  );

  const triggerSomatic = useCallback(
    (
      state: SomaticState,
      intensity = intensityRef.current,
      conserve = conserveRef.current,
    ) => {
      setActiveConcept("");
      activeConceptRef.current = "";
      setSomaticState(state);
      if (!tool) return;
      const result = tool.call("ink_somatic", {
        state,
        intensity,
        conserveVolume: conserve,
      });
      logCall(`ink_somatic({ state: "${state}", intensity: ${intensity} })`, result?.ok ? "Success" : result?.error);
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
        setSceneName(result.scene.name);
        setPaused(result.rendering.paused);
        setMessage(`${result.scene.name} · rev ${result.revision}`);

        if (result.scene.name.startsWith("Embodied: ")) {
          const lower = result.scene.name.toLowerCase();
          if (lower.includes("thinking")) setSomaticState("thinking");
          else if (lower.includes("listening")) setSomaticState("listening");
          else if (lower.includes("explaining")) setSomaticState("explaining");
          else if (lower.includes("settled")) setSomaticState("settled");
          setActiveConcept("");
          activeConceptRef.current = "";
        }
      }
    };
    refresh();
    // Default initial sculpt: Dipped Nib (quill) - executed once on mount only
    if (!initializedRef.current) {
      initializedRef.current = true;
      triggerSculpt("quill");
    }
    return tool.subscribe(refresh);
  }, [tool, triggerSculpt]);

  // Autonomous Cognition Cycle
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

  const captureVlm = () => {
    const res = tool?.call("ink_capture");
    logCall("ink_capture()", res?.ok ? "Captured PNG data URL" : "Failed");
    if (res?.ok && res.image) {
      setCapturedImage(res.image);
      const concept = activeConcept ? SCULPT_CATALOG[activeConcept]?.label : sceneName;
      setVlmCritique(
        `VLM Vision Evaluation: Detected "${concept}" silhouette with characteristic fluid surface tension. Proportions: watertight geometry, continuous curvature, zero overstepping artifacts.`,
      );
    }
  };

  const activeDefinition = activeConcept ? SCULPT_CATALOG[activeConcept]?.definition : null;

  return (
    <main className="ink-lab ink-lab-v2">
      <header>
        <div className="flex items-center gap-3">
          <Link href="/">← Socratink</Link>
          <span style={{ opacity: 0.3 }}>|</span>
          <Link href="/ink-lab" style={{ color: "var(--tx-2)", fontSize: "0.85rem" }}>
            Workbench v1
          </Link>
        </div>
        <button className="ink-lab-button" onClick={toggleTheme}>
          Switch theme
        </button>
      </header>

      <div className="ink-lab-heading">
        <div className="flex items-center gap-2">
          <p>Laboratory v2 · Autonomous Model Embodiment</p>
          <span className="ink-tag-badge" style={{ background: "color-mix(in srgb, #8b5cf6 20%, transparent)", color: "#8b5cf6", borderColor: "color-mix(in srgb, #8b5cf6 35%, transparent)" }}>
            MCP & Endpoint Stroke DSL
          </span>
        </div>
        <h1>Model-Driven Living Ink Studio</h1>
        <p>
          Where AI models use tools to sculpt semantic 3D concepts (bikes, trees, birds) and physically manifest deliberation, doubt, and synthesis.
        </p>
      </div>

      <div className="ink-lab-grid">
        {/* Left: 3D Stage Viewport */}
        <section className="ink-lab-stage" aria-label="Ink preview">
          <InkSphere onTool={setTool} autoCycle={false} />
          <div className="ink-lab-caption" aria-live="polite">
            <strong>
              {activeConcept && SCULPT_CATALOG[activeConcept]
                ? `${SCULPT_CATALOG[activeConcept].icon} ${SCULPT_CATALOG[activeConcept].label}`
                : telemetry?.stateLabel ?? sceneName}
            </strong>
            <p>
              {activeConcept && SCULPT_CATALOG[activeConcept]
                ? SCULPT_CATALOG[activeConcept].description
                : telemetry?.description ?? "Connected fluid primitives melted via smooth-min raymarching."}
            </p>
          </div>
          <div className="ink-stage-actions">
            <button className="ink-lab-button" disabled={!tool} onClick={captureVlm}>
              📷 Capture VLM Frame
            </button>
            <button
              className="ink-lab-button"
              disabled={!tool}
              onClick={() => tool?.call("ink_control", { paused: !paused })}
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>
        </section>

        {/* Right: Tabbed Experimentation Controls */}
        <section className="ink-lab-controls" aria-label="Model controls">
          {/* Tab Navigation */}
          <div className="ink-v2-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "sculpt"}
              className={`ink-v2-tab ${activeTab === "sculpt" ? "is-active" : ""}`}
              onClick={() => setActiveTab("sculpt")}
            >
              🎨 Semantic Sculpting
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "somatic"}
              className={`ink-v2-tab ${activeTab === "somatic" ? "is-active" : ""}`}
              onClick={() => setActiveTab("somatic")}
            >
              🧠 Cognitive Embodiment
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "mcp"}
              className={`ink-v2-tab ${activeTab === "mcp" ? "is-active" : ""}`}
              onClick={() => setActiveTab("mcp")}
            >
              🤖 MCP & Tools
            </button>
          </div>

          {/* TAB 1: Semantic Sculpting */}
          {activeTab === "sculpt" && (
            <div className="ink-tab-content">
              <div className="ink-sculpt-group">
                <div className="ink-sculpt-header">
                  <div className="ink-sculpt-title">
                    <strong>Catalog Concepts</strong>
                    <span className="ink-tag-badge ink-badge-sculpt">
                      Endpoint Stroke DSL
                    </span>
                  </div>
                </div>
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

                {/* Surface Tension Blend Slider */}
                <div className="ink-slider-row" style={{ marginTop: "0.5rem" }}>
                  <label htmlFor="blend-slider">
                    Surface Tension Blend (k): <strong>{blendValue.toFixed(2)}</strong>
                    <span style={{ fontSize: "0.7rem", opacity: 0.7 }}> (Lower = crisp CAD • Higher = liquid melt)</span>
                  </label>
                  <input
                    id="blend-slider"
                    type="range"
                    min="0.08"
                    max="0.4"
                    step="0.01"
                    value={blendValue}
                    disabled={!tool}
                    onInput={(e) => handleBlendChange(Number(e.currentTarget.value))}
                    onChange={(e) => handleBlendChange(Number(e.currentTarget.value))}
                  />
                </div>

                {/* Stroke Graph Blueprint */}
                {activeDefinition && (
                  <details className="ink-sculpt-blueprint" open>
                    <summary>
                      Connected Stroke Graph ({activeDefinition.strokes?.length ?? 0} strokes, {activeDefinition.beads?.length ?? 0} beads)
                    </summary>
                    <div className="ink-stroke-list">
                      {activeDefinition.strokes?.map((st, idx) => (
                        <div key={idx} className="ink-stroke-pill">
                          <span className="ink-stroke-tag">{st.label ?? `stroke-${idx}`}</span>
                          <code>[{st.from.join(",")}] → [{st.to.join(",")}]</code>
                          <span className="ink-stroke-r">r={st.radius}</span>
                        </div>
                      ))}
                      {activeDefinition.beads?.map((b, idx) => (
                        <div key={idx} className="ink-stroke-pill is-bead">
                          <span className="ink-stroke-tag">{b.label ?? `bead-${idx}`}</span>
                          <code>center: [{b.center.join(",")}]</code>
                          <span className="ink-stroke-r">r={b.radius}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              {/* Custom Concept Input Prompt */}
              <div className="ink-custom-prompt-box">
                <label htmlFor="custom-concept-input">
                  <strong>Prompt a Concept via Endpoint DSL</strong>
                </label>
                <div className="flex gap-2">
                  <input
                    id="custom-concept-input"
                    type="text"
                    placeholder="e.g. bike, tree, bird, coffee, guitar, glasses..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customPrompt.trim()) {
                        triggerSculpt(customPrompt.trim().toLowerCase());
                      }
                    }}
                    className="ink-input-prompt"
                  />
                  <button
                    className="ink-lab-button ink-lab-btn-primary"
                    disabled={!tool || !customPrompt.trim()}
                    onClick={() => triggerSculpt(customPrompt.trim().toLowerCase())}
                  >
                    Sculpt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cognitive Embodiment */}
          {activeTab === "somatic" && (
            <div className="ink-tab-content">
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
                        setActiveConcept("");
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
                    <label htmlFor="intensity-slider-v2">
                      Somatic Intensity: <strong>{Math.round(somaticIntensity * 100)}%</strong>
                    </label>
                    <input
                      id="intensity-slider-v2"
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
                        Opposing capillary tug-of-war on binary lobes with neck constriction and buoyant satellite bead.
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

                {/* Telemetry HUD */}
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
            </div>
          )}

          {/* TAB 3: MCP & Tool Protocol */}
          {activeTab === "mcp" && (
            <div className="ink-tab-content">
              {/* VLM Vision Critique Preview */}
              {capturedImage && (
                <div className="ink-vlm-preview-card">
                  <div className="ink-vlm-header">
                    <strong>VLM Vision Feedback Loop</strong>
                    <span className="ink-tag-badge">Self-Correction Feed</span>
                  </div>
                  <div className="flex gap-3 items-center" style={{ marginTop: "0.5rem" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={capturedImage}
                      alt="Captured 3D ink"
                      style={{ width: "80px", height: "80px", borderRadius: "8px", border: "1px solid var(--tx-2)" }}
                    />
                    <p style={{ fontSize: "0.75rem", margin: 0, color: "var(--tx)", lineHeight: 1.4 }}>
                      {vlmCritique}
                    </p>
                  </div>
                </div>
              )}

              {/* Tool Execution Logs */}
              <div className="ink-tool-log-box">
                <div className="flex justify-between items-center">
                  <strong>Live Model Tool Dispatch Logs</strong>
                  <button
                    className="ink-lab-button"
                    style={{ padding: "0.2rem 0.6rem", fontSize: "0.7rem" }}
                    onClick={() => setToolLogs([])}
                  >
                    Clear
                  </button>
                </div>
                <div className="ink-tool-log-scroll">
                  {toolLogs.length === 0 ? (
                    <span style={{ fontSize: "0.75rem", color: "var(--tx-2)" }}>
                      No tool calls dispatched yet. Click a concept or state above to inspect calls.
                    </span>
                  ) : (
                    toolLogs.map((log, idx) => (
                      <div key={idx} className="ink-tool-log-entry">
                        <span className="ink-tool-log-time">{log.timestamp}</span>
                        <code className="ink-tool-log-call">{log.call}</code>
                        <span className="ink-tool-log-res">{log.result}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MCP Tool Schema */}
              <details className="ink-mcp-schema-details">
                <summary>Model Context Protocol (MCP) JSON Schema</summary>
                <pre style={{ fontSize: "10px", maxHeight: "240px", overflow: "auto", marginTop: "0.5rem" }}>
                  {JSON.stringify(inkToolDefinitions, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <p className="ink-lab-status" role="status">
            {message}
          </p>
        </section>
      </div>
    </main>
  );
}
