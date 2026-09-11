/**
 * Isolated motion kinematics driver for the Living Ink renderer.
 *
 * The renderer evaluates per-part motion modifiers through this module via
 * the kinematic kind declared on the scene (`scene.kinematics`). It never
 * sniffs semantic scene names. All coupled multi-part math lives here, so
 * the render loop stays a thin integrator.
 */

export const NO_KINEMATICS = "none" as const;
export const STOKES_BRIDGE_KINEMATICS = "stokes-bridge" as const;
export const RESPIRATION_KINEMATICS = "respiration" as const;
export const VORTEX_KINEMATICS = "vortex" as const;
export const PULSE_KINEMATICS = "pulse" as const;
export const SERPENTINE_KINEMATICS = "serpentine" as const;

export const INK_KINEMATIC_KINDS = [
  NO_KINEMATICS,
  STOKES_BRIDGE_KINEMATICS,
  RESPIRATION_KINEMATICS,
  VORTEX_KINEMATICS,
  PULSE_KINEMATICS,
  SERPENTINE_KINEMATICS,
] as const;

export type InkKinematicKind = (typeof INK_KINEMATIC_KINDS)[number];

export interface KinematicSceneLike {
  readonly kinematics?: unknown;
}

/** Metadata-first resolution: unknown or absent kinds fall back to "none". */
export function resolveKinematicKind(
  scene: KinematicSceneLike | null | undefined,
): InkKinematicKind {
  const k = scene?.kinematics;
  if (
    typeof k === "string" &&
    (INK_KINEMATIC_KINDS as readonly string[]).includes(k)
  ) {
    return k as InkKinematicKind;
  }
  return NO_KINEMATICS;
}

/** Surface-tension energy release applied when a bridge coalesces. */
export const COALESCENCE_IMPULSE = {
  amplitude: 0.085,
  speed: 1.05,
} as const;

/** True when leaving bridge kinematics for any non-bridge scene. */
export function isCoalescenceTransition(
  prevKind: InkKinematicKind,
  nextKind: InkKinematicKind,
): boolean {
  return (
    prevKind === STOKES_BRIDGE_KINEMATICS &&
    nextKind !== STOKES_BRIDGE_KINEMATICS
  );
}

export interface KinematicsSampleInput {
  time: number;
  /** Base motion amplitude (already gated to 0 under reduced motion). */
  amplitude: number;
  /** Index of the part within the render target list. */
  index: number;
  partCount: number;
  targetX: number;
  targetY: number;
  targetZ?: number;
  targetScaleX: number;
  targetScaleY: number;
  targetScaleZ?: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseScaleMult: number;
  pointerX?: number;
  pointerY?: number;
}

export interface KinematicsSample {
  x: number;
  y: number;
  z: number;
  scaleMult: number;
  scaleOverride: readonly [number, number, number] | null;
  rotationDeg?: readonly [number, number, number];
}

export type StokesBridgeSampleInput = KinematicsSampleInput;
export type StokesBridgeSample = KinematicsSample;

/**
 * 1. STOKES LIQUID BRIDGE:
 * Coupled Stokes liquid-bridge kinematics for deliberation scenes:
 * opposing capillary tug-of-war on the binary lobes (parts 0-1), an
 * anti-phase stretching/thinning capillary waist (part 2), and a buoyant
 * nascent-insight micro-droplet hover (part 3).
 */
export function sampleStokesBridge(
  input: KinematicsSampleInput,
): KinematicsSample | null {
  if (input.partCount < 3) return null;
  const { time, amplitude: a, index: i, baseZ: z } = input;
  let { baseX: x, baseY: y, baseScaleMult: scaleMult } = input;
  let scaleOverride: readonly [number, number, number] | null = null;

  const tugFreq = time * 1.6;
  const tugAmp = a * 1.85;
  if (i === 0) {
    // Primary left lobe pulls left and oscillates in opposition
    x = input.targetX - Math.sin(tugFreq) * tugAmp;
    y = input.targetY + Math.cos(tugFreq * 0.75) * a * 0.5;
    scaleMult = 1 + Math.sin(tugFreq) * 0.08;
  } else if (i === 1) {
    // Secondary right lobe pulls right in opposition
    x = input.targetX + Math.sin(tugFreq) * tugAmp;
    y = input.targetY - Math.cos(tugFreq * 0.75) * a * 0.5;
    scaleMult = 1 - Math.sin(tugFreq) * 0.08;
  } else if (i === 2) {
    // Capillary waist bridge: stretches and thins in anti-phase
    const stretch = Math.sin(tugFreq);
    const diamFactor = Math.max(0.65, 1 - stretch * 0.22);
    const lenFactor = Math.max(0.8, 1 + stretch * 0.28);
    scaleOverride = [
      input.targetScaleX * diamFactor,
      input.targetScaleY * lenFactor,
      input.targetScaleX * diamFactor,
    ];
  } else if (i === 3) {
    // Nascent insight micro-droplet: buoyant high-frequency hover
    x = input.targetX + Math.cos(time * 1.8) * a * 0.8;
    y = input.targetY + Math.sin(time * 3.2) * a * 1.6;
  } else {
    // Multi-part sculpt support (e.g. Synaptic Bridge arches, tie-beams, and anchors)
    if (input.targetX < -0.15) {
      // Left shore components pull left in phase with primary lobe
      x = input.targetX - Math.sin(tugFreq) * tugAmp * 0.75;
      y = input.targetY + Math.cos(tugFreq * 0.75 + i * 0.3) * a * 0.4;
      scaleMult = 1 + Math.sin(tugFreq) * 0.06;
    } else if (input.targetX > 0.15) {
      // Right shore components pull right in phase with secondary lobe
      x = input.targetX + Math.sin(tugFreq) * tugAmp * 0.75;
      y = input.targetY - Math.cos(tugFreq * 0.75 + i * 0.3) * a * 0.4;
      scaleMult = 1 - Math.sin(tugFreq) * 0.06;
    } else {
      // Central span & keystone: buoyant vertical hover & anti-phase breathing
      x = input.targetX + Math.cos(time * 1.8 + i) * a * 0.5;
      y = input.targetY + Math.sin(time * 2.8 + i) * a * 1.1;
      scaleMult = 1 + Math.sin(time * 3.5 + i) * 0.08;
    }
  }

  return { x, y, z, scaleMult, scaleOverride };
}

/**
 * 2. RESPIRATION / THE BREATHING LOTUS:
 * Organic pulmonary inhalation and exhalation.
 * Part 0 (central nucleus) expands and lifts gently; parts 1..N (surrounding petals)
 * rhythmically blossom outward radially, elevate slightly on Z, and return in harmonic phase.
 */
export function sampleRespiration(
  input: KinematicsSampleInput,
): KinematicsSample | null {
  const { time, amplitude: a, index: i } = input;
  const tz = input.targetZ ?? 0;
  // Pulmonary rhythm: asymmetric sinusoidal wave (longer inhale, soft poise, relaxed exhale)
  const breathCycle = Math.sin(time * 1.25) + 0.3 * Math.sin(time * 2.5);
  const breath = breathCycle * Math.max(0.015, a);

  if (i === 0) {
    // Central nucleus breathes in volume
    const expand = 1 + breath * 1.2;
    return {
      x: input.targetX,
      y: input.targetY + breath * 0.35,
      z: tz + breath * 0.45,
      scaleMult: expand,
      scaleOverride: null,
    };
  }

  // Satellite petals/lobes blossom radially outward
  const blossom = 1 + breath * 1.8;
  const petalPhase = i * 1.2566; // 2pi / 5 for 5-petals
  const flutter = Math.sin(time * 2.2 + petalPhase) * a * 0.15;

  return {
    x: input.targetX * blossom + flutter,
    y: input.targetY * blossom,
    z: tz + breath * 0.75 + Math.cos(time * 2.2 + petalPhase) * a * 0.15,
    scaleMult: 1 + breath * 0.35,
    scaleOverride: null,
  };
}

/**
 * 3. CELESTIAL GYRE / ORBITAL VORTEX:
 * Liquid vorticity around a central inclined vortex axis with Keplerian velocity falloff.
 * Droplets stretch along their tangential orbital path, leaving shimmering specular streaks.
 */
export function sampleVortex(
  input: KinematicsSampleInput,
): KinematicsSample | null {
  const { time, amplitude: a, index: i } = input;
  const tz = input.targetZ ?? 0;
  const pX = input.pointerX ?? 0;
  const pY = input.pointerY ?? 0;
  const pointerDist = Math.hypot(pX, pY);

  // 1. Interactive Gravitational Pull & Spin Dynamics:
  // Moving the cursor accelerates the orbital swirl up to 2.6x
  const spinMult = 1.0 + Math.min(pointerDist * 1.8, 2.2);
  // Pointer gravitational attraction contracts the outer orbital radius up to 28%
  const gravityContraction = Math.max(0.72, 1.0 - pointerDist * 0.28);
  // Interactive 3D gyre tilt responsive to mouse
  const planeTilt = 0.46 + pY * 0.24;
  const planeYaw = pX * 0.32;

  if (i === 0) {
    // Vortex Eye (Obsidian Nucleus): slow axial precession influenced by cursor gravity
    const eyeSpeed = 0.8 * spinMult;
    return {
      x: input.targetX + pX * 0.14 + Math.sin(time * eyeSpeed) * a * 0.28,
      y: input.targetY + pY * 0.14 + Math.cos(time * (eyeSpeed * 0.85)) * a * 0.28,
      z: tz + Math.sin(time * eyeSpeed * 1.1) * a * 0.22,
      scaleMult: 1 + Math.sin(time * eyeSpeed * 1.4) * a * 0.14 + pointerDist * 0.08,
      scaleOverride: null,
    };
  }

  // 2. Accretion Streamers (Orbiting Droplets & Comet Tails)
  const r0 = Math.hypot(input.targetX, input.targetY);
  const baseRadius = Math.max(0.42, r0);
  const radius = baseRadius * gravityContraction;
  const theta0 = Math.atan2(input.targetY, input.targetX);

  // Keplerian velocity gradient (v ~ 1/sqrt(r)) amplified by spinMult
  const angularSpeed = (1.52 / Math.sqrt(radius + 0.32)) * spinMult;
  const theta = theta0 + time * angularSpeed;

  // 3D Orbital Trajectory
  const rawX = radius * Math.cos(theta);
  const rawY = radius * Math.sin(theta);
  
  // Apply inclination tilt and yaw
  const orbitX = rawX * Math.cos(planeYaw) - rawY * Math.sin(planeYaw) * Math.cos(planeTilt);
  const orbitY = rawY * Math.cos(planeTilt) + Math.sin(time * 2.1 + i) * a * 0.14;
  const orbitZ = rawX * Math.sin(planeYaw) + rawY * Math.sin(planeTilt) + Math.cos(time * 2.1 + i) * a * 0.22;

  // 3. Tangential Comet Tail Alignment:
  // Orient capsule along velocity tangent: angle in XY is -theta, tilted forward by planeTilt
  const rotZ = Number(((-theta * 180) / Math.PI).toFixed(1));
  const rotX = Number(((planeTilt * 180) / Math.PI).toFixed(1));
  const rotY = Number(((planeYaw * 180) / Math.PI).toFixed(1));

  // 4. Tidal Elongation / Streamer Taper:
  // Faster inner streamers or cursor-boosted streamers stretch into sleek liquid ribbon tails
  const tidalStretch = 1.0 + Math.min(1.4, (angularSpeed * a * 4.5) + (pointerDist * 0.35));
  const tidalThin = 1.0 / Math.sqrt(tidalStretch);

  const scaleOverride: readonly [number, number, number] = [
    Number((input.targetScaleX * tidalThin).toFixed(3)),
    Number((input.targetScaleY * tidalStretch).toFixed(3)),
    Number((input.targetScaleX * tidalThin).toFixed(3)),
  ];

  return {
    x: Number(orbitX.toFixed(3)),
    y: Number(orbitY.toFixed(3)),
    z: Number(orbitZ.toFixed(3)),
    scaleMult: 1,
    scaleOverride,
    rotationDeg: [rotX, rotY, rotZ],
  };
}

/**
 * 4. SYSTOLIC HEARTBEAT / CAPILLARY PULSE:
 * Realistic dual-beat cardiovascular impulse (ventricular systole + atrial recoil).
 * Strict volume conservation: vertical compression induces equatorial fluid bulge.
 * Floating crown droplet bounces with inertia in anti-phase.
 */
export function samplePulse(
  input: KinematicsSampleInput,
): KinematicsSample | null {
  const { time, amplitude: a, index: i } = input;
  const tz = input.targetZ ?? 0;

  // Cardiovascular dual-beat periodic rhythm ("lub-dub")
  const period = 4.2;
  const tau = (time * 1.45) % period;

  const beat1 = Math.exp(-22 * Math.pow(tau - 0.45, 2)) * 0.38;
  const beat2 = Math.exp(-28 * Math.pow(tau - 0.95, 2)) * 0.22;
  const impulse = (beat1 + beat2) * Math.max(0.2, a * 12);

  if (i === 0) {
    // Main body: compress vertically, bulge laterally (V = const => r^2 * h = 1)
    const compression = Math.max(0.65, 1 - impulse * 0.32);
    const bulge = Math.sqrt(1 / compression);
    const scaleOverride: readonly [number, number, number] = [
      input.targetScaleX * bulge,
      input.targetScaleY * compression,
      input.targetScaleX * bulge,
    ];
    return {
      x: input.targetX,
      y: input.targetY - impulse * 0.12,
      z: tz,
      scaleMult: 1,
      scaleOverride,
    };
  }

  if (i === 1) {
    // Apex crown droplet: inertial bounce upward lagging slightly behind pulse
    const bouncePhase = Math.sin((tau - 0.5) * 4) * Math.exp(-1.5 * Math.max(0, tau - 0.5));
    const bounceY = Math.max(0, bouncePhase) * impulse * 0.85;
    return {
      x: input.targetX,
      y: input.targetY + bounceY,
      z: tz + bounceY * 0.3,
      scaleMult: 1 + impulse * 0.25,
      scaleOverride: null,
    };
  }

  // Flanking beads
  const sidePhase = i === 2 ? 1 : -1;
  return {
    x: input.targetX + sidePhase * impulse * 0.18,
    y: input.targetY - impulse * 0.08,
    z: tz,
    scaleMult: 1 + impulse * 0.12,
    scaleOverride: null,
  };
}

/**
 * 5. CALLIGRAPHIC SERPENTINE WAVE:
 * Continuous kinetic wave propagating down a chain of fluid capsules.
 * Creates an undulating silk-ribbon motion in liquid ink.
 */
export function sampleSerpentine(
  input: KinematicsSampleInput,
): KinematicsSample | null {
  const { time, amplitude: a, index: i } = input;
  const tz = input.targetZ ?? 0;

  // Phase delay along the spine
  const phaseDelay = i * 0.72;
  const waveFreq = 2.1;
  const waveAmp = Math.max(0.02, a) * 1.6;

  const dx = Math.sin(time * waveFreq - phaseDelay) * waveAmp;
  const dy = Math.cos(time * waveFreq * 0.65 - phaseDelay * 0.8) * (waveAmp * 0.45);
  const dz = Math.sin(time * waveFreq * 1.15 - phaseDelay) * (waveAmp * 0.75);

  return {
    x: input.targetX + dx,
    y: input.targetY + dy,
    z: tz + dz,
    scaleMult: 1 + Math.sin(time * 2 + phaseDelay) * a * 0.15,
    scaleOverride: null,
  };
}

/** Unified kinematics dispatcher */
export function sampleKinematics(
  kind: InkKinematicKind,
  input: KinematicsSampleInput,
): KinematicsSample | null {
  switch (kind) {
    case STOKES_BRIDGE_KINEMATICS:
      return sampleStokesBridge(input);
    case RESPIRATION_KINEMATICS:
      return sampleRespiration(input);
    case VORTEX_KINEMATICS:
      return sampleVortex(input);
    case PULSE_KINEMATICS:
      return samplePulse(input);
    case SERPENTINE_KINEMATICS:
      return sampleSerpentine(input);
    default:
      return null;
  }
}
