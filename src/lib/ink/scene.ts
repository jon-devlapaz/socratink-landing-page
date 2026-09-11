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
      "Kinematic motion driver evaluated by the renderer (e.g. stokes-bridge for deliberation). Absent means plain ambient drift.",
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
    blend: 0.35,
    material: { color: "#060709", roughness: 0.14, metalness: 0.16 },
    motion: { speed: 0.32, amplitude: 0.024, pointer: 0.15 },
    kinematics: "respiration",
    parts: [
      part([0, 0, 0], [1.7, 1.7, 1.7]),
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
  meniscus: {
    ...base,
    name: "Breathing Meniscus",
    blend: 0.38,
    material: { color: "#060709", roughness: 0.13, metalness: 0.16 },
    motion: { speed: 0.22, amplitude: 0.018, pointer: 0.12 },
    parts: [
      part([0, -0.05, 0], [1.68, 1.76, 1.68], "capsule"),
      part([0, 0.42, 0], [1.12, 1.12, 1.12], "sphere"),
    ],
  },
  vorticity: {
    ...base,
    name: "Submerged Vorticity",
    blend: 0.52,
    material: { color: "#050608", roughness: 0.12, metalness: 0.18 },
    motion: { speed: 0.38, amplitude: 0.038, pointer: 0.16 },
    parts: [
      part([0, 0, 0], [1.60, 1.60, 1.60], "sphere"),
      part([0.18, 0.20, 0.10], [0.42, 0.42, 0.42], "sphere"),
      part([-0.20, -0.16, 0.08], [0.38, 0.38, 0.38], "sphere"),
      part([0.08, -0.18, -0.14], [0.44, 0.44, 0.44], "sphere"),
      part([-0.12, 0.26, -0.08], [0.32, 0.32, 0.32], "sphere"),
    ],
  },
  ferrofluid: {
    ...base,
    name: "Magnetic Ferrofluid",
    blend: 0.28,
    material: { color: "#07080b", roughness: 0.15, metalness: 0.28 },
    motion: { speed: 0.36, amplitude: 0.026, pointer: 0.38 },
    parts: [
      part([0, -0.28, 0], [1.45, 1.45, 1.45], "sphere"),
      part([0.10, 0.18, 0.05], [0.72, 1.25, 0.72], "capsule", [0, 0, -18]),
      part([0.26, 0.72, 0.08], [0.36, 0.85, 0.36], "capsule", [0, 0, -28]),
      part([0.42, 1.15, 0.12], [0.18, 0.18, 0.18], "sphere"),
    ],
  },
  synaptic: {
    ...base,
    name: "Synaptic Coalescence",
    blend: 0.24,
    material: { color: "#060709", roughness: 0.14, metalness: 0.16 },
    motion: { speed: 0.65, amplitude: 0.055, pointer: 0.06 },
    kinematics: "stokes-bridge",
    parts: [
      part([-0.52, -0.06, 0], [0.98, 1.18, 0.98], "capsule", [0, 0, 16]),
      part([0.52, 0.08, 0], [0.92, 1.12, 0.92], "capsule", [0, 0, -20]),
      part([0, 0.02, 0], [0.28, 1.05, 0.28], "capsule", [0, 0, 78]),
      part([0.06, 0.68, 0.10], [0.24, 0.36, 0.24], "capsule", [0, 0, 30]),
    ],
  },
  lotus: {
    ...base,
    name: "Breathing Lotus",
    blend: 0.32,
    material: { color: "#060709", roughness: 0.13, metalness: 0.16 },
    motion: { speed: 0.35, amplitude: 0.032, pointer: 0.15 },
    kinematics: "respiration",
    parts: [
      part([0, 0, 0], [1.38, 1.38, 1.38], "sphere"),
      part([0, 0.72, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 0]),
      part([0.68, 0.22, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, -72]),
      part([0.42, -0.58, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, -144]),
      part([-0.42, -0.58, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 144]),
      part([-0.68, 0.22, -0.05], [0.55, 0.92, 0.55], "capsule", [0, 0, 72]),
    ],
  },
  vortex: {
    ...base,
    name: "Celestial Gyre",
    blend: 0.38,
    material: { color: "#050608", roughness: 0.13, metalness: 0.20 },
    motion: { speed: 0.44, amplitude: 0.045, pointer: 0.28 },
    kinematics: "vortex",
    parts: [
      part([0, 0, 0], [1.26, 1.26, 1.26], "sphere"),
      part([0.33, 0.55, 0], [0.42, 0.72, 0.42], "capsule"),
      part([-0.40, 0.65, 0], [0.38, 0.68, 0.38], "capsule"),
      part([-0.86, -0.01, 0], [0.35, 0.62, 0.35], "capsule"),
      part([-0.50, -0.85, 0], [0.32, 0.56, 0.32], "capsule"),
      part([0.55, -0.95, 0], [0.28, 0.52, 0.28], "capsule"),
      part([1.22, -0.02, 0], [0.24, 0.46, 0.24], "capsule"),
    ],
  },
  systole: {
    ...base,
    name: "Living Systole",
    blend: 0.34,
    material: { color: "#07080a", roughness: 0.14, metalness: 0.18 },
    motion: { speed: 0.38, amplitude: 0.042, pointer: 0.12 },
    kinematics: "pulse",
    parts: [
      part([0, -0.22, 0], [1.54, 1.62, 1.54], "capsule"),
      part([0, 0.72, 0.05], [0.46, 0.62, 0.46], "capsule"),
      part([0.62, -0.15, 0.05], [0.38, 0.38, 0.38], "sphere"),
      part([-0.62, -0.15, 0.05], [0.38, 0.38, 0.38], "sphere"),
    ],
  },
  serpentine: {
    ...base,
    name: "Calligraphic Wave",
    blend: 0.35,
    material: { color: "#060709", roughness: 0.12, metalness: 0.22 },
    motion: { speed: 0.40, amplitude: 0.038, pointer: 0.25 },
    kinematics: "serpentine",
    parts: [
      part([-0.38, 0.62, 0], [0.55, 1.05, 0.55], "capsule", [0, 0, -32]),
      part([0.05, 0.32, 0.05], [0.52, 1.15, 0.52], "capsule", [0, 0, 24]),
      part([0.36, -0.05, 0], [0.48, 1.10, 0.48], "capsule", [0, 0, -22]),
      part([0.10, -0.42, -0.05], [0.42, 1.05, 0.42], "capsule", [0, 0, 35]),
      part([-0.28, -0.72, 0], [0.32, 0.75, 0.32], "capsule", [0, 0, -45]),
    ],
  },
};
export const defaultInkScene = () => structuredClone(INK_PRESETS.ink);
