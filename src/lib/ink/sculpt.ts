import * as THREE from "three";
import type { InkKinematicKind } from "./kinematics";
import { INK_PRESETS, type InkPart, type InkScene } from "./scene";

export interface SemanticStroke {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  operation?: "union" | "subtract" | "intersect";
  label?: string;
}

export interface SemanticBead {
  center: [number, number, number];
  radius: number;
  operation?: "union" | "subtract" | "intersect";
  label?: string;
}

export interface SculptDefinition {
  concept: string;
  strokes?: SemanticStroke[];
  beads?: SemanticBead[];
  blend?: number;
  motion?: { speed?: number; amplitude?: number; pointer?: number };
  kinematics?: InkKinematicKind;
}

function normDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Number(d.toFixed(2));
}

const vSource = new THREE.Vector3(0, 1, 0);

/**
 * Converts a human/LLM-friendly 3D endpoint stroke into a mathematically
 * exact, invariant-satisfying three-raymarcher capsule primitive.
 */
export function strokeToPart(stroke: SemanticStroke): InkPart {
  const [x1, y1, z1] = stroke.from;
  const [x2, y2, z2] = stroke.to;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const dist = Math.hypot(dx, dy, dz);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const midZ = (z1 + z2) / 2;

  const r = Math.max(0.04, stroke.radius);
  // Total capsule envelope length = dist + 2 * r
  const totalLength = Math.max(r * 2, dist + r * 2);

  let rot: [number, number, number] = [0, 0, 0];
  if (dist > 0.001) {
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(vSource, dir);
    const euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
    rot = [
      normDeg(THREE.MathUtils.radToDeg(euler.x)),
      normDeg(THREE.MathUtils.radToDeg(euler.y)),
      normDeg(THREE.MathUtils.radToDeg(euler.z)),
    ];
  }

  return {
    shape: "capsule",
    operation: stroke.operation ?? "union",
    position: [
      Number(midX.toFixed(3)),
      Number(midY.toFixed(3)),
      Number(midZ.toFixed(3)),
    ],
    // In three-raymarcher: scale.x is diameter, scale.z === scale.x, and scale.y >= scale.x
    scale: [
      Number((r * 2).toFixed(3)),
      Number(totalLength.toFixed(3)),
      Number((r * 2).toFixed(3)),
    ],
    rotation: rot,
  };
}

/**
 * Converts a 3D center bead into an invariant-satisfying capsule sphere.
 */
export function beadToPart(bead: SemanticBead): InkPart {
  const r = Math.max(0.05, bead.radius);
  const diam = Number((r * 2).toFixed(3));
  return {
    shape: "capsule",
    operation: bead.operation ?? "union",
    position: [
      Number(bead.center[0].toFixed(3)),
      Number(bead.center[1].toFixed(3)),
      Number(bead.center[2].toFixed(3)),
    ],
    scale: [diam, diam, diam],
    rotation: [0, 0, 0],
  };
}

export function compileSculptToScene(sculpt: SculptDefinition): InkScene {
  const strokeParts = (sculpt.strokes ?? []).map(strokeToPart);
  const beadParts = (sculpt.beads ?? []).map(beadToPart);
  const parts = [...strokeParts, ...beadParts];

  if (parts.length === 0) {
    throw new Error("Sculpt definition must contain at least one stroke or bead.");
  }

  // Ensure first part is always a union
  parts[0].operation = "union";

  // Limit to max 14 parts for performance and schema compliance
  const trimmed = parts.slice(0, 14);

  return {
    ...structuredClone(INK_PRESETS.ink),
    name: `Sculpt: ${sculpt.concept}`,
    blend: Number((sculpt.blend ?? 0.18).toFixed(3)),
    kinematics: sculpt.kinematics,
    motion: {
      speed: Number((sculpt.motion?.speed ?? 0.35).toFixed(3)),
      amplitude: Number((sculpt.motion?.amplitude ?? 0.016).toFixed(3)),
      pointer: Number((sculpt.motion?.pointer ?? 0.12).toFixed(3)),
    },
    parts: trimmed,
  };
}

// Built-in archetypal semantic concept definitions
export const SCULPT_CATALOG: Record<
  string,
  {
    label: string;
    icon: string;
    description: string;
    definition: SculptDefinition;
  }
> = {
  question_sweep: {
    label: "Calligraphic Question",
    icon: "❓",
    description: "True 3D sweeping calligraphic hook with variable Z-curvature, tapered descender, and magnetic droplet.",
    definition: {
      concept: "Calligraphic Question",
      blend: 0.16,
      motion: { speed: 0.32, amplitude: 0.015, pointer: 0.16 },
      strokes: [
        { from: [-0.40, 0.38, -0.06], to: [-0.26, 0.62, -0.02], radius: 0.10, label: "entry-hook" },
        { from: [-0.26, 0.62, -0.02], to: [0.14, 0.70, 0.06], radius: 0.135, label: "arch-crown" },
        { from: [0.14, 0.70, 0.06], to: [0.44, 0.44, 0.08], radius: 0.125, label: "shoulder-fwd" },
        { from: [0.44, 0.44, 0.08], to: [0.20, 0.14, 0.02], radius: 0.09, label: "descender-curve" },
        { from: [0.20, 0.14, 0.02], to: [0, -0.16, -0.03], radius: 0.075, label: "stem" },
        { from: [0, -0.16, -0.03], to: [-0.02, -0.28, 0], radius: 0.06, label: "terminal-beak" },
      ],
      beads: [
        { center: [-0.06, 0.68, 0.03], radius: 0.16, label: "crown-dome" },
        { center: [0.36, 0.52, 0.07], radius: 0.135, label: "shoulder-bead" },
        { center: [0, -0.66, 0], radius: 0.145, label: "dot-droplet" },
        { center: [0, -0.42, 0], radius: 0.045, label: "capillary-tether" },
      ],
    },
  },

  question_aperture: {
    label: "Question Aperture",
    icon: "❓",
    description: "Socratic calligraphic question mark with tangent-continuous C¹ Bézier curvature, smooth line-weight taper, and levitating nucleus droplet.",
    definition: {
      concept: "Question Aperture",
      blend: 0.19,
      kinematics: "serpentine",
      motion: { speed: 0.30, amplitude: 0.016, pointer: 0.15 },
      strokes: [
        { from: [-0.300, 0.380, -0.040], to: [-0.224, 0.562, -0.007], radius: 0.095, label: "entry-flourish" },
        { from: [-0.224, 0.562, -0.007], to: [-0.060, 0.652, 0.019], radius: 0.121, label: "crown-ascent" },
        { from: [-0.060, 0.652, 0.019], to: [0.129, 0.649, 0.036], radius: 0.135, label: "crown-apex" },
        { from: [0.129, 0.649, 0.036], to: [0.283, 0.552, 0.040], radius: 0.129, label: "shoulder-crest" },
        { from: [0.283, 0.552, 0.040], to: [0.340, 0.360, 0.030], radius: 0.114, label: "shoulder-curve" },
        { from: [0.340, 0.360, 0.030], to: [0.303, 0.215, 0.018], radius: 0.098, label: "throat-inflection" },
        { from: [0.303, 0.215, 0.018], to: [0.226, 0.101, 0.007], radius: 0.084, label: "inward-cascade" },
        { from: [0.226, 0.101, 0.007], to: [0.133, -0.003, -0.002], radius: 0.073, label: "spine-upper" },
        { from: [0.133, -0.003, -0.002], to: [0.049, -0.120, -0.008], radius: 0.064, label: "spine-lower" },
        { from: [0.049, -0.120, -0.008], to: [0.000, -0.270, -0.010], radius: 0.056, label: "terminal-point" },
      ],
      beads: [
        { center: [0.0, -0.66, 0.0], radius: 0.138, label: "levitating-nucleus" },
      ],
    },
  },

  maieutic_iris: {
    label: "Maieutic Aperture",
    icon: "👁️",
    description: "Dilating fluid toroidal window with suspended central nucleus droplet, symbolizing an opening of inquiry.",
    definition: {
      concept: "Maieutic Aperture",
      blend: 0.20,
      kinematics: "vortex",
      motion: { speed: 0.36, amplitude: 0.02, pointer: 0.14 },
      strokes: [
        { from: [-0.32, 0.46, 0.06], to: [0.32, 0.46, 0.06], radius: 0.11, label: "iris-top" },
        { from: [0.32, 0.46, 0.06], to: [0.55, 0, -0.04], radius: 0.11, label: "iris-tr" },
        { from: [0.55, 0, -0.04], to: [0.32, -0.46, 0.06], radius: 0.11, label: "iris-br" },
        { from: [0.32, -0.46, 0.06], to: [-0.32, -0.46, 0.06], radius: 0.11, label: "iris-bottom" },
        { from: [-0.32, -0.46, 0.06], to: [-0.55, 0, -0.04], radius: 0.11, label: "iris-bl" },
        { from: [-0.55, 0, -0.04], to: [-0.32, 0.46, 0.06], radius: 0.11, label: "iris-tl" },
      ],
      beads: [
        { center: [0, 0, 0], radius: 0.18, label: "inquiry-nucleus" },
        { center: [0, 0.54, 0.08], radius: 0.12, label: "crown-accent" },
        { center: [0, -0.54, 0.08], radius: 0.12, label: "base-accent" },
      ],
    },
  },

  inquiry_loop: {
    label: "Inquisitive Monocle",
    icon: "🔍",
    description: "Unified aperture ring that cascades into a tapered questioning descender and suspended dot.",
    definition: {
      concept: "Inquisitive Monocle",
      blend: 0.17,
      motion: { speed: 0.32, amplitude: 0.016, pointer: 0.15 },
      strokes: [
        { from: [-0.30, 0.55, 0.04], to: [0.30, 0.55, 0.04], radius: 0.10, label: "loop-top" },
        { from: [0.30, 0.55, 0.04], to: [0.48, 0.22, 0.06], radius: 0.10, label: "loop-right" },
        { from: [0.48, 0.22, 0.06], to: [0.18, 0.02, 0], radius: 0.085, label: "loop-return" },
        { from: [-0.30, 0.55, 0.04], to: [-0.46, 0.28, -0.04], radius: 0.095, label: "loop-left" },
        { from: [-0.46, 0.28, -0.04], to: [-0.15, 0.08, -0.02], radius: 0.085, label: "loop-bl" },
        { from: [0.18, 0.02, 0], to: [0, -0.25, -0.03], radius: 0.075, label: "descender" },
      ],
      beads: [
        { center: [0, -0.66, 0], radius: 0.145, label: "base-dot" },
        { center: [0, 0.38, 0.02], radius: 0.14, label: "aperture-nucleus" },
      ],
    },
  },

  quill: {
    label: "Dipped Nib",
    icon: "✒️",
    description: "Sculptural calligraphic pen nib with arched shoulders, central breather aperture, tapering tines, and suspended ink droplet.",
    definition: {
      concept: "Dipped Nib",
      blend: 0.17,
      kinematics: "serpentine",
      motion: { speed: 0.30, amplitude: 0.014, pointer: 0.14 },
      strokes: [
        // Upper shank/barrel
        { from: [0, 0.28, -0.02], to: [0, 0.70, -0.04], radius: 0.09, label: "shank" },
        // Left arched shoulder
        { from: [0, 0.40, -0.02], to: [-0.32, 0.18, 0.02], radius: 0.08, label: "shoulder-l" },
        // Right arched shoulder
        { from: [0, 0.40, -0.02], to: [0.32, 0.18, 0.02], radius: 0.08, label: "shoulder-r" },
        // Left tine tapering to tip
        { from: [-0.32, 0.18, 0.02], to: [-0.14, -0.16, 0.03], radius: 0.075, label: "tine-upper-l" },
        { from: [-0.14, -0.16, 0.03], to: [-0.03, -0.50, 0.02], radius: 0.048, label: "tine-tip-l" },
        // Right tine tapering to tip
        { from: [0.32, 0.18, 0.02], to: [0.14, -0.16, 0.03], radius: 0.075, label: "tine-upper-r" },
        { from: [0.14, -0.16, 0.03], to: [0.03, -0.50, 0.02], radius: 0.048, label: "tine-tip-r" },
      ],
      beads: [
        // Breather hole / central liquid swell
        { center: [0, 0.08, 0.02], radius: 0.12, label: "breather-nucleus" },
        // Hanging capillary meniscus droplet
        { center: [0, -0.72, 0], radius: 0.14, label: "hanging-droplet" },
        // Finial crown bead
        { center: [0, 0.74, -0.04], radius: 0.10, label: "finial" },
      ],
    },
  },

  synaptic_bridge: {
    label: "Synaptic Bridge",
    icon: "∿",
    description: "Flowing double-arch viaduct spanning two conceptual shores, linked by a floating synaptic keystone droplet.",
    definition: {
      concept: "Synaptic Bridge",
      blend: 0.18,
      kinematics: "stokes-bridge",
      motion: { speed: 0.32, amplitude: 0.016, pointer: 0.15 },
      strokes: [
        // Left pier / shore foundation
        { from: [-0.74, -0.48, 0], to: [-0.60, -0.05, 0.02], radius: 0.13, label: "pier-l" },
        // Right pier / shore foundation
        { from: [0.74, -0.48, 0], to: [0.60, -0.05, 0.02], radius: 0.13, label: "pier-r" },
        // Left ascending arch
        { from: [-0.60, -0.05, 0.02], to: [-0.34, 0.22, 0.04], radius: 0.105, label: "arch-ascent-l" },
        { from: [-0.34, 0.22, 0.04], to: [-0.08, 0.32, 0.05], radius: 0.09, label: "arch-crown-l" },
        // Right ascending arch
        { from: [0.60, -0.05, 0.02], to: [0.34, 0.22, 0.04], radius: 0.105, label: "arch-ascent-r" },
        { from: [0.34, 0.22, 0.04], to: [0.08, 0.32, 0.05], radius: 0.09, label: "arch-crown-r" },
        // Under-arch resonance chord
        { from: [-0.48, -0.08, -0.02], to: [0.48, -0.08, -0.02], radius: 0.065, label: "tie-beam" },
      ],
      beads: [
        // Floating synaptic keystone nucleus
        { center: [0, 0.35, 0.05], radius: 0.16, label: "synaptic-keystone" },
        // Left shore anchor node
        { center: [-0.76, -0.52, 0], radius: 0.17, label: "node-l" },
        // Right shore anchor node
        { center: [0.76, -0.52, 0], radius: 0.17, label: "node-r" },
      ],
    },
  },

  balance: {
    label: "Dialectic Balance",
    icon: "⚖️",
    description: "Socratic scale: central fulcrum, lever beam, and opposing liquid thesis/antithesis pans.",
    definition: {
      concept: "Dialectic Balance",
      blend: 0.15,
      motion: { speed: 0.32, amplitude: 0.016, pointer: 0.14 },
      strokes: [
        { from: [0, -0.72, 0], to: [0, 0.26, 0], radius: 0.065, label: "fulcrum-pillar" },
        { from: [-0.45, -0.72, 0], to: [0.45, -0.72, 0], radius: 0.085, label: "base-plinth" },
        { from: [-0.68, 0.20, 0], to: [0.68, 0.20, 0], radius: 0.042, label: "lever-beam" },
        { from: [-0.68, 0.20, 0], to: [-0.68, -0.06, 0], radius: 0.026, label: "left-chain" },
        { from: [0.68, 0.20, 0], to: [0.68, -0.06, 0], radius: 0.026, label: "right-chain" },
      ],
      beads: [
        { center: [-0.68, -0.16, 0], radius: 0.19, label: "thesis-pan" },
        { center: [0.68, -0.16, 0], radius: 0.19, label: "antithesis-pan" },
        { center: [0, 0.33, 0], radius: 0.085, label: "pivot-jewel" },
      ],
    },
  },

  aporia: {
    label: "Aporia Knot",
    icon: "🪢",
    description: "Constricted fluid loop of high surface tension embodying productive struggle and epistemic friction.",
    definition: {
      concept: "Aporia Knot",
      blend: 0.24,
      kinematics: "pulse",
      motion: { speed: 0.44, amplitude: 0.026, pointer: 0.16 },
      strokes: [
        { from: [-0.38, -0.15, 0.18], to: [0, 0.36, -0.1], radius: 0.13, label: "loop-upper-l" },
        { from: [0, 0.36, -0.1], to: [0.38, -0.15, 0.18], radius: 0.13, label: "loop-upper-r" },
        { from: [0.38, -0.15, 0.18], to: [0, -0.42, -0.12], radius: 0.13, label: "loop-lower-r" },
        { from: [0, -0.42, -0.12], to: [-0.38, -0.15, 0.18], radius: 0.13, label: "loop-lower-l" },
        { from: [-0.15, 0, 0.12], to: [0.15, 0, -0.12], radius: 0.09, label: "constriction" },
      ],
      beads: [
        { center: [-0.20, 0.10, 0.05], radius: 0.17, label: "tension-lobe-l" },
        { center: [0.20, -0.10, -0.05], radius: 0.17, label: "tension-lobe-r" },
        { center: [0, 0, 0], radius: 0.19, label: "kernel" },
      ],
    },
  },

  codex: {
    label: "Living Codex",
    icon: "📖",
    description: "Sculptural open notebook with twin arched leaves meeting at a fluid ink spine, symbolizing durable unassisted retention.",
    definition: {
      concept: "Living Codex",
      blend: 0.16,
      kinematics: "respiration",
      motion: { speed: 0.28, amplitude: 0.012, pointer: 0.12 },
      strokes: [
        // Central binding spine
        { from: [0, -0.48, -0.06], to: [0, 0.48, -0.06], radius: 0.09, label: "spine" },
        // Left page top wing
        { from: [0, 0.35, -0.04], to: [-0.56, 0.26, 0.08], radius: 0.13, label: "left-top" },
        // Left page bottom wing
        { from: [0, -0.35, -0.04], to: [-0.56, -0.26, 0.08], radius: 0.13, label: "left-bottom" },
        // Left page outer edge
        { from: [-0.56, 0.26, 0.08], to: [-0.56, -0.26, 0.08], radius: 0.12, label: "left-outer" },
        // Right page top wing
        { from: [0, 0.35, -0.04], to: [0.56, 0.26, 0.08], radius: 0.13, label: "right-top" },
        // Right page bottom wing
        { from: [0, -0.35, -0.04], to: [0.56, -0.26, 0.08], radius: 0.13, label: "right-bottom" },
        // Right page outer edge
        { from: [0.56, 0.26, 0.08], to: [0.56, -0.26, 0.08], radius: 0.12, label: "right-outer" },
        // Ribbon bookmark
        { from: [0, 0.48, -0.04], to: [0, 0.68, 0.02], radius: 0.065, label: "ribbon" },
      ],
      beads: [
        // Left page body fullness
        { center: [-0.30, 0, 0.04], radius: 0.22, label: "left-body" },
        // Right page body fullness
        { center: [0.30, 0, 0.04], radius: 0.22, label: "right-body" },
        // Ribbon terminal bead
        { center: [0, 0.72, 0.03], radius: 0.08, label: "ribbon-bead" },
      ],
    },
  },

  chiral: {
    label: "Chiral Specimen",
    icon: "⚛️",
    description: "Stereochemical crux: sp3 tetrahedral carbon with backside Walden inversion attack axis.",
    definition: {
      concept: "Chiral Specimen",
      blend: 0.17,
      motion: { speed: 0.34, amplitude: 0.015, pointer: 0.15 },
      strokes: [
        { from: [0, 0, 0], to: [0, 0.50, 0], radius: 0.055, label: "leaving-bond" },
        { from: [0, 0, 0], to: [-0.46, -0.26, 0.20], radius: 0.055, label: "ligand-bond-1" },
        { from: [0, 0, 0], to: [0.46, -0.26, 0.20], radius: 0.055, label: "ligand-bond-2" },
        { from: [0, 0, 0], to: [0, -0.24, -0.48], radius: 0.055, label: "ligand-bond-3" },
      ],
      beads: [
        { center: [0, 0, 0], radius: 0.17, label: "carbon-core" },
        { center: [0, 0.62, 0], radius: 0.15, label: "leaving-group" },
        { center: [-0.54, -0.32, 0.24], radius: 0.12, label: "methyl" },
        { center: [0.54, -0.32, 0.24], radius: 0.12, label: "ethyl" },
        { center: [0, -0.28, -0.56], radius: 0.09, label: "hydrogen" },
        { center: [0, -0.66, 0], radius: 0.13, label: "backside-nucleophile" },
      ],
    },
  },

  bike: {
    label: "Bicycle",
    icon: "🚲",
    description: "Liquid obsidian bicycle: twin wheels, diamond frame, fork, handlebars, and saddle.",
    definition: {
      concept: "Bicycle",
      blend: 0.14,
      motion: { speed: 0.28, amplitude: 0.012, pointer: 0.14 },
      strokes: [
        // Rear wheel
        { from: [-0.62, -0.32, 0], to: [-0.62, -0.32, 0.01], radius: 0.26, label: "rear-wheel" },
        // Front wheel
        { from: [0.62, -0.32, 0], to: [0.62, -0.32, 0.01], radius: 0.26, label: "front-wheel" },
        // Chainstay (rear hub to bottom bracket)
        { from: [-0.62, -0.32, 0], to: [-0.08, -0.32, 0], radius: 0.055, label: "chainstay" },
        // Seat tube (bottom bracket to saddle post)
        { from: [-0.08, -0.32, 0], to: [-0.22, 0.22, 0], radius: 0.055, label: "seat-tube" },
        // Top tube (saddle post to headset)
        { from: [-0.22, 0.22, 0], to: [0.38, 0.22, 0], radius: 0.055, label: "top-tube" },
        // Down tube (bottom bracket to headset)
        { from: [-0.08, -0.32, 0], to: [0.38, 0.22, 0], radius: 0.055, label: "down-tube" },
        // Front fork (headset to front hub)
        { from: [0.38, 0.22, 0], to: [0.62, -0.32, 0], radius: 0.055, label: "front-fork" },
        // Handlebars (transverse stroke)
        { from: [0.34, 0.32, -0.2], to: [0.34, 0.32, 0.2], radius: 0.05, label: "handlebars" },
        // Saddle (sleek horizontal bead)
        { from: [-0.34, 0.28, 0], to: [-0.14, 0.28, 0], radius: 0.065, label: "saddle" },
      ],
    },
  },

  tree: {
    label: "Living Tree",
    icon: "🌳",
    description: "Organic bonsai tree: tapering rooted trunk, primary branches, and cohesive fluid foliage canopy.",
    definition: {
      concept: "Living Tree",
      blend: 0.26,
      motion: { speed: 0.36, amplitude: 0.02, pointer: 0.1 },
      strokes: [
        // Root base
        { from: [0, -0.78, 0], to: [0.04, -0.32, 0], radius: 0.22, label: "trunk-base" },
        // Upper trunk
        { from: [0.04, -0.32, 0], to: [-0.04, 0.12, 0], radius: 0.16, label: "trunk-upper" },
        // Left bough
        { from: [-0.04, 0.02, 0], to: [-0.44, 0.36, 0.05], radius: 0.11, label: "left-bough" },
        // Right bough
        { from: [0.02, 0.08, 0], to: [0.46, 0.34, -0.05], radius: 0.11, label: "right-bough" },
      ],
      beads: [
        // Central crown canopy
        { center: [-0.02, 0.54, 0], radius: 0.42, label: "canopy-center" },
        // Left foliage cluster
        { center: [-0.5, 0.46, 0.08], radius: 0.32, label: "canopy-left" },
        // Right foliage cluster
        { center: [0.52, 0.42, -0.06], radius: 0.3, label: "canopy-right" },
        // Apex flourish
        { center: [0.12, 0.82, 0.02], radius: 0.22, label: "canopy-apex" },
      ],
    },
  },

  bird: {
    label: "Soaring Bird",
    icon: "🕊️",
    description: "Streamlined swallow in flight: aerodynamic body, sweeping arched wings, and tail fan.",
    definition: {
      concept: "Soaring Bird",
      blend: 0.22,
      motion: { speed: 0.52, amplitude: 0.035, pointer: 0.18 },
      strokes: [
        // Fuselage torso
        { from: [0, -0.22, 0], to: [0, 0.35, 0], radius: 0.18, label: "torso" },
        // Left wing main span
        { from: [0, 0.08, 0], to: [-0.75, 0.48, -0.1], radius: 0.11, label: "left-wing" },
        // Right wing main span
        { from: [0, 0.08, 0], to: [0.75, 0.48, -0.1], radius: 0.11, label: "right-wing" },
        // Tail fan
        { from: [0, -0.2, 0], to: [0, -0.68, 0], radius: 0.08, label: "tail" },
      ],
      beads: [
        // Head
        { center: [0, 0.48, 0.04], radius: 0.13, label: "head" },
        // Left wingtip bead
        { center: [-0.85, 0.56, -0.12], radius: 0.08, label: "left-wingtip" },
        // Right wingtip bead
        { center: [0.85, 0.56, -0.12], radius: 0.08, label: "right-wingtip" },
      ],
    },
  },

  coffee: {
    label: "Coffee Cup",
    icon: "☕",
    description: "Glossy ceramic mug with curved liquid handle and rising steam wisp.",
    definition: {
      concept: "Coffee Cup",
      blend: 0.2,
      motion: { speed: 0.4, amplitude: 0.022, pointer: 0.1 },
      strokes: [
        // Main cup body
        { from: [-0.1, -0.42, 0], to: [-0.1, 0.15, 0], radius: 0.38, label: "mug-body" },
        // Mug base
        { from: [-0.1, -0.44, 0], to: [-0.1, -0.44, 0.01], radius: 0.4, label: "mug-base" },
        // Handle upper
        { from: [0.26, 0.05, 0], to: [0.55, -0.05, 0], radius: 0.075, label: "handle-top" },
        // Handle lower
        { from: [0.55, -0.05, 0], to: [0.24, -0.28, 0], radius: 0.075, label: "handle-bottom" },
        // Steam wisp
        { from: [-0.16, 0.35, 0], to: [-0.06, 0.72, 0.05], radius: 0.085, label: "steam" },
      ],
      beads: [
        // Steam swirl
        { center: [-0.02, 0.86, 0.06], radius: 0.1, label: "steam-bead" },
      ],
    },
  },

  guitar: {
    label: "Acoustic Guitar",
    icon: "🎸",
    description: "Curved acoustic guitar: resonant hourglass body, fretboard neck, and headstock.",
    definition: {
      concept: "Acoustic Guitar",
      blend: 0.22,
      motion: { speed: 0.32, amplitude: 0.018, pointer: 0.12 },
      strokes: [
        // Fretboard neck
        { from: [0, 0.05, 0], to: [0, 0.72, 0], radius: 0.065, label: "neck" },
      ],
      beads: [
        // Lower bout
        { center: [0, -0.42, 0], radius: 0.42, label: "lower-bout" },
        // Waist
        { center: [0, -0.15, 0], radius: 0.3, label: "waist" },
        // Upper bout
        { center: [0, 0.08, 0], radius: 0.35, label: "upper-bout" },
        // Headstock
        { center: [0, 0.82, 0], radius: 0.11, label: "headstock" },
      ],
    },
  },

  glasses: {
    label: "Spectacles",
    icon: "👓",
    description: "Classic wire-rim spectacles: twin circular lenses, arched bridge, and receding temples.",
    definition: {
      concept: "Spectacles",
      blend: 0.16,
      motion: { speed: 0.3, amplitude: 0.014, pointer: 0.18 },
      strokes: [
        // Left circular rim
        { from: [-0.44, 0.02, 0], to: [-0.44, 0.02, 0.01], radius: 0.26, label: "left-lens" },
        // Right circular rim
        { from: [0.44, 0.02, 0], to: [0.44, 0.02, 0.01], radius: 0.26, label: "right-lens" },
        // Nose bridge
        { from: [-0.2, 0.06, 0], to: [0.2, 0.06, 0], radius: 0.05, label: "bridge" },
        // Left temple
        { from: [-0.68, 0.06, 0], to: [-0.82, 0.06, -0.55], radius: 0.045, label: "left-temple" },
        // Right temple
        { from: [0.68, 0.06, 0], to: [0.82, 0.06, -0.55], radius: 0.045, label: "right-temple" },
      ],
    },
  },
};
