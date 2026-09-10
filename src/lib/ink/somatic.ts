import { INK_PRESETS, type InkPart, type InkScene } from "./scene";

export type SomaticState = "settled" | "listening" | "thinking" | "explaining";

export interface SomaticConfig {
  state: SomaticState;
  intensity?: number; // 0.0 (subtle) to 1.0 (pronounced), default 0.6
  conserveVolume?: boolean; // Default true
}

export interface SomaticTelemetry {
  state: SomaticState;
  stateLabel: string;
  description: string;
  estimatedVolume: number;
  conservationFactor: number;
  surfaceTension: number;
  deliberationVorticity: number;
}

// Canonical baseline liquid volume (piriform teardrop)
const REFERENCE_VOLUME = 3.25;

/**
 * Calculates analytic Euclidean volume of a capsule primitive:
 * V = pi * r^2 * (h + 4/3 * r) where r = scale.x / 2, h = max(0, scale.y - scale.x)
 */
export function estimatePrimitiveVolume(part: InkPart): number {
  const r = Math.max(0.001, part.scale[0] / 2);
  const totalLength = Math.max(part.scale[0], part.scale[1]);
  const cylinderHeight = Math.max(0, totalLength - 2 * r);
  return Math.PI * r * r * (cylinderHeight + (4 / 3) * r);
}

export function estimateTotalSceneVolume(parts: InkPart[]): number {
  return parts.reduce((sum, part) => sum + estimatePrimitiveVolume(part), 0);
}

function normDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Number(d.toFixed(2));
}

function createPart(
  position: [number, number, number],
  scale: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
): InkPart {
  // Enforce three-raymarcher capsule invariant: scale.z === scale.x and scale.y >= scale.x
  const r = Math.max(0.05, scale[0]);
  const len = Math.max(r, scale[1]);
  return {
    shape: "capsule",
    operation: "union",
    position: [
      Number(position[0].toFixed(3)),
      Number(position[1].toFixed(3)),
      Number(position[2].toFixed(3)),
    ],
    scale: [
      Number(r.toFixed(3)),
      Number(len.toFixed(3)),
      Number(r.toFixed(3)),
    ],
    rotation: [
      normDeg(rotation[0]),
      normDeg(rotation[1]),
      normDeg(rotation[2]),
    ],
  };
}

/**
 * Normalizes all primitive dimensions and positions by (V_0 / V)^(1/3)
 * to strictly conserve physical liquid mass across fluid transformations.
 */
export function applyVolumeConservation(
  parts: InkPart[],
  targetVolume = REFERENCE_VOLUME,
): { parts: InkPart[]; factor: number } {
  const currentVolume = estimateTotalSceneVolume(parts);
  if (currentVolume <= 0.001) return { parts, factor: 1 };

  const factor = Math.cbrt(targetVolume / currentVolume);

  const conserved = parts.map((part) => ({
    ...part,
    position: [
      Number((part.position[0] * factor).toFixed(3)),
      Number((part.position[1] * factor).toFixed(3)),
      Number((part.position[2] * factor).toFixed(3)),
    ] as [number, number, number],
    scale: [
      Number((part.scale[0] * factor).toFixed(3)),
      Number((part.scale[1] * factor).toFixed(3)),
      Number((part.scale[2] * factor).toFixed(3)),
    ] as [number, number, number],
  }));

  return { parts: conserved, factor };
}

export const SOMATIC_METADATA: Record<
  SomaticState,
  { label: string; description: string; cognitiveSignal: string }
> = {
  settled: {
    label: "Settled",
    description: "Rest, equilibrium, and quiet synthesis. Liquid surface tension is taut and calm.",
    cognitiveSignal: "Context absorbed • System at baseline rest",
  },
  listening: {
    label: "Listening",
    description: "Receptive presence. Fluid elongates and tilts toward the active input locus.",
    cognitiveSignal: "Input stream active • High spatial receptivity",
  },
  thinking: {
    label: "Thinking",
    description: "Deliberation and hypothesis testing. Fluid bifurcates into oscillating binary lobes.",
    cognitiveSignal: "Deep reasoning / search • Epistemic bifurcation",
  },
  explaining: {
    label: "Explaining",
    description: "Insight articulation. Fluid extends in a dynamic calligraphic sweeping arc.",
    cognitiveSignal: "Streaming tokens • Active harmonic cadence",
  },
};

export function generateSomaticScene(config: SomaticConfig): {
  scene: InkScene;
  telemetry: SomaticTelemetry;
} {
  const state = config.state;
  const intensity = Math.max(0, Math.min(1, config.intensity ?? 0.65));
  const conserveVolume = config.conserveVolume ?? true;

  let rawParts: InkPart[] = [];
  let blend = 0.35;
  let speed = 0.35;
  let amplitude = 0.02;
  let pointer = 0.08;
  let sceneName = "Living Ink";

  switch (state) {
    case "settled": {
      sceneName = "Embodied: Settled (Rest)";
      blend = 0.35;
      speed = 0.32 + intensity * 0.06;
      amplitude = 0.016 + intensity * 0.01;
      pointer = 0.06 + intensity * 0.04;

      // Canonical piriform teardrop
      rawParts = [
        createPart([0, -0.26, 0], [1.32, 1.48, 1.32], [0, 0, 0]),
        createPart([0.08, 0.22, 0], [0.78, 1.15, 0.78], [0, 0, -12]),
        createPart([0.18, 0.68, 0], [0.32, 0.52, 0.32], [0, 0, -18]),
      ];
      break;
    }

    case "listening": {
      sceneName = "Embodied: Listening (Receptive)";
      blend = 0.32;
      speed = 0.46 + intensity * 0.12;
      amplitude = 0.03 + intensity * 0.015;
      pointer = 0.22 + intensity * 0.14; // High pointer sensitivity

      // Upward tilted receptive antenna
      const leanAngle = -15 - intensity * 12;
      const stretch = 1 + intensity * 0.25;
      rawParts = [
        createPart([0, -0.22, 0], [1.22, 1.35, 1.22], [0, 0, leanAngle * 0.4]),
        createPart([0.14 * stretch, 0.32 * stretch, 0.05], [0.72, 1.32 * stretch, 0.72], [0, 0, leanAngle]),
        createPart([0.28 * stretch, 0.88 * stretch, 0.08], [0.38, 0.65, 0.38], [0, 0, leanAngle * 1.2]),
      ];
      break;
    }

    case "thinking": {
      sceneName = "Embodied: Thinking (Deliberation)";
      // Strained surface tension during bifurcation
      blend = 0.23 + (1 - intensity) * 0.06;
      speed = 0.75 + intensity * 0.25; // Energetic micro-flutter
      amplitude = 0.065 + intensity * 0.035;
      pointer = 0.04; // Focused internal deliberation

      // Stokes liquid bridge: two main lobes separating under capillary tension
      const separation = 0.45 + intensity * 0.32;
      const waistDiameter = Math.max(0.18, 0.42 - intensity * 0.18);
      rawParts = [
        // Primary left lobe
        createPart([-separation, -0.05, 0], [1.02, 1.2, 1.02], [0, 0, 18]),
        // Secondary right lobe
        createPart([separation, 0.08, 0], [0.94, 1.15, 0.94], [0, 0, -22]),
        // Connecting capillary waist bridge
        createPart([0, 0.02, 0], [waistDiameter, separation * 1.9, waistDiameter], [0, 0, 78]),
        // Satellite micro-droplet representing nascent insight
        createPart([0.05, 0.65, 0.1], [0.26, 0.38, 0.26], [0, 0, 35]),
      ];
      break;
    }

    case "explaining": {
      sceneName = "Embodied: Explaining (Articulation)";
      blend = 0.28;
      speed = 0.6 + intensity * 0.16;
      amplitude = 0.042 + intensity * 0.02;
      pointer = 0.15 + intensity * 0.08;

      // Sweeping calligraphic logarithmic spiral
      const sweep = 1 + intensity * 0.2;
      rawParts = [
        createPart([-0.18, -0.22, 0], [1.22, 1.4, 1.22], [0, 0, 24]),
        createPart([0.22 * sweep, 0.14, 0], [0.82, 1.25 * sweep, 0.82], [0, 0, -38]),
        createPart([0.55 * sweep, 0.58 * sweep, 0], [0.46, 0.95 * sweep, 0.46], [0, 0, -68]),
        createPart([0.72 * sweep, 0.92 * sweep, 0], [0.22, 0.42, 0.22], [0, 0, -82]),
      ];
      break;
    }
  }

  const { parts, factor } = conserveVolume
    ? applyVolumeConservation(rawParts, REFERENCE_VOLUME)
    : { parts: rawParts, factor: 1.0 };

  const finalVolume = estimateTotalSceneVolume(parts);

  const scene: InkScene = {
    ...structuredClone(INK_PRESETS.ink),
    name: sceneName,
    blend: Number(blend.toFixed(3)),
    motion: {
      speed: Number(speed.toFixed(3)),
      amplitude: Number(amplitude.toFixed(3)),
      pointer: Number(pointer.toFixed(3)),
    },
    parts,
  };

  const telemetry: SomaticTelemetry = {
    state,
    stateLabel: SOMATIC_METADATA[state].label,
    description: SOMATIC_METADATA[state].description,
    estimatedVolume: Number(finalVolume.toFixed(2)),
    conservationFactor: Number(factor.toFixed(3)),
    surfaceTension: Number(blend.toFixed(2)),
    deliberationVorticity: Number((speed * amplitude * 100).toFixed(1)),
  };

  return { scene, telemetry };
}
