import { z } from "zod";
import {
  compileSculptToScene,
  SCULPT_CATALOG,
  type SculptDefinition,
  type SemanticBead,
  type SemanticStroke,
} from "./sculpt";
import type { InkScene } from "./scene";

export const inkSculptSchema = z.strictObject({
  concept: z
    .string()
    .describe(
      "Concept name (e.g. 'bike', 'tree', 'bird', 'coffee') or custom title",
    ),
  strokes: z
    .array(
      z.strictObject({
        from: z.tuple([z.number(), z.number(), z.number()]),
        to: z.tuple([z.number(), z.number(), z.number()]),
        radius: z.number().min(0.02).max(0.8),
        operation: z.enum(["union", "subtract", "intersect"]).optional(),
        label: z.string().optional(),
      }),
    )
    .optional(),
  beads: z
    .array(
      z.strictObject({
        center: z.tuple([z.number(), z.number(), z.number()]),
        radius: z.number().min(0.04).max(1.0),
        operation: z.enum(["union", "subtract", "intersect"]).optional(),
        label: z.string().optional(),
      }),
    )
    .optional(),
  blend: z.number().min(0.08).max(0.45).optional(),
});

export const inkSculptDescription =
  "Sculpt the living ink into a recognizable semantic concept (e.g. 'bike', 'tree', 'bird', 'coffee') using connected 3D strokes and volume beads. Primitives melt together via liquid surface tension into an obsidian fluid sculpture.";

export interface InkSculptInput {
  concept: string;
  strokes?: SemanticStroke[];
  beads?: SemanticBead[];
  blend?: number;
}

export function resolveSculptScene(input: InkSculptInput): InkScene {
  const key = input.concept?.toLowerCase().trim();
  const catalogEntry = SCULPT_CATALOG[key];
  if (catalogEntry && (!input.strokes || input.strokes.length === 0)) {
    return compileSculptToScene({
      ...catalogEntry.definition,
      ...(input.blend !== undefined ? { blend: input.blend } : {}),
    });
  }
  return compileSculptToScene(input as SculptDefinition);
}
