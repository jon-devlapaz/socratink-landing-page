import { z } from "zod";
import { INK_KINEMATIC_KINDS } from "./kinematics";

const vector = (min: number, max: number) =>
  z.tuple([
    z.number().min(min).max(max),
    z.number().min(min).max(max),
    z.number().min(min).max(max),
  ]);
export const inkSceneSchema = z.strictObject({
  version: z.literal(1),
  name: z.string().min(1).max(80),
  blend: z
    .number()
    .min(0.05)
    .max(0.6)
    .describe("Softness where parts merge, in scene units."),
  material: z.strictObject({
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    roughness: z.number().min(0.12).max(0.8),
    metalness: z.number().min(0).max(1),
  }),
  motion: z.strictObject({
    speed: z.number().min(0).max(1.5),
    amplitude: z.number().min(0).max(0.3),
    pointer: z.number().min(0).max(0.6),
  }),
  kinematics: z
    .enum(INK_KINEMATIC_KINDS)
    .optional()
    .describe(
      "Kinematic motion driver evaluated by the renderer. Absent means plain ambient drift.",
    ),
  parts: z
    .array(
      z.strictObject({
        shape: z.enum(["sphere", "capsule", "box"]),
        operation: z.enum(["union", "subtract", "intersect"]),
        position: vector(-1.5, 1.5).describe(
          "World coordinates: x right, y up, z toward viewer.",
        ),
        scale: vector(0.06, 2.5).describe(
          "Full dimensions. Capsule uses x for diameter and y for length; z must equal x and y must be >= x.",
        ),
        rotation: vector(-180, 180).describe(
          "Euler rotation in degrees, XYZ order.",
        ),
      }),
    )
    .min(1)
    .max(14)
    .describe(
      "Ordered smooth CSG operations. The first part must be union. Up to 14 parts.",
    ),
});
export type InkScene = z.infer<typeof inkSceneSchema>;
export type InkPart = InkScene["parts"][number];

export function parseInkScene(input: unknown): InkScene {
  const scene = inkSceneSchema.parse(input);
  if (scene.parts[0].operation !== "union")
    throw new Error("parts[0].operation must be union.");
  scene.parts.forEach((part, i) => {
    if (
      part.shape === "capsule" &&
      (part.scale[1] < part.scale[0] || part.scale[2] !== part.scale[0])
    ) {
      throw new Error(
        `parts[${i}]: capsule needs scale.y >= scale.x and scale.z === scale.x.`,
      );
    }
  });
  return scene;
}
