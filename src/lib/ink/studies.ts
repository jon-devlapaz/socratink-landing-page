import { parseInkScene, type InkPart, type InkScene } from "./scene";

export const INK_STUDIES = [
  { id: "map", name: "Map", gesture: "One understanding opens into more.", description: "A shared root divides, then divides again. Four connected tips reach into a growing map of skills." },
  { id: "speak", name: "Speak", gesture: "A voice moves through the ink.", description: "A ripple enters at the left, travels through the ribbon, and softens at the right. A phrase, then a breath." },
  { id: "teacher", name: "Teacher", gesture: "A thought wakes another.", description: "A pooled presence on the paper. A slow swell wakes through the wet ink, then settles." },
] as const;
export type InkStudy = (typeof INK_STUDIES)[number]["id"];
export const STUDY_MORPH_SECONDS = 4.8;
export const STUDY_HOLD_SECONDS = 9;
const COUNT = 14;

function volume(x: number, y: number, z: number, diameter: number): InkPart {
  return { shape: "sphere", operation: "union", position: [x, y, z],
    scale: [diameter, diameter, diameter], rotation: [0, 0, 0] };
}

function capsule(from: number[], to: number[], diameter: number): InkPart {
  const [x, y] = from, [xx, yy] = to;
  const length = Math.hypot(xx - x, yy - y);
  return {
    shape: "capsule", operation: "union",
    position: [(x + xx) / 2, (y + yy) / 2, 0],
    scale: [diameter, Math.max(diameter, length + diameter), diameter],
    rotation: [0, 0, -Math.atan2(xx - x, yy - y) * 180 / Math.PI],
  };
}

// Trunk, then two arms, then four twigs. Capsules keep the crotches open
// so the silhouette reads as a skill tree instead of a claw.
function mapParts(extend: boolean): InkPart[] {
  const root = [0, -0.9];
  const fork = [0.02, -0.08];
  const forks: number[][] = [[-0.5, 0.32], [0.52, 0.28]];
  const tips = [[-0.9, 0.7], [-0.34, 0.96], [0.36, 0.94], [0.92, 0.66]].map(([x, y], i) => {
    const [fx, fy] = forks[i < 2 ? 0 : 1];
    const reach = extend ? 1.24 : 1;
    return [fx + (x - fx) * reach, fy + (y - fy) * reach];
  });
  const pool = volume(root[0], root[1], 0, 0.4);
  pool.scale = extend ? [0.46, 0.2, 0.34] : [0.42, 0.24, 0.34];
  return [
    pool,
    capsule(root, fork, 0.18),
    capsule(fork, forks[0], 0.13), capsule(fork, forks[1], 0.13),
    volume(forks[0][0], forks[0][1], 0, 0.16), volume(forks[1][0], forks[1][1], 0, 0.16),
    ...tips.map((tip, i) => capsule(forks[i < 2 ? 0 : 1], tip, 0.09)),
    ...tips.map(([x, y]) => volume(x, y, 0, extend ? 0.17 : 0.14)),
  ];
}

// A pooled presence and a second thought fused to it. Fourteen overlapping
// spheres stay one body; flattened so the skin reads as ink on paper.
function teacherParts(): InkPart[] {
  const beads = [
    [-0.16, -0.18, 0.00, 1.38],
    [-0.46, -0.12, 0.04, 0.88],
    [0.14, -0.36, 0.02, 1.02],
    [-0.20, -0.48, 0.00, 0.92],
    [0.18, -0.04, 0.05, 0.98],
    [-0.38, -0.36, -0.02, 0.70],
    [0.00, 0.10, 0.06, 1.12],
    [0.24, 0.16, 0.04, 0.84],
    [0.20, 0.32, 0.05, 0.80],
    [0.10, 0.40, 0.04, 0.76],
    [0.44, 0.48, 0.05, 0.90],
    [0.30, 0.64, 0.02, 0.64],
    [0.60, 0.40, 0.04, 0.58],
    [0.50, 0.64, 0.00, 0.54],
  ];
  return beads.map(([x, y, z, d]) => {
    const part = volume(x, y, z, d);
    part.scale = [d, d, d * 0.52];
    return part;
  });
}

// Every pose retains the same fourteen union volumes, pigment and camera.
// The renderer moves their bodies; no crossfade or topology switch is needed.
export function inkStudyScene(study: InkStudy | "drop", gesture = false): InkScene {
  const parts = study === "map" ? mapParts(gesture) : study === "teacher" ? teacherParts() : Array.from({ length: COUNT }, (_, i) => {
    const u = i / (COUNT - 1);
    if (study === "drop") {
      return volume(0.07 * Math.sin(u * Math.PI), -0.3 + u * 0.67, 0, 1.04 - u * 0.36);
    }
    const diameter = 0.34 + 0.03 * Math.sin(u * Math.PI);
    const part = volume((u * 2 - 1) * 1.02, 0.08 * Math.sin(u * Math.PI), 0, diameter);
    part.scale = [diameter, diameter, diameter * 0.48];
    return part;
  });
  return parseInkScene({
    version: 1, name: `Ink study: ${study}`, blend: study === "map" ? 0.09 : study === "teacher" ? 0.24 : 0.34,
    material: { color: "#060709", roughness: 0.23, metalness: 0 },
    motion: { speed: 0.28, amplitude: 0.018, pointer: 0.06 }, parts,
  });
}

export function inkStudyDropScene(study: InkStudy): InkScene {
  const drop = inkStudyScene("drop");
  const anatomy = inkStudyScene(study);
  // A capsule with equal dimensions is a sphere. Keep Map's primitive types
  // through replay so its long branches never switch abruptly to ellipsoids.
  drop.parts.forEach((part, i) => { part.shape = anatomy.parts[i].shape; });
  return parseInkScene(drop);
}
