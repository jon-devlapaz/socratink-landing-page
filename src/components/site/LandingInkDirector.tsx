"use client";

import { useSyncExternalStore } from "react";
import { INK_EXPRESSIONS, type InkExpression } from "@/lib/ink/expressions";
import type { InkTool } from "@/lib/ink/tool";

const subscribeNothing = () => () => {};
const labels: Record<InkExpression, string> = {
  rest: "Rest", question: "Wonder", connect: "Connect", explain: "Your words",
};

/** An explicit symbol preview; selecting a symbol makes no claim about learning. */
export function LandingInkDirector({ tool }: { tool: InkTool | null }) {
  const sceneName = useSyncExternalStore(
    tool ? tool.subscribe : subscribeNothing,
    () => { const result = tool?.call("ink_get_scene"); return result?.ok ? result.scene.name : "Living ink"; },
    () => "Living ink",
  );
  return (
    <div className="hero-ink-cues" role="group" aria-label="Explore the ink symbols">
      {Object.entries(INK_EXPRESSIONS).map(([id, entry]) => (
        <button key={id} type="button" disabled={!tool}
          aria-pressed={sceneName === entry.scene.name || (id === "rest" && sceneName === "Living ink")}
          aria-label={`Preview ${entry.symbol.toLowerCase()}`}
          onClick={() => tool?.call("ink_express", { expression: id })}>
          {labels[id as InkExpression]}
        </button>
      ))}
    </div>
  );
}
