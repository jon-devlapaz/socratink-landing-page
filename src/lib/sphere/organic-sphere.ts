/*
  Port of the Socratink app's organic sphere (src/ui/effects/organic-sphere.ts),
  with the DOM-specific bits (`.alive-anchor`, `is-still` class) replaced by an
  explicit controller so React can drive it. Tuning constants are the app's D2 preset,
  retuned for the reference ink-blob look (pear/kidney silhouette, liquid gloss).
*/
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders";

const CAMERA = { fov: 52, z: 3.05 } as const;

type LightPreset = { color: string; intensity: number };

type Preset = {
  blackCore: number;
  hotRim: number;
  baseColor: string;
  specularColor: string;
  specularSoftness: number;
  specularRim: number;
  specularFill: number;
  displacementStrength: number;
  shapeBulb: number;
  shapeTail: number;
  fresnel: { offset: number; multiplier: number; power: number };
  lightA: LightPreset;
  lightB: LightPreset;
  lightC: LightPreset;
};

/** Ink on light paper — deep obsidian body with warm paper bounce. */
const PAPER: Preset = {
  blackCore: 0.84,
  hotRim: 0.14,
  baseColor: "#050505",
  specularColor: "#f5f2ec",
  specularSoftness: 26,
  specularRim: 58,
  specularFill: 14,
  displacementStrength: 0.072,
  shapeBulb: 0.2,
  shapeTail: 0.11,
  fresnel: { offset: -1.18, multiplier: 3.85, power: 2.15 },
  lightA: { color: "#08080a", intensity: 2.35 },
  lightB: { color: "#4a4742", intensity: 0.48 },
  lightC: { color: "#1a1918", intensity: 0.32 },
};

/**
 * Ink on dark ground — glossy liquid obsidian: soft upper-left specular,
 * elongated right rim, subtle bottom fill. Body stays deep black against charcoal.
 */
const INK: Preset = {
  blackCore: 0.92,
  hotRim: 0.38,
  baseColor: "#020202",
  specularColor: "#eceae6",
  specularSoftness: 20,
  specularRim: 46,
  specularFill: 11,
  displacementStrength: 0.065,
  shapeBulb: 0.22,
  shapeTail: 0.13,
  fresnel: { offset: -0.92, multiplier: 4.15, power: 1.82 },
  lightA: { color: "#0c0c0e", intensity: 1.85 },
  lightB: { color: "#d8d6d2", intensity: 0.82 },
  lightC: { color: "#3a3836", intensity: 0.38 },
};

export type SphereGround = "paper" | "ink";

const PRESETS: Record<SphereGround, Preset> = { paper: PAPER, ink: INK };

/** Upper-left key, right rim, bottom fill — matched to reference highlight placement. */
const LIGHT_A = new THREE.Vector3(-0.78, 0.88, 0.52).normalize();
const LIGHT_B = new THREE.Vector3(1.12, 0.12, 0.08).normalize();
const LIGHT_C = new THREE.Vector3(0.12, -0.72, 0.48).normalize();
const SHAPE_SCALE = new THREE.Vector3(1.14, 0.96, 0.9);

export type OrganicSphereController = Readonly<{
  /** 0 = resting breath, 1 = fully agitated (the app maps microphone level here). */
  setLevel(level: number): void;
  /** Freeze all motion (used for reduced-motion and hover-still). */
  setStill(still: boolean): void;
  destroy(): void;
}>;

function motionForLevel(preset: Preset, level: number) {
  const n = Math.min(1, Math.max(0, level));
  return {
    displacement: preset.displacementStrength + n * 0.14,
    distortion: 0.58 + n * 0.32,
    timeScale: 0.28 + n * 0.85,
  };
}

export type OrganicSphereOptions = {
  /** Extra render resolution for when the element is scaled up with CSS transforms. */
  oversample?: number;
  ground?: SphereGround;
};

export function mountOrganicSphere(
  mount: HTMLElement,
  { oversample = 1, ground = "paper" }: OrganicSphereOptions = {},
): OrganicSphereController {
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
  const material = new THREE.ShaderMaterial({
    defines: { USE_TANGENT: "" },
    vertexShader,
    fragmentShader,
    uniforms: {
      uLightAColor: { value: new THREE.Color(D2.lightA.color) },
      uLightAPosition: { value: LIGHT_A.clone() },
      uLightAIntensity: { value: D2.lightA.intensity },
      uLightBColor: { value: new THREE.Color(D2.lightB.color) },
      uLightBPosition: { value: LIGHT_B.clone() },
      uLightBIntensity: { value: D2.lightB.intensity },
      uLightCColor: { value: new THREE.Color(D2.lightC.color) },
      uLightCPosition: { value: LIGHT_C.clone() },
      uLightCIntensity: { value: D2.lightC.intensity },
      uSpecularColor: { value: new THREE.Color(D2.specularColor) },
      uSpecularSoftness: { value: D2.specularSoftness },
      uSpecularRim: { value: D2.specularRim },
      uSpecularFill: { value: D2.specularFill },
      uBaseColor: { value: new THREE.Color(D2.baseColor) },
      uShapeScale: { value: SHAPE_SCALE.clone() },
      uShapeBulb: { value: D2.shapeBulb },
      uShapeTail: { value: D2.shapeTail },
      uSubdivision: { value: new THREE.Vector2(320, 320) },
      uOffset: { value: new THREE.Vector3(0.18, -0.12, 0.24) },
      uDistortionFrequency: { value: 1.42 },
      uDistortionStrength: { value: 0.58 },
      uDisplacementFrequency: { value: 1.95 },
      uDisplacementStrength: { value: D2.displacementStrength },
      uFresnelOffset: { value: D2.fresnel.offset },
      uFresnelMultiplier: { value: D2.fresnel.multiplier },
      uFresnelPower: { value: D2.fresnel.power },
      uBlackCore: { value: D2.blackCore },
      uHotRim: { value: D2.hotRim },
      uTime: { value: 2.4 },
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = -0.42;
  mesh.rotation.z = 0.06;
  scene.add(mesh);

  const timeUniform = material.uniforms.uTime!;
  const offsetUniform = material.uniforms.uOffset!;
  const displacement = material.uniforms.uDisplacementStrength!;
  const distortion = material.uniforms.uDistortionStrength!;

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
    const motion = motionForLevel(D2, level);
    const ease = 1 - Math.exp(-dt * 10);
    displacement.value += ((frozen ? D2.displacementStrength * 0.92 : motion.displacement) - displacement.value) * ease;
    distortion.value += ((frozen ? 0 : motion.distortion) - distortion.value) * ease;
    if (!frozen) {
      timeUniform.value += dt * motion.timeScale;
      const t = timeUniform.value;
      drift.set(Math.sin(t * 0.11), Math.cos(t * 0.08), Math.sin(t * 0.06)).multiplyScalar(dt * 0.14);
      offsetUniform.value.add(drift);
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

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
    destroy() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
