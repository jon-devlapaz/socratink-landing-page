import { parseInkScene, type InkPart, type InkScene } from "./scene";
import { inkArtwork } from "@/lib/content";
import type { InkEntrance } from "./renderer";

export const INK_STUDIES = inkArtwork.studies;
export type InkStudy = (typeof INK_STUDIES)[number]["id"];
type Point = [number, number];

function pool(x: number, y: number, width: number, height: number): InkPart {
  return {
    shape: "sphere", operation: "union", position: [x, y, 0],
    scale: [width, height, Math.max(0.06, height * 0.32)], rotation: [0, 0, 0],
  };
}

function stroke(from: Point, to: Point, width: number, overlap = 0): InkPart {
  const [x, y] = from, [xx, yy] = to;
  const part = pool((x + xx) / 2, (y + yy) / 2, width, Math.hypot(xx - x, yy - y) + overlap);
  part.scale[2] = Math.max(0.06, width * 0.65);
  part.rotation[2] = -Math.atan2(xx - x, yy - y) * 180 / Math.PI;
  return part;
}

function mapParts(): InkPart[] {
  return [
    stroke([-0.53, -1.05], [-0.48, -0.58], 0.13, 0.15),
    stroke([-0.48, -0.58], [-0.28, -0.05], 0.105, 0.14),
    stroke([-0.28, -0.05], [0.05, 0.47], 0.08, 0.13),
    stroke([0.05, 0.47], [0.43, 0.88], 0.06, 0.12),
    stroke([-0.25, -0.02], [0.28, 0.1], 0.075, 0.13),
    stroke([0.28, 0.1], [0.68, 0.38], 0.06, 0.12),
    stroke([-0.34, -0.23], [-0.77, 0.11], 0.075, 0.13),
    stroke([-0.77, 0.11], [-0.92, 0.5], 0.06, 0.12),
    stroke([0.43, 0.88], [0.76, 1.04], 0.27),
    stroke([0.68, 0.38], [1.02, 0.3], 0.24),
    stroke([-0.92, 0.5], [-1.02, 0.78], 0.17),
    stroke([0.63, 1], [0.88, 1.11], 0.12),
    stroke([0.86, 0.34], [1.16, 0.22], 0.12),
    stroke([-0.99, 0.69], [-1.05, 0.94], 0.085),
  ];
}

function speakParts(): InkPart[] {
  const pressure = [0.07, 0.2, 0.32, 0.37, 0.34, 0.27, 0.19, 0.11, 0.06];
  return [
    ...pressure.map((height, i) => {
      const u = i / (pressure.length - 1);
      const part = pool(-1.3 + u * 1.7, -0.13 + 0.39 * Math.sin(u * Math.PI * 0.92), 0.48, height);
      part.rotation[2] = Math.atan2(0.39 * Math.PI * 0.92 * Math.cos(u * Math.PI * 0.92), 1.7) * 180 / Math.PI;
      return part;
    }),
    ...[0.06, 0.12, 0.15, 0.1, 0.06].map((height, i) => {
      const u = i / 4;
      const part = pool(0.88 + u * 0.52, -0.24 + 0.17 * Math.cos(u * Math.PI), 0.28, height);
      part.rotation[2] = Math.atan2(-0.17 * Math.PI * Math.sin(u * Math.PI), 0.52) * 180 / Math.PI;
      return part;
    }),
  ];
}

function teacherParts(): InkPart[] {
  return [
    pool(-0.42, 0.12, 1.14, 0.76),
    pool(-0.56, 0.04, 0.7, 0.58),
    pool(-0.31, 0.27, 0.66, 0.68),
    pool(0.71, -0.39, 0.51, 0.31),
    pool(0.77, -0.34, 0.36, 0.29),
    pool(0.59, -0.42, 0.27, 0.18),
  ];
}

export function inkStudyScene(study: InkStudy): InkScene {
  const parts = study === "map" ? mapParts() : study === "speak" ? speakParts() : teacherParts();
  return parseInkScene({
    version: 1, name: `Ink study: ${study}`, blend: study === "map" ? 0.055 : 0.12,
    material: { color: "#100f0f", roughness: 0.74, metalness: 0 },
    motion: { speed: 0, amplitude: 0, pointer: 0 }, parts,
  });
}

function ease(progress: number) {
  const u = Math.max(0, Math.min(1, progress));
  return u * u * u * (u * (u * 6 - 15) + 10);
}

// Each reach starts only after its supporting stem has reached the junction.
const GROWTH = [
  [0, 0.24], [0.17, 0.24], [0.35, 0.25], [0.53, 0.23],
  [0.42, 0.22], [0.58, 0.18], [0.31, 0.2], [0.45, 0.2],
  [0.71, 0.22], [0.72, 0.22], [0.61, 0.24],
  [0.84, 0.16], [0.84, 0.16], [0.78, 0.2],
];

function accompany(part: InkPart, index: number, progress: number): InkPart {
  if (index < 3) return part;
  const u = ease((progress - 0.12) / 0.88);
  const scale = 0.78 + 0.22 * u;
  return {
    ...part,
    position: [part.position[0] + 0.2 * (1 - u), part.position[1] + 0.18 * (1 - u), 0],
    scale: [part.scale[0] * scale, part.scale[1] * scale, part.scale[2] * scale],
  };
}

export function inkStudyEntrance(study: InkStudy): InkEntrance {
  if (study === "teacher") return { duration: 2.2, pose: accompany };
  return {
    duration: 4.2,
    reveal: (part, index, progress) => {
      if (study === "map") {
        const [delay, duration] = GROWTH[index];
        return [0, 1, 0, ease((progress - delay) / duration)];
      }
      // One pen front per voice, not independent beads appearing along it.
      const firstVoice = index < 9;
      const u = firstVoice ? ease(progress / 0.54) : ease((progress - 0.73) / 0.27);
      const head = firstVoice ? -1.53 + 2.19 * u : 0.7 + 0.87 * u;
      const angle = part.rotation[2] * Math.PI / 180;
      const x = Math.cos(angle), y = -Math.sin(angle);
      const extent = (Math.abs(x) * part.scale[0] + Math.abs(y) * part.scale[1]) / 2;
      const reveal = Math.max(0, Math.min(1, (head - part.position[0] + extent) / (2 * extent)));
      return [x, y, 0, reveal];
    },
  };
}
