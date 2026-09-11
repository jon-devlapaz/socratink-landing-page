import { z } from "zod";
import { generateRandomInkScene, type InkArchetype } from "./random";
import type { InkScene } from "./scene";

export const inkRandomizeSchema = z.strictObject({
  archetype: z
    .enum(["droplet", "comma", "coalescence", "trilobe", "splash", "pebble"])
    .optional(),
  style: z.string().optional(),
});

export const inkRandomizeDescription =
  "Generate a new procedural organic ink blot, droplet, or bean shape. Smoothly morphs the living ink into a novel random configuration.";

export interface InkRandomizeInput {
  archetype?: InkArchetype;
  style?: string;
}

export function resolveRandomScene(input: InkRandomizeInput): InkScene {
  const choice = (input?.archetype ??
    (input?.style === "bean"
      ? "pebble"
      : input?.style === "blot"
        ? "trilobe"
        : input?.style)) as InkArchetype | undefined;
  return generateRandomInkScene(choice);
}
