import { z } from "zod";

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
  parts: z
    .array(
      z.strictObject({
        shape: z.enum(["sphere", "capsule", "box"]),
        operation: z.enum(["union", "subtract", "intersect"]),
        position: vector(-1.5, 1.5).describe(
          "World coordinates: x right, y up, z toward viewer.",
        ),
        scale: vector(0.15, 2).describe(
          "Full dimensions. Capsule uses x for diameter and y for length; z must equal x and y must be >= x.",
        ),
        rotation: vector(-180, 180).describe(
          "Euler rotation in degrees, XYZ order.",
        ),
      }),
    )
    .min(1)
    .max(8)
    .describe(
      "Ordered smooth CSG operations. The first part must be union. Up to 8 parts.",
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

const part = (
  position: InkPart["position"],
  scale: InkPart["scale"],
  shape: InkPart["shape"] = "sphere",
  rotation: InkPart["rotation"] = [0, 0, 0],
): InkPart => ({ shape, operation: "union", position, scale, rotation });
const base = {
  version: 1 as const,
  blend: 0.42,
  material: { color: "#08090b", roughness: 0.18, metalness: 0.15 },
  motion: { speed: 0.45, amplitude: 0.12, pointer: 0.3 },
};
export const INK_PRESETS: Record<string, InkScene> = {
  ink: {
    ...base,
    name: "Living ink",
    parts: [
      part([0, 0, 0], [1.6, 1.75, 1.5]),
      part([0.55, 0.25, 0.05], [0.9, 0.95, 0.9]),
      part([-0.4, -0.5, 0.1], [1.1, 0.95, 1]),
      part([-0.3, 0.55, -0.1], [0.95, 0.85, 1]),
    ],
  },
  droplet: {
    ...base,
    name: "Droplet",
    parts: [
      part([0, -0.25, 0], [1.6, 1.5, 1.4]),
      part([0.15, 0.45, 0], [0.9, 1.35, 0.9]),
      part([0.3, 0.95, 0], [0.35, 0.55, 0.35]),
    ],
  },
  orbit: {
    ...base,
    name: "Orbit",
    blend: 0.36,
    motion: { speed: 0.35, amplitude: 0.04, pointer: 0.12 },
    parts: Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return part(
        [Math.cos(a) * 0.72, Math.sin(a) * 0.72, Math.sin(a * 2) * 0.08],
        [0.65, 0.65, 0.65],
      );
    }),
  },
  ribbon: {
    ...base,
    name: "Ribbon",
    blend: 0.36,
    parts: [
      part([-0.45, 0.3, 0], [0.5, 1.4, 0.5], "capsule", [0, 0, -42]),
      part([0.05, 0, 0], [0.5, 1.45, 0.5], "capsule", [0, 0, 42]),
      part([0.48, -0.35, 0], [0.5, 1.3, 0.5], "capsule", [0, 0, -42]),
    ],
  },
};
export const defaultInkScene = () => structuredClone(INK_PRESETS.ink);
