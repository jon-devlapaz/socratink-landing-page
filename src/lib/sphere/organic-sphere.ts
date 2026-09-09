/*
  Port of the Socratink app's organic sphere (src/ui/effects/organic-sphere.ts),
  with the DOM-specific bits (`.alive-anchor`, `is-still` class) replaced by an
  explicit controller so React can drive it. Tuning constants are the app's D2 preset.
*/
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders";

const CAMERA = { fov: 55, z: 3.25 } as const;

type Preset = {
  blackCore: number;
  hotRim: number;
  displacementStrength: number;
  fresnel: { offset: number; multiplier: number; power: number };
  lightA: { color: string; intensity: number };
  lightB: { color: string; intensity: number };
};

/** The app's D2 preset: ink on light paper. */
const PAPER: Preset = {
  blackCore: 0.7,
  hotRim: 0.12,
  displacementStrength: 0.08,
  fresnel: { offset: -1.15, multiplier: 3.6, power: 2.1 },
  lightA: { color: "#0c0c0e", intensity: 2.2 },
  lightB: { color: "#d2c6b2", intensity: 0.4 },
};

/**
 * Same sphere on dark paper. The black core would vanish into the ground, so the
 * warm rim light is stronger and a faint cool fill gives the body some form, so
 * it reads as an eclipse rather than a hole.
 */
const INK: Preset = {
  ...PAPER,
  hotRim: 0.42,
  fresnel: { offset: -1.05, multiplier: 3.6, power: 2.0 },
  lightA: { color: "#2a2826", intensity: 1.6 },
  lightB: { color: "#d2c6b2", intensity: 1.15 },
};

export type SphereGround = "paper" | "ink";

export type SphereShape =
  | "sphere"
  | "checkbox"
  | "fingerprint"
  | "seal"
  | "code"
  | "lens";

export const SHAPE_MAP: Record<string, number> = {
  sphere: 0,
  checkbox: 1,
  fingerprint: 2,
  seal: 3,
  code: 4,
  lens: 5,
  // aliases
  ring: 2,
  pill: 3,
  star: 4,
};

export const SHAPES_ORDER: SphereShape[] = [
  "sphere",
  "checkbox",
  "fingerprint",
  "seal",
  "code",
  "lens",
];

const PRESETS: Record<SphereGround, Preset> = { paper: PAPER, ink: INK };

export type OrganicSphereController = Readonly<{
  /** 0 = resting breath, 1 = fully agitated (the app maps microphone level here). */
  setLevel(level: number): void;
  /** Freeze all motion (used for reduced-motion and hover-still). */
  setStill(still: boolean): void;
  /** Morph into a target shape (sphere, checkbox, ring, pill, star). */
  setShape(shape: SphereShape | number, morphAmount?: number): void;
  /** Advance immediately to the next shape in the organic loop. */
  nextShape(): void;
  /** Current active shape name, index, and morph state. */
  getCurrentShape(): { name: SphereShape; index: number; isMorphing: boolean };
  destroy(): void;
}>;

const sharedMotion = { displacement: 0, distortion: 0, timeScale: 0 };
function updateMotionForLevel(preset: Preset, level: number) {
  const n = Math.min(1, Math.max(0, level));
  sharedMotion.displacement = preset.displacementStrength + n * 0.16;
  sharedMotion.distortion = 0.65 + n * 0.35;
  sharedMotion.timeScale = 0.3 + n * 0.9;
  return sharedMotion;
}

export type OrganicSphereOptions = {
  /** Extra render resolution for when the element is scaled up with CSS transforms. */
  oversample?: number;
  ground?: SphereGround;
  /** Automatically cycle through shapes organically as an ambient loop. Defaults to true. */
  autoCycle?: boolean;
  /** Seconds to hold each morphed shape before transitioning. Defaults to 2.8. */
  holdDuration?: number;
  /** Seconds for the morph transition between shapes. Defaults to 1.4. */
  transitionDuration?: number;
  /** Initial shape to display. Defaults to sphere. */
  initialShape?: SphereShape | number;
};

export function mountOrganicSphere(
  mount: HTMLElement,
  options: OrganicSphereOptions = {},
): OrganicSphereController {
  const { oversample = 1, ground = "paper" } = options;
  const D2 = PRESETS[ground];
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 80);
  camera.position.z = CAMERA.z;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 2) * oversample, 3));
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.replaceChildren(renderer.domElement);

  const geometry = new THREE.SphereGeometry(1, 320, 320);
  geometry.computeTangents();
  const lightAPosition = new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, 0.615, 2.049));
  const lightBPosition = new THREE.Vector3().setFromSpherical(new THREE.Spherical(1, 2.561, -1.844));
  const material = new THREE.ShaderMaterial({
    defines: { USE_TANGENT: "" },
    vertexShader,
    fragmentShader,
    uniforms: {
      uLightAColor: { value: new THREE.Color(D2.lightA.color) },
      uLightAPosition: { value: lightAPosition },
      uLightAIntensity: { value: D2.lightA.intensity },
      uLightBColor: { value: new THREE.Color(D2.lightB.color) },
      uLightBPosition: { value: lightBPosition },
      uLightBIntensity: { value: D2.lightB.intensity },
      uSubdivision: { value: new THREE.Vector2(320, 320) },
      uOffset: { value: new THREE.Vector3() },
      uDistortionFrequency: { value: 1.5 },
      uDistortionStrength: { value: 0.65 },
      uDisplacementFrequency: { value: 2.12 },
      uDisplacementStrength: { value: D2.displacementStrength },
      uFresnelOffset: { value: D2.fresnel.offset },
      uFresnelMultiplier: { value: D2.fresnel.multiplier },
      uFresnelPower: { value: D2.fresnel.power },
      uBlackCore: { value: D2.blackCore },
      uHotRim: { value: D2.hotRim },
      uTime: { value: Math.random() * 10 },
      uMorphFrom: { value: 0 },
      uMorphTo: { value: 0 },
      uMorphProgress: { value: 0 },
    },
  });
  scene.add(new THREE.Mesh(geometry, material));

  const timeUniform = material.uniforms.uTime!;
  const offsetUniform = material.uniforms.uOffset!;
  const displacement = material.uniforms.uDisplacementStrength!;
  const distortion = material.uniforms.uDistortionStrength!;
  const morphFromUniform = material.uniforms.uMorphFrom!;
  const morphToUniform = material.uniforms.uMorphTo!;
  const morphProgressUniform = material.uniforms.uMorphProgress!;

  const resize = () => {
    // Layout size, not the bounding rect: the mount may be under a CSS transform.
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let frame = 0;
  let previous = performance.now();
  let level = 0;
  let targetLevel = 0;
  let still = false;
  let visible = true;
  const drift = new THREE.Vector3();

  // Morph loop state
  const initialIdx = options.initialShape !== undefined
    ? (typeof options.initialShape === "string" ? (SHAPE_MAP[options.initialShape] ?? 0) : options.initialShape)
    : 0;
  let currentShapeIdx = initialIdx;
  let targetShapeIdx = initialIdx;
  let morphProgress = initialIdx !== 0 ? 1.0 : 0.0;
  let isMorphing = false;
  let holdTimer = 0;
  let autoCycleEnabled = options.autoCycle ?? true;
  const holdDuration = options.holdDuration ?? 2.8;
  const transitionDuration = options.transitionDuration ?? 1.4;

  const render = (now: number) => {
    if (!visible || document.hidden) {
      frame = 0;
      return;
    }
    const dt = Math.min(now - previous, 60) / 1000;
    previous = now;
    // Rise quickly, settle slowly: the same asymmetry the app uses for voice.
    const levelEase = 1 - Math.exp(-dt * (targetLevel > level ? 18 : 5));
    level += (targetLevel - level) * levelEase;

    const frozen = still || mount.classList.contains("is-still");

    // Autonomous organic morph cycle
    if (!frozen && autoCycleEnabled) {
      if (isMorphing) {
        morphProgress += dt / transitionDuration;
        if (morphProgress >= 1.0) {
          morphProgress = 1.0;
          currentShapeIdx = targetShapeIdx;
          isMorphing = false;
          holdTimer = 0;
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("socratink:orb-shape", {
                detail: {
                  shape: SHAPES_ORDER[currentShapeIdx],
                  index: currentShapeIdx,
                },
              }),
            );
          }
        }
      } else {
        holdTimer += dt;
        if (holdTimer >= holdDuration) {
          targetShapeIdx = (currentShapeIdx + 1) % SHAPES_ORDER.length;
          isMorphing = true;
          morphProgress = 0.0;
        }
      }
    }

    morphFromUniform.value = currentShapeIdx;
    morphToUniform.value = isMorphing ? targetShapeIdx : currentShapeIdx;
    morphProgressUniform.value = isMorphing ? morphProgress : 0.0;

    const motion = updateMotionForLevel(D2, level);
    const ease = 1 - Math.exp(-dt * 10);
    displacement.value += ((frozen ? 0 : motion.displacement) - displacement.value) * ease;
    distortion.value += ((frozen ? 0 : motion.distortion) - distortion.value) * ease;
    if (!frozen) {
      timeUniform.value += dt * motion.timeScale;
      const t = timeUniform.value;
      drift.set(Math.sin(t * 0.13), Math.cos(t * 0.09), Math.sin(t * 0.07)).multiplyScalar(dt * 0.18);
      offsetUniform.value.add(drift);
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const onContextRestored = () => {
    if (visible && !document.hidden && frame === 0) {
      previous = performance.now();
      frame = requestAnimationFrame(render);
    }
  };

  renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);
  renderer.domElement.addEventListener("webglcontextrestored", onContextRestored, false);

  // Don't burn GPU on spheres that have scrolled away.
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && frame === 0) {
        previous = performance.now();
        frame = requestAnimationFrame(render);
      }
    },
    { rootMargin: "20%" },
  );
  intersection.observe(mount);

  const onVisibilityChange = () => {
    if (!document.hidden && visible && frame === 0) {
      previous = performance.now();
      frame = requestAnimationFrame(render);
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    setLevel(next) {
      targetLevel = Math.min(1, Math.max(0, next));
    },
    setStill(next) {
      still = next;
    },
    setShape(shape, morphAmount) {
      const targetIdx = typeof shape === "string" ? (SHAPE_MAP[shape] ?? 0) : shape;
      if (morphAmount !== undefined) {
        autoCycleEnabled = false;
        if (morphAmount >= 1.0) {
          currentShapeIdx = targetIdx;
          targetShapeIdx = targetIdx;
          isMorphing = false;
          morphProgress = 1.0;
        } else {
          currentShapeIdx = 0;
          targetShapeIdx = targetIdx;
          isMorphing = true;
          morphProgress = morphAmount;
        }
      } else if (targetIdx !== currentShapeIdx) {
        targetShapeIdx = targetIdx;
        isMorphing = true;
        morphProgress = 0.0;
        holdTimer = 0;
      }
    },
    nextShape() {
      const fromIdx = isMorphing ? targetShapeIdx : currentShapeIdx;
      currentShapeIdx = fromIdx;
      targetShapeIdx = (currentShapeIdx + 1) % SHAPES_ORDER.length;
      isMorphing = true;
      morphProgress = 0.0;
      holdTimer = 0;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("socratink:orb-click", {
            detail: {
              fromShape: SHAPES_ORDER[currentShapeIdx],
              toShape: SHAPES_ORDER[targetShapeIdx],
            },
          }),
        );
      }
    },
    getCurrentShape() {
      return {
        name: SHAPES_ORDER[currentShapeIdx],
        index: currentShapeIdx,
        isMorphing,
      };
    },
    destroy() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
