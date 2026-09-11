import { z } from "zod";
import {
  defaultInkScene,
  inkSceneSchema,
  parseInkScene,
  type InkScene,
} from "./scene";
import {
  inkExpressDescription,
  inkExpressSchema,
  resolveExpressionScene,
} from "./handler-express";
import {
  inkRandomizeDescription,
  inkRandomizeSchema,
  resolveRandomScene,
} from "./handler-random";
import {
  inkSomaticDescription,
  inkSomaticSchema,
  resolveSomaticScene,
} from "./handler-somatic";
import {
  inkSculptDescription,
  inkSculptSchema,
  resolveSculptScene,
} from "./handler-sculpt";
import type { SomaticTelemetry } from "./somatic";
import type { InkRenderer } from "./renderer";

const empty = z.strictObject({});
const schemas = {
  ink_sculpt: inkSculptSchema,
  ink_somatic: inkSomaticSchema,
  ink_express: inkExpressSchema,
  ink_randomize: inkRandomizeSchema,
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
  ink_sculpt: inkSculptDescription,
  ink_somatic: inkSomaticDescription,
  ink_express: inkExpressDescription,
  ink_randomize: inkRandomizeDescription,
  ink_set_scene:
    "Replace the living ink with a validated scene. Compose up to 14 smooth 3D parts, with material and motion. First part must use union. Capsule scale.y >= scale.x and scale.z === scale.x. Returns accepted scene and render status; capture afterward to inspect appearance.",
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
        let somaticTelemetry: SomaticTelemetry | undefined;
        if (
          name === "ink_set_scene" ||
          name === "ink_express" ||
          name === "ink_randomize" ||
          name === "ink_somatic" ||
          name === "ink_sculpt"
        ) {
          let next: InkScene;
          if (name === "ink_sculpt") {
            next = resolveSculptScene(
              args as Parameters<typeof resolveSculptScene>[0],
            );
          } else if (name === "ink_somatic") {
            const result = resolveSomaticScene(
              args as Parameters<typeof resolveSomaticScene>[0],
            );
            next = result.scene;
            somaticTelemetry = result.telemetry;
          } else if (name === "ink_randomize") {
            next = resolveRandomScene(
              args as Parameters<typeof resolveRandomScene>[0],
            );
          } else if (name === "ink_express") {
            next = resolveExpressionScene(
              args as Parameters<typeof resolveExpressionScene>[0],
            );
          } else {
            next = parseInkScene((args as { scene: unknown }).scene);
          }
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
        return {
          ok: true as const,
          ...inspect(),
          ...(somaticTelemetry ? { somatic: somaticTelemetry } : {}),
          ...(image ? { image } : {}),
        };
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
