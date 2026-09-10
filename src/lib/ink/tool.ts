import { z } from "zod";
import {
  defaultInkScene,
  inkSceneSchema,
  parseInkScene,
  type InkScene,
} from "./scene";
import { INK_EXPRESSIONS, type InkExpression } from "./expressions";
import type { InkRenderer } from "./renderer";

const empty = z.strictObject({});
const schemas = {
  ink_express: z.strictObject({
    expression: z.enum(["rest", "question", "connect", "explain"]),
  }),
  ink_set_scene: z.strictObject({ scene: inkSceneSchema }),
  ink_get_scene: empty,
  ink_control: z.strictObject({
    paused: z.boolean().optional(),
    resolution: z
      .union([z.literal(0.5), z.literal(0.75), z.literal(1)])
      .optional(),
  }),
  ink_capture: empty,
};
const descriptions = {
  ink_express:
    "Express a Socratink learning moment: rest (ink droplet), question (question mark), connect (bridge), explain (open notebook). Choose from interaction context; these are visual cues, not assessments of learning. Replaces the scene with a validated starting recipe. Use ink_set_scene for a custom form.",
  ink_set_scene:
    "Replace the living ink with a validated scene. Compose up to 8 smooth 3D parts, with material and motion. First part must use union. Capsule scale.y >= scale.x and scale.z === scale.x. Returns accepted scene and render status; capture afterward to inspect appearance.",
  ink_get_scene:
    "Read the accepted scene, revision, and live renderer status before editing.",
  ink_control:
    "Pause/resume ink motion or select render resolution (0.5, 0.75, 1). Reduced motion preferences take priority. Resolution is a quality/cost control, not scene content.",
  ink_capture:
    "Render the current ink and return a PNG data URL. Inspect the image before claiming the requested appearance was achieved.",
};
export const inkToolDefinitions = Object.entries(schemas).map(
  ([name, schema]) => ({
    type: "function" as const,
    name,
    description: descriptions[name as keyof typeof schemas],
    parameters: z.toJSONSchema(schema),
  }),
);
export const INK_STORAGE_KEY = "socratink.ink.scene.v1";
export function readInitialInk(): InkScene {
  try {
    const stored = sessionStorage.getItem(INK_STORAGE_KEY);
    if (stored) return parseInkScene(JSON.parse(stored));
  } catch {
    /* A stale scene must not break the hero. */
  }
  return defaultInkScene();
}
export function createInkTool(renderer: InkRenderer, initial: InkScene) {
  let scene = structuredClone(initial);
  let revision = 0;
  const listeners = new Set<() => void>();
  const inspect = () => ({
    scene: structuredClone(scene),
    revision,
    rendering: renderer.inspect(),
  });
  return {
    definitions: inkToolDefinitions,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    call(name: string, args: unknown = {}) {
      try {
        if (!Object.hasOwn(schemas, name))
          throw new Error(`Unknown tool: ${name}`);
        schemas[name as keyof typeof schemas].parse(args);
        if (name === "ink_set_scene" || name === "ink_express") {
          const next = parseInkScene(
            name === "ink_express"
              ? INK_EXPRESSIONS[
                  (args as { expression: InkExpression }).expression
                ].scene
              : (args as { scene: unknown }).scene,
          );
          renderer.setScene(next);
          scene = next;
          revision++;
          try {
            sessionStorage.setItem(INK_STORAGE_KEY, JSON.stringify(scene));
          } catch {
            /* Rendering remains available when storage is disabled. */
          }
        } else if (name === "ink_control") {
          const input = args as { paused?: boolean; resolution?: number };
          if (input.paused !== undefined) renderer.setPaused(input.paused);
          if (input.resolution !== undefined)
            renderer.setResolution(input.resolution);
        }
        const image = name === "ink_capture" ? renderer.capture() : undefined;
        if (name !== "ink_get_scene" && name !== "ink_capture")
          listeners.forEach((listener) => listener());
        return { ok: true as const, ...inspect(), ...(image ? { image } : {}) };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : String(error),
          revision,
        };
      }
    },
  };
}
export type InkTool = ReturnType<typeof createInkTool>;
declare global {
  interface Window {
    socratinkInk?: InkTool;
  }
}
