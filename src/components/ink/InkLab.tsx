"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InkSphere } from "./InkSphere";
import { INK_EXPRESSIONS, type InkExpression } from "@/lib/ink/expressions";
import { INK_PRESETS } from "@/lib/ink/scene";
import { inkToolDefinitions, type InkTool } from "@/lib/ink/tool";
import { toggleTheme } from "@/lib/theme";

export function InkLab() {
  const [tool, setTool] = useState<InkTool | null>(null);
  const [json, setJson] = useState(() =>
    JSON.stringify(INK_PRESETS.ink, null, 2),
  );
  const [message, setMessage] = useState("Starting renderer…");
  const [sceneName, setSceneName] = useState(INK_PRESETS.ink.name);
  const [paused, setPaused] = useState(false);
  const [resolution, setResolution] = useState(0.75);
  useEffect(() => {
    if (!tool) return;
    const refresh = () => {
      const result = tool.call("ink_get_scene");
      if (result.ok) {
        setJson(JSON.stringify(result.scene, null, 2));
        setSceneName(result.scene.name);
        setPaused(result.rendering.paused);
        setResolution(result.rendering.resolution);
        setMessage(`${result.scene.name} · revision ${result.revision}`);
      }
    };
    refresh();
    return tool.subscribe(refresh);
  }, [tool]);
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
        <Link href="/">← Socratink</Link>
        <button className="ink-lab-button" onClick={toggleTheme}>
          Switch theme
        </button>
      </header>
      <div className="ink-lab-heading">
        <p>Symbol study / 02</p>
        <h1>Let an idea take shape.</h1>
        <p>Try a learning moment. Watch the ink find its form.</p>
      </div>
      <div className="ink-lab-grid">
        <section className="ink-lab-stage" aria-label="Ink preview">
          <InkSphere onTool={setTool} />
          <div className="ink-lab-caption" aria-live="polite">
            <strong>{expression?.symbol ?? sceneName}</strong>
            <p>{expression?.meaning ?? "Move your pointer through the ink."}</p>
          </div>
        </section>
        <section className="ink-lab-controls" aria-label="Ink controls">
          <fieldset className="ink-lab-moments">
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
            <summary>Material studies</summary>
            <div className="ink-lab-presets">
              {Object.entries(INK_PRESETS).map(([id, scene]) => (
                <button
                  className="ink-lab-button"
                  key={id}
                  disabled={!tool}
                  onClick={() => apply(scene)}
                >
                  {scene.name}
                </button>
              ))}
            </div>
          </details>
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
                <option value="0.5">Economy</option>
                <option value="0.75">Balanced</option>
                <option value="1">Full</option>
              </select>
            </label>
          </div>
          <label htmlFor="ink-scene">Scene recipe</label>
          <textarea
            id="ink-scene"
            spellCheck={false}
            value={json}
            onChange={(event) => setJson(event.target.value)}
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
          >
            Apply scene
          </button>
          <p className="ink-lab-status" role="status">
            {message}
          </p>
          <details>
            <summary>Model tool interface</summary>
            <p>
              This editor and browser agents share{" "}
              <code>window.socratinkInk.call(name, arguments)</code>. Accepted
              scenes persist in this tab. Use get → set → capture to inspect a
              creation.
            </p>
            <pre>{JSON.stringify(inkToolDefinitions, null, 2)}</pre>
          </details>
        </section>
      </div>
    </main>
  );
}
