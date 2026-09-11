import * as THREE from "three";
import Raymarcher, { type Entity } from "three-raymarcher";
import { type InkScene } from "./scene";
import {
  COALESCENCE_IMPULSE,
  isCoalescenceTransition,
  NO_KINEMATICS,
  resolveKinematicKind,
  sampleKinematics,
} from "./kinematics";

const operation = { union: 0, subtract: 1, intersect: 2 };
const rotation = (v: number[]) =>
  new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      ...(v.map(THREE.MathUtils.degToRad) as [number, number, number]),
    ),
  );

function createEnvironment(renderer: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color(0.025, 0.028, 0.033);
  const panels: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>[] =
    [];
  for (const [position, scale, strength] of [
    [[-3, 4, 1], [2.5, 2], 18],
    [[4, 1, 1], [0.7, 3], 10],
    [[-1, -3, 1], [2, 0.5], 4],
  ] as const) {
    const panel = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(strength, strength * 0.97, strength * 0.9),
        side: THREE.DoubleSide,
      }),
    );
    panel.scale.set(scale[0], scale[1], 1);
    panel.position.set(position[0], position[1], position[2]);
    panel.lookAt(0, 0, 0);
    room.add(panel);
    panels.push(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  panels.forEach((panel) => {
    panel.geometry.dispose();
    panel.material.dispose();
  });
  pmrem.dispose();
  return environment;
}

export function mountInk(
  mount: HTMLElement,
  initial: InkScene,
  onFrame?: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.z = 4.5;
  let environment = createEnvironment(renderer);
  const ink = new Raymarcher({
    envMap: environment.texture,
    envMapIntensity: 1.2,
    resolution: 1,
  });
  // The library defaults to a 0.05-unit march floor. Our ~2-unit ink forms
  // need finer sampling to avoid stepped highlights on their curved surface.
  ink.userData.raymarcher.material.defines.MIN_DISTANCE = "0.005";
  scene.add(ink);
  mount.replaceChildren(renderer.domElement);
  let recipe = structuredClone(initial);
  let entities: Entity[] = [];
  let targets: Entity[] = [];
  let time = 0;
  let frame = 0;
  let previous = 0;
  let visible = true;
  let lost = false;
  let destroyed = false;
  let frozen = false;
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let theme = "light";
  let renderCount = 0;
  let transition = 0;
  let requestedCount = 0;
  const origin = new THREE.Vector2();
  const nextPosition = new THREE.Vector3();
  const nextScale = new THREE.Vector3();
  const nextRotation = new THREE.Quaternion();
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const frameTimes: number[] = [];
  const motion = { ...recipe.motion };

  function setScene(next: InkScene) {
    const prevKind = resolveKinematicKind(recipe);
    recipe = structuredClone(next);
    frameTimes.length = 0;
    targets = next.parts.map((p) => ({
      shape: Raymarcher.shapes[p.shape],
      operation: operation[p.operation],
      position: new THREE.Vector3(...p.position),
      scale: new THREE.Vector3(...p.scale),
      rotation: rotation(p.rotation),
      color: new THREE.Color(next.material.color),
    }));
    requestedCount = targets.length;
    // New parts grow in; removed parts contract into the body before disposal.
    const count = Math.max(entities.length, targets.length);
    if (
      isCoalescenceTransition(prevKind, resolveKinematicKind(next)) &&
      !reduced
    ) {
      // Surface tension energy release upon coalescence: capillary rebound wave
      motion.amplitude = COALESCENCE_IMPULSE.amplitude;
      motion.speed = COALESCENCE_IMPULSE.speed;
    }
    const priorEntities = entities;
    entities = Array.from({ length: count }, (_, i) => {
      const target = targets[i];
      const prior = priorEntities[i];
      if (!target) {
        targets.push({
          ...prior,
          operation: 0,
          position: targets[0].position.clone(),
          scale: new THREE.Vector3(0.001, 0.001, 0.001),
          rotation: prior.rotation.clone(),
          color: targets[0].color.clone(),
        });
        return { ...prior, operation: 0 };
      }
      return {
        ...target,
        position: (prior?.position ?? target.position).clone(),
        scale: prior
          ? prior.scale.clone()
          : target.scale
              .clone()
              .multiplyScalar(priorEntities.length ? 0.001 : 1),
        rotation: (prior?.rotation ?? target.rotation).clone(),
        color: (prior?.color ?? target.color).clone(),
      };
    });
    ink.userData.layers = [entities];
    transition = 1.6;
    schedule();
  }
  function resize() {
    const width = mount.clientWidth,
      height = mount.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    schedule();
  }
  function draw(dt: number) {
    const moving = !frozen && !reduced;
    const ease = reduced ? 1 : 1 - Math.exp(-dt * 7);
    motion.speed = THREE.MathUtils.lerp(
      motion.speed,
      recipe.motion.speed,
      ease,
    );
    motion.amplitude = THREE.MathUtils.lerp(
      motion.amplitude,
      recipe.motion.amplitude,
      ease,
    );
    motion.pointer = THREE.MathUtils.lerp(
      motion.pointer,
      recipe.motion.pointer,
      ease,
    );
    if (moving) time += dt * motion.speed;
    if (!frozen) pointer.lerp(reduced ? origin : pointerTarget, ease);
    let extent = 1;
    const kinematicKind = resolveKinematicKind(recipe);
    entities.forEach((entity, i) => {
      const target = targets[i];
      const phase = i * 2.39996;
      const a = reduced ? 0 : motion.amplitude;

      let x = target.position.x + Math.sin(time * 0.8 + phase) * a;
      let y = target.position.y + Math.sin(time * 0.63 + phase * 1.3) * a;
      let z = target.position.z + Math.cos(time * 0.7 + phase) * a * 0.6;
      let scaleMult = 1 + Math.sin(time * 0.9 + phase) * a * 0.12;
      let scaleOverride: THREE.Vector3 | null = null;

      let sample: ReturnType<typeof sampleKinematics> = null;
      // Coupled multi-part kinematics evaluated through the isolated driver.
      if (kinematicKind !== NO_KINEMATICS) {
        sample = sampleKinematics(kinematicKind, {
          time,
          amplitude: a,
          index: i,
          partCount: targets.length,
          targetX: target.position.x,
          targetY: target.position.y,
          targetZ: target.position.z,
          targetScaleX: target.scale.x,
          targetScaleY: target.scale.y,
          targetScaleZ: target.scale.z,
          baseX: x,
          baseY: y,
          baseZ: z,
          baseScaleMult: scaleMult,
          pointerX: pointer.x,
          pointerY: pointer.y,
        });
        if (sample) {
          x = sample.x;
          y = sample.y;
          z = sample.z;
          scaleMult = sample.scaleMult;
          if (sample.scaleOverride) {
            scaleOverride = nextScale.set(...sample.scaleOverride);
          }
        }
      }

      entity.position.lerp(
        nextPosition.set(
          x + pointer.x * motion.pointer * (0.3 + i * 0.15),
          y + pointer.y * motion.pointer * (0.3 + i * 0.15),
          z,
        ),
        ease,
      );
      if (scaleOverride) {
        entity.scale.lerp(scaleOverride, ease);
      } else {
        entity.scale.lerp(
          nextScale.copy(target.scale).multiplyScalar(scaleMult),
          ease,
        );
      }
      let rotTarget = target.rotation;
      if (sample?.rotationDeg) {
        rotTarget = nextRotation.setFromEuler(
          new THREE.Euler(
            THREE.MathUtils.degToRad(sample.rotationDeg[0]),
            THREE.MathUtils.degToRad(sample.rotationDeg[1]),
            THREE.MathUtils.degToRad(sample.rotationDeg[2]),
            "XYZ",
          ),
        );
      }
      entity.rotation.slerp(rotTarget, ease);
      entity.color.lerp(target.color, ease);
      if (i < requestedCount)
        extent = Math.max(
          extent,
          target.position.length() + target.scale.length() * 0.5,
        );
    });
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      ((extent + 0.2) / Math.sin(THREE.MathUtils.degToRad(19))) * 1.02,
      ease,
    );
    ink.userData.blending = THREE.MathUtils.lerp(
      ink.userData.blending,
      recipe.blend,
      ease,
    );
    ink.userData.roughness = THREE.MathUtils.lerp(
      ink.userData.roughness,
      recipe.material.roughness,
      ease,
    );
    ink.userData.metalness = THREE.MathUtils.lerp(
      ink.userData.metalness,
      recipe.material.metalness,
      ease,
    );
    ink.userData.envMapIntensity = theme === "dark" ? 1.55 : 1.2;
    renderer.render(scene, camera);
    renderCount++;
    onFrame?.();
  }
  function animate(now: number) {
    frame = 0;
    if (destroyed || lost || !visible || document.hidden) return;
    const elapsed = previous ? now - previous : 16.67;
    previous = now;
    if (elapsed < 250 && elapsed > 0) {
      frameTimes.push(elapsed);
      if (frameTimes.length > 240) frameTimes.shift();
    }
    const dt = Math.min(elapsed / 1000, 0.06);
    transition = reduced ? 0 : Math.max(0, transition - dt);
    if (transition === 0 && entities.length > requestedCount) {
      entities.length = requestedCount;
      targets.length = requestedCount;
    }
    draw(dt);
    if (
      (!frozen &&
        !reduced &&
        (motion.speed > 0 || pointer.distanceTo(pointerTarget) > 0.001)) ||
      transition > 0
    )
      schedule();
  }
  function schedule() {
    if (!frame && !destroyed && !lost && visible && !document.hidden)
      frame = requestAnimationFrame(animate);
  }
  function visibility() {
    previous = 0;
    schedule();
  }
  const observer = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = 0;
    schedule();
  });
  const pointerMove = (event: PointerEvent) => {
    const rect = mount.getBoundingClientRect();
    pointerTarget.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
    transition = 0.8;
    schedule();
  };
  const pointerLeave = () => {
    pointerTarget.set(0, 0);
    transition = 1;
    schedule();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    mount.dataset.inkReady = "false";
  };
  const contextRestored = () => {
    environment.dispose();
    environment = createEnvironment(renderer);
    ink.userData.envMap = environment.texture;
    lost = false;
    previous = 0;
    transition = 1;
    schedule();
  };
  observer.observe(mount);
  intersection.observe(mount);
  mount.addEventListener("pointermove", pointerMove);
  mount.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", visibility);
  setScene(initial);
  resize();
  return {
    setScene,
    setTheme(value: string) {
      theme = value;
      transition = 1;
      schedule();
    },
    setReduced(value: boolean) {
      reduced = value;
      transition = 1;
      schedule();
    },
    setPaused(value: boolean) {
      frozen = value;
      transition = 1;
      previous = 0;
      schedule();
    },
    capture() {
      if (lost || destroyed)
        throw new Error(
          "Renderer unavailable; retry when ink_get_scene reports ready.",
        );
      draw(0);
      return renderer.domElement.toDataURL("image/png");
    },
    inspect() {
      const sorted = frameTimes.slice().sort((a, b) => a - b);
      return {
        renderer: "three-raymarcher",
        transitioning: transition > 0,
        ready: renderCount > 0 && !lost,
        paused: frozen,
        reducedMotion: reduced,
        visible,
        time,
        frames: renderCount,
        canvas: [renderer.domElement.width, renderer.domElement.height],
        resolution: ink.userData.resolution,
        frameP50: sorted[Math.floor(sorted.length * 0.5)] ?? null,
        frameP95: sorted[Math.floor(sorted.length * 0.95)] ?? null,
      };
    },
    setResolution(value: number) {
      ink.userData.resolution = value;
      transition = 1;
      frameTimes.length = 0;
      schedule();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      mount.removeEventListener("pointermove", pointerMove);
      mount.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      ink.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
export type InkRenderer = ReturnType<typeof mountInk>;
