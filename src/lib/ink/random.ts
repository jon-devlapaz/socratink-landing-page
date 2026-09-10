import { parseInkScene, type InkPart, type InkScene } from "./scene";

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Number(d.toFixed(1));
}

export type InkArchetype =
  | "droplet"
  | "comma"
  | "coalescence"
  | "trilobe"
  | "splash"
  | "pebble";

export const INK_ARCHETYPES: { id: InkArchetype; label: string; icon: string; description: string }[] = [
  { id: "droplet", label: "Teardrop", icon: "💧", description: "Asymmetrical pear with gravity bulb & tapered crest (piriform quartic)" },
  { id: "comma", label: "Sweeping Comma", icon: "🌀", description: "Calligraphic logarithmic spiral with curled tail" },
  { id: "coalescence", label: "Binary Fusion", icon: "🫧", description: "Two fluid droplets merging with a capillary neck (Stokes bridge)" },
  { id: "trilobe", label: "Trefoil Clover", icon: "☘️", description: "Three-harmonic surface tension radial lobes" },
  { id: "splash", label: "Crown Splash", icon: "💥", description: "Impact crater with radiating satellite beads" },
  { id: "pebble", label: "Arched Pebble", icon: "🫘", description: "Sculptural kidney bean with smooth concave waist" },
];

/**
 * 1. TEARDROP / PIRIFORM DROPLET
 * Models a hanging/falling ink droplet using piriform quartic geometry:
 * Voluptuous gravitational base bulb + directional capillary stem + apex bead.
 */
function buildTeardrop(): { name: string; parts: InkPart[]; blend: number } {
  const tiltDeg = (Math.random() > 0.5 ? 1 : -1) * rand(12, 26);
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const bulbScale = rand(1.42, 1.58);
  const parts: InkPart[] = [];

  // Heavy gravitational base
  const baseY = rand(-0.35, -0.22);
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [0, baseY, 0],
    scale: [bulbScale, bulbScale * 0.94, bulbScale * 0.92],
    rotation: [0, 0, normDeg(tiltDeg * 0.35)],
  });

  // Tapered capillary neck
  const neckDiam = rand(0.68, 0.82);
  const neckLen = Math.max(neckDiam, rand(1.15, 1.35));
  const neckDist = 0.48;
  const neckX = Math.sin(tiltRad) * neckDist;
  const neckY = baseY + Math.cos(tiltRad) * neckDist;

  parts.push({
    shape: "capsule",
    operation: "union",
    position: [neckX, neckY, rand(-0.03, 0.03)],
    scale: [neckDiam, neckLen, neckDiam],
    rotation: [normDeg(rand(-6, 6)), normDeg(rand(-6, 6)), normDeg(-tiltDeg)],
  });

  // Tapering tip bead
  const tipDist = neckDist + neckLen * 0.42;
  const tipX = Math.sin(tiltRad) * tipDist;
  const tipY = baseY + Math.cos(tiltRad) * tipDist;
  const tipDiam = rand(0.28, 0.42);

  parts.push({
    shape: "sphere",
    operation: "union",
    position: [tipX, tipY, 0],
    scale: [tipDiam, tipDiam, tipDiam],
    rotation: [0, 0, 0],
  });

  // Optional subtle capillary bead or flank swell
  if (Math.random() > 0.35) {
    const flankSide = Math.random() > 0.5 ? 1 : -1;
    const flankAngle = tiltRad + (flankSide * Math.PI) / 2.6;
    const flankDist = rand(0.48, 0.65);
    const flankDiam = rand(0.45, 0.68);
    parts.push({
      shape: "sphere",
      operation: "union",
      position: [
        Math.sin(flankAngle) * flankDist,
        baseY + Math.cos(flankAngle) * flankDist * 0.8,
        rand(-0.04, 0.04),
      ],
      scale: [flankDiam, flankDiam * 0.9, flankDiam],
      rotation: [0, 0, 0],
    });
  }

  return {
    name: "Piriform Teardrop",
    parts,
    blend: Number(rand(0.32, 0.38).toFixed(2)),
  };
}

/**
 * 2. SWEEPING COMMA / MAGATAMA
 * Models a calligraphic brush stroke / logarithmic spiral:
 * Heavy head with a sweeping, curling tail tapering across angular steps.
 */
function buildComma(): { name: string; parts: InkPart[]; blend: number } {
  const parts: InkPart[] = [];
  const flip = Math.random() > 0.5 ? 1 : -1;
  const headSize = rand(1.3, 1.48);

  // Core head
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [flip * -0.18, -0.05, 0],
    scale: [headSize, headSize * 1.05, headSize * 0.92],
    rotation: [0, 0, normDeg(flip * -15)],
  });

  // Tail step 1 (upper curve)
  const angle1 = flip * rand(35, 55);
  const rad1 = (angle1 * Math.PI) / 180;
  const dist1 = 0.48;
  const d1 = 0.72;
  parts.push({
    shape: "capsule",
    operation: "union",
    position: [Math.sin(rad1) * dist1, Math.cos(rad1) * dist1, 0],
    scale: [d1, Math.max(d1, 1.15), d1],
    rotation: [0, 0, normDeg(-angle1 + flip * 15)],
  });

  // Tail step 2 (curling inward)
  const angle2 = flip * rand(85, 115);
  const rad2 = (angle2 * Math.PI) / 180;
  const dist2 = 0.75;
  const d2 = 0.48;
  parts.push({
    shape: "capsule",
    operation: "union",
    position: [Math.sin(rad2) * dist2, Math.cos(rad2) * dist2 * 0.75, 0],
    scale: [d2, Math.max(d2, 0.85), d2],
    rotation: [0, 0, normDeg(-angle2 + flip * 30)],
  });

  // Tail tip bead
  const angle3 = flip * rand(135, 160);
  const rad3 = (angle3 * Math.PI) / 180;
  const dist3 = 0.82;
  const d3 = rand(0.24, 0.35);
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [Math.sin(rad3) * dist3, Math.cos(rad3) * dist3 * 0.55 - 0.1, 0],
    scale: [d3, d3, d3],
    rotation: [0, 0, 0],
  });

  return {
    name: "Sweeping Comma",
    parts,
    blend: Number(rand(0.34, 0.42).toFixed(2)),
  };
}

/**
 * 3. BINARY FUSION / COALESCENCE
 * Models two distinct droplets undergoing capillary coalescence:
 * Two dominant spheres joined by a narrower liquid bridge with an hourglass waist.
 */
function buildCoalescence(): { name: string; parts: InkPart[]; blend: number } {
  const parts: InkPart[] = [];
  const axisAngleDeg = rand(-35, 35);
  const axisRad = (axisAngleDeg * Math.PI) / 180;
  const sep = rand(0.72, 0.88);

  const r1 = rand(1.15, 1.35);
  const r2 = rand(0.95, 1.18);

  // Droplet A (Major)
  const ax = -Math.cos(axisRad) * (sep * 0.52);
  const ay = -Math.sin(axisRad) * (sep * 0.52);
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [ax, ay, 0],
    scale: [r1, r1 * rand(0.95, 1.05), r1 * 0.92],
    rotation: [0, 0, normDeg(axisAngleDeg)],
  });

  // Droplet B (Minor)
  const bx = Math.cos(axisRad) * (sep * 0.52);
  const by = Math.sin(axisRad) * (sep * 0.52);
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [bx, by, 0],
    scale: [r2, r2 * rand(0.95, 1.05), r2 * 0.92],
    rotation: [0, 0, normDeg(axisAngleDeg)],
  });

  // Liquid capillary neck bridging them
  const neckDiam = rand(0.58, 0.72);
  parts.push({
    shape: "capsule",
    operation: "union",
    position: [(ax + bx) * 0.5, (ay + by) * 0.5, 0],
    scale: [neckDiam, Math.max(neckDiam, sep * 1.35), neckDiam],
    rotation: [0, 0, normDeg(-axisAngleDeg + 90)],
  });

  // Satellite bud / meniscus pinch
  if (Math.random() > 0.4) {
    const budRad = rand(0.3, 0.42);
    const budAngle = axisRad + (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
    parts.push({
      shape: "sphere",
      operation: "union",
      position: [
        bx + Math.cos(budAngle) * (r2 * 0.48),
        by + Math.sin(budAngle) * (r2 * 0.48),
        0,
      ],
      scale: [budRad, budRad, budRad],
      rotation: [0, 0, 0],
    });
  }

  return {
    name: "Binary Fusion",
    parts,
    blend: Number(rand(0.28, 0.34).toFixed(2)),
  };
}

/**
 * 4. TREFOIL / TRILOBE BLOSSOM
 * Models a 3-harmonic polar surface tension mode:
 * Three balanced radial lobes at 120° intervals around a central pool.
 */
function buildTrilobe(): { name: string; parts: InkPart[]; blend: number } {
  const parts: InkPart[] = [];
  const baseRot = rand(-Math.PI, Math.PI);
  const coreSize = rand(1.18, 1.32);

  // Central hub
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [0, 0, 0],
    scale: [coreSize, coreSize, coreSize * 0.88],
    rotation: [0, 0, normDeg((baseRot * 180) / Math.PI)],
  });

  // 3 radial lobes at 120-degree intervals with deliberate harmonic spacing
  const lobeDist = rand(0.58, 0.72);
  for (let i = 0; i < 3; i++) {
    const angle = baseRot + (i * 2 * Math.PI) / 3 + rand(-0.12, 0.12);
    const lobeDiam = rand(0.75, 0.92);
    const useCapsule = i === 0 && Math.random() > 0.4;

    if (useCapsule) {
      const len = lobeDiam * 1.35;
      const diam = lobeDiam * 0.85;
      parts.push({
        shape: "capsule",
        operation: "union",
        position: [Math.cos(angle) * lobeDist, Math.sin(angle) * lobeDist, 0],
        scale: [diam, Math.max(diam, len), diam],
        rotation: [0, 0, normDeg((-angle * 180) / Math.PI + 90)],
      });
    } else {
      parts.push({
        shape: "sphere",
        operation: "union",
        position: [Math.cos(angle) * lobeDist, Math.sin(angle) * lobeDist, rand(-0.04, 0.04)],
        scale: [lobeDiam, lobeDiam * rand(0.95, 1.1), lobeDiam * 0.88],
        rotation: [0, 0, normDeg(rand(-30, 30))],
      });
    }
  }

  return {
    name: "Trefoil Clover",
    parts,
    blend: Number(rand(0.34, 0.42).toFixed(2)),
  };
}

/**
 * 5. CROWN SPLASH / VISCOUS FINGERING
 * Models high-velocity droplet impact crater:
 * Shallow central pool surrounded by 4-5 radiating droplet spikes/fingers.
 */
function buildSplash(): { name: string; parts: InkPart[]; blend: number } {
  const parts: InkPart[] = [];
  const coreSize = rand(1.25, 1.45);

  // Base impact pool
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [0, -0.04, 0],
    scale: [coreSize, coreSize * 0.88, coreSize * 0.85],
    rotation: [0, 0, 0],
  });

  // 4 to 5 directional fingers
  const fingerCount = Math.floor(rand(4, 5.99));
  const baseAngle = rand(0, Math.PI * 2);

  for (let i = 0; i < fingerCount; i++) {
    const angle = baseAngle + (i * 2 * Math.PI) / fingerCount + rand(-0.25, 0.25);
    const fingerLen = rand(0.72, 1.05);
    const fingerDiam = rand(0.38, 0.54);
    const dist = rand(0.48, 0.65);

    parts.push({
      shape: "capsule",
      operation: "union",
      position: [Math.cos(angle) * dist, Math.sin(angle) * dist, rand(-0.04, 0.04)],
      scale: [fingerDiam, Math.max(fingerDiam, fingerLen), fingerDiam],
      rotation: [normDeg(rand(-8, 8)), normDeg(rand(-8, 8)), normDeg((-angle * 180) / Math.PI + 90)],
    });
  }

  return {
    name: "Crown Splash",
    parts,
    blend: Number(rand(0.28, 0.35).toFixed(2)),
  };
}

/**
 * 6. ARCHED PEBBLE / NEPHROID BEAN
 * Models a river-worn obsidian pebble with smooth convex back and concave waist:
 * Two angled structural capsules with a secondary kidney lobe.
 */
function buildPebble(): { name: string; parts: InkPart[]; blend: number } {
  const parts: InkPart[] = [];
  const rot = rand(-35, 35);
  const rotRad = (rot * Math.PI) / 180;

  // Main arched body (capsule: scale.z === scale.x)
  const bodyDiam = rand(0.82, 0.98);
  const bodyLen = Math.max(bodyDiam, rand(1.45, 1.75));
  parts.push({
    shape: "capsule",
    operation: "union",
    position: [0, 0, 0],
    scale: [bodyDiam, bodyLen, bodyDiam],
    rotation: [0, 0, normDeg(rot)],
  });

  // Convex hump (offset to one side)
  const humpSide = Math.random() > 0.5 ? 1 : -1;
  const perpX = -Math.sin(rotRad) * humpSide;
  const perpY = Math.cos(rotRad) * humpSide;
  const humpDiam = rand(0.78, 0.94);

  parts.push({
    shape: "sphere",
    operation: "union",
    position: [perpX * 0.42, perpY * 0.42, 0],
    scale: [humpDiam, humpDiam * 1.12, humpDiam * 0.85],
    rotation: [0, 0, normDeg(rot + humpSide * 20)],
  });

  // Secondary tapered pole
  const poleDiam = rand(0.52, 0.7);
  parts.push({
    shape: "sphere",
    operation: "union",
    position: [Math.cos(rotRad) * 0.65, Math.sin(rotRad) * 0.65, 0],
    scale: [poleDiam, poleDiam, poleDiam * 0.85],
    rotation: [0, 0, 0],
  });

  return {
    name: "Arched Pebble",
    parts,
    blend: Number(rand(0.38, 0.46).toFixed(2)),
  };
}

const BUILDERS: Record<InkArchetype, () => { name: string; parts: InkPart[]; blend: number }> = {
  droplet: buildTeardrop,
  comma: buildComma,
  coalescence: buildCoalescence,
  trilobe: buildTrilobe,
  splash: buildSplash,
  pebble: buildPebble,
};

/**
 * Generate a mathematically decisive, physically plausible organic ink scene.
 */
export function generateRandomInkScene(
  archetypePreference?: InkArchetype,
): InkScene {
  const chosenArchetype: InkArchetype =
    archetypePreference && Object.hasOwn(BUILDERS, archetypePreference)
      ? archetypePreference
      : randChoice(Object.keys(BUILDERS) as InkArchetype[]);

  const builder = BUILDERS[chosenArchetype];
  const { name, parts, blend } = builder();

  // Strict clamp of maximum 8 parts
  const cappedParts = parts.slice(0, 8);

  const candidate: InkScene = {
    version: 1,
    name,
    blend,
    material: {
      color: "#08090b",
      roughness: Number(rand(0.16, 0.22).toFixed(2)),
      metalness: Number(rand(0.12, 0.18).toFixed(2)),
    },
    motion: {
      speed: Number(rand(0.32, 0.48).toFixed(2)),
      amplitude: Number(rand(0.06, 0.12).toFixed(3)),
      pointer: Number(rand(0.18, 0.32).toFixed(2)),
    },
    parts: cappedParts,
  };

  return parseInkScene(candidate);
}
