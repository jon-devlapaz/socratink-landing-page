import * as THREE from "three";
import type { Theme } from "@/lib/theme";

// One texture contains the approved print. The other records when the brush reaches each pixel.
export function mountPine(mount: HTMLElement, onReady: (ready: boolean) => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  const canvas = renderer.domElement;
  const gl = renderer.getContext();
  canvas.style.cssText = "display:block;width:100%;height:100%";
  canvas.setAttribute("aria-hidden", "true");
  mount.replaceChildren(canvas);
  mount.dataset.inkReady = "false";

  const uniforms = {
    print: new THREE.Uniform<THREE.Texture | null>(null),
    arrival: new THREE.Uniform<THREE.Texture | null>(null),
    progress: new THREE.Uniform(0),
  };
  const material = new THREE.ShaderMaterial({
    uniforms, blending: THREE.NoBlending,
    vertexShader: `
      varying vec2 samplePoint;
      void main() {
        samplePoint = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: `
      varying vec2 samplePoint;
      uniform sampler2D print, arrival;
      uniform float progress;
      void main() {
        vec4 ink = texture2D(print, samplePoint);
        float time = texture2D(arrival, samplePoint).r;
        ink.a *= clamp((progress - time) * 128.0 + progress, 0.0, 1.0);
        gl_FragColor = vec4(ink.rgb * ink.a, ink.a);
      }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const textures = new Map<string, Promise<THREE.Texture>>();
  const loader = new THREE.TextureLoader();

  function texture(name: Theme | "reveal") {
    const cached = textures.get(name);
    if (cached) return cached;
    const loaded = loader.loadAsync(`/brand/ink-pine-${name}.webp`).catch(error => {
      textures.delete(name);
      throw error;
    });
    textures.set(name, loaded);
    return loaded;
  }

  let theme: Theme;
  let progress: number | undefined;
  let pendingProgram: WebGLProgram | undefined;
  let loaded = false;
  let frame = 0;
  let revision = 0;

  function fallback() {
    revision++;
    cancelAnimationFrame(frame);
    frame = 0;
    loaded = false;
    mount.dataset.inkReady = "false";
    onReady(false);
  }

  function draw() {
    frame = 0;
    if (progress === undefined) return;
    if (pendingProgram) {
      const parallel = gl.getExtension("KHR_parallel_shader_compile");
      if (parallel && !gl.getProgramParameter(pendingProgram, parallel.COMPLETION_STATUS_KHR)) {
        schedule();
        return;
      }
      if (!gl.getProgramParameter(pendingProgram, gl.LINK_STATUS)) {
        fallback();
        return;
      }
      pendingProgram = undefined;
    }
    uniforms.progress.value = progress;
    renderer.render(scene, camera);
    mount.dataset.inkProgress = progress.toFixed(3);
    mount.dataset.inkEntrance = progress === 1 ? "settled" : progress > 0 ? "entering" : "pending";
    if (mount.dataset.inkReady !== "true") {
      mount.dataset.inkReady = "true";
      onReady(true);
    }
  }

  function schedule() {
    if (!frame && loaded && progress !== undefined) frame = requestAnimationFrame(draw);
  }

  async function prepare(selected: Theme) {
    const request = ++revision;
    theme = selected;
    try {
      renderer.compile(scene, camera);
      const program = renderer.info.programs?.[0]?.program;
      if (!(program instanceof WebGLProgram)) throw new Error("Pine shader requires a linked program");
      const [print, arrival] = await Promise.all([texture(selected), texture("reveal")]);
      if (request !== revision || gl.isContextLost()) return;
      uniforms.print.value = print;
      uniforms.arrival.value = arrival;
      const { x: width, y: height } = print.source.getSize(new THREE.Vector3());
      renderer.setSize(width, height, false);
      pendingProgram = program;
      loaded = true;
      schedule();
    } catch {
      if (request === revision) fallback();
    }
  }

  const restored = () => { void prepare(theme); };
  canvas.addEventListener("webglcontextlost", fallback);
  canvas.addEventListener("webglcontextrestored", restored);
  return {
    setTheme: prepare,
    setEntranceProgress(value: number) {
      if (progress === value) return;
      progress = value;
      mount.dataset.inkTarget = value.toFixed(3);
      schedule();
    },
    destroy() {
      revision++;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", fallback);
      canvas.removeEventListener("webglcontextrestored", restored);
      for (const loaded of textures.values()) loaded.then(texture => texture.dispose(), () => {});
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      mount.dataset.inkReady = "false";
    },
  };
}
