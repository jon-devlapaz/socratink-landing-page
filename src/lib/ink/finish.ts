import * as THREE from "three";

// three-raymarcher splices its lighting into a RawShaderMaterial as GLSL
// text, so the ink finish is a source patch on that string.
const INK_UNIFORMS = `
uniform float roughness;
uniform float time;
uniform vec3 paper;
uniform vec3 pigment;
uniform float bleed;
uniform float morph;
uniform int morphSplit;
uniform float living;
uniform vec2 pointer;
uniform float impulse;
uniform float surfaceMotion;
uniform float surfaceStrength;
uniform float motionTime;
uniform float revealEnabled;
uniform vec4 inkReveal[MAX_ENTITIES];

float inkNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec4 n = sin(vec4(
    dot(i, vec2(127.1, 311.7)),
    dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7)),
    dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7)),
    dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))
  )) * 43758.5453;
  n = fract(n);
  return mix(mix(n.x, n.y, f.x), mix(n.z, n.w, f.x), f.y);
}

float skin(const in vec3 p) {
  return 0.003 * (
    sin(p.x * 4.1 + time * 0.7) * sin(p.y * 3.7 - time * 0.5)
    + 0.5 * sin((p.x + p.y) * 5.3 + p.z * 2.0 + time * 0.9)
  );
}

// An underdamped step: hesitates, overshoots by ~5%, settles exactly by 1.
float spring(const in float c) {
  float s = 1.0 - exp(-4.5 * c) * (cos(4.7 * c) + 0.96 * sin(4.7 * c));
  return mix(s, 1.0, smoothstep(0.75, 1.0, c));
}
`;

// The library's map() becomes mapParts() over an index range so one body can
// hold two anatomies: the parts it had (before morphSplit) and the parts it is
// becoming. Distances mix, so a C's hole fills as this drop, not a dissolve,
// and no extra ink gathers. The core leads, the rim lags, a spring overshoots,
// and the skin swells along the moving front.
const PARTS_SIGNATURE = `SDF map(const in vec3 p) {
  SDF scene = sdEntity(p, entities[0]);
  for (int i = 1, l = min(numEntities, MAX_ENTITIES); i < l; i++) {`;
const PARTS_RANGE = `SDF inkEntity(const in vec3 p, const in int index) {
  SDF ink = sdEntity(p, entities[index]);
  if (revealEnabled > 0.0) {
    vec4 reveal = inkReveal[index];
    if (reveal.w <= 0.0) return SDF(1000.0, ink.color);
    if (reveal.w < 1.0) {
      // Reveal the intact form; collapsing an ellipsoid makes its SDF unstable.
      vec3 local = applyQuaternion(p - entities[index].position, normalize(entities[index].rotation));
      float extent = dot(entities[index].scale, abs(reveal.xyz)) * 0.5;
      float edge = mix(-extent, extent, reveal.w);
      ink.distance = max(ink.distance, dot(local, reveal.xyz) - edge);
    }
  }
  return ink;
}

SDF mapParts(const in vec3 p, const in int first, const in int end) {
  SDF scene = inkEntity(p, first);
  for (int i = first + 1, l = min(end, MAX_ENTITIES); i < l; i++) {`;

const INK_MAP = `
SDF map(const in vec3 position) {
  vec3 p = position;
  // One continuous deformation field: an inhale lifts the shoulder while
  // the belly yields. The pointer draws the upper surface with a soft lag.
  float breath = sin(time * 1.15) + 0.22 * sin(time * 2.3 - 0.6);
  float stretch = 1.0 + living * (0.012 * breath + 0.012 * impulse);
  p.y /= stretch;
  p.xz *= sqrt(stretch);
  float turn = living * (0.025 * sin(time * 0.47) + p.y * 0.018 * sin(time * 0.61));
  p.xy = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * p.xy;
  p.x -= living * (0.055 * sin(p.y * 2.1 + time * 0.82) + pointer.x * (0.3 + 0.22 * p.y));
  p.y -= living * (0.035 * sin(p.x * 2.5 - time * 0.67) + pointer.y * 0.35);
  if (surfaceMotion > 0.0) {
    // A shared breath and a small, delayed lean toward attention. Keep the
    // articulated silhouettes steady while their skin remains responsive.
    float inhale = 1.0 + 0.009 * sin(motionTime * 0.57);
    p.y /= inhale;
    p.xz *= sqrt(inhale);
    p.x -= pointer.x * (0.42 + 0.1 * p.y);
    p.y -= pointer.y * 0.32;
  }
  float voice = 0.0;
  float voiceHead = 0.0;
  if (surfaceMotion == 1.0) {
    // One bulge travels left to right through the stroke, then the whole
    // ribbon takes a breath. No extra humps along the body.
    float t = mod(motionTime, 8.0);
    float headX = mix(-1.55, 1.65, saturate(t / 5.8));
    float envelope = smoothstep(0.0, 0.55, t) * (1.0 - smoothstep(5.3, 6.4, t));
    voiceHead = p.x - headX;
    float soften = 1.0 - 0.65 * smoothstep(0.15, 1.05, p.x);
    voice = surfaceStrength * envelope * soften * exp(-voiceHead * voiceHead / 0.16);
    p.y -= voice * 0.016;
    voice += surfaceStrength * 0.13 * exp(-(t - 6.6) * (t - 6.6) / 0.4)
      * (1.0 - smoothstep(7.2, 8.0, t));
  }
  SDF scene;
  if (morphSplit > 0) {
    SDF was = mapParts(p, 0, morphSplit);
    SDF will = mapParts(p, morphSplit, numEntities);
    float r = length(p);
    float lag = saturate(r * 0.55 + 0.1 * sin(p.x * 2.2 + p.y * 1.7 + p.z * 2.0));
    float c = saturate(morph * 1.45 - 0.42 * lag);
    float s = spring(c);
    float swell = 0.07 * sin(PI * s) * (0.7 + 0.3 * saturate(1.0 - r * 0.45));
    scene = SDF(
      (mix(was.distance, will.distance, s) - swell) * 0.65,
      mix(was.color, will.color, s)
    );
  } else {
    scene = mapParts(p, 0, numEntities);
  }
  scene.distance += skin(p) + (inkNoise(p.xy * 72.0) - 0.5) * 0.003;
  if (surfaceMotion == 1.0) {
    scene.distance -= voice * 0.07;
  }
  if (surfaceMotion == 2.0) {
    // A viscous swell climbs the pooled body, then the whole drop takes a
    // breath. The skin stays a wet meniscus — no carved grooves.
    float t = mod(motionTime, 10.0);
    float head = mix(-0.95, 1.05, saturate(t / 6.4));
    float envelope = smoothstep(0.0, 0.7, t) * (1.0 - smoothstep(6.2, 7.6, t));
    float d = p.y - head;
    float swell = envelope * exp(-d * d / 0.18);
    float breath = 0.12 * exp(-(t - 8.4) * (t - 8.4) / 0.55)
      * (1.0 - smoothstep(9.2, 10.0, t));
    scene.distance -= surfaceStrength * (0.055 * swell + 0.028 * breath);
  }
  if (surfaceMotion == 3.0) {
    float t = mod(motionTime, 8.0);
    float head = mix(-1.35, 1.65, saturate(t / 5.4));
    float envelope = smoothstep(0.0, 0.5, t) * (1.0 - smoothstep(5.3, 6.5, t));
    float d = p.y + 0.12 * p.x - head;
    scene.distance -= surfaceStrength * envelope * 0.04 * exp(-d * d / 0.1);
  }
  scene.distance *= 1.0 - living * 0.18;
  // Ripple slopes need a shorter conservative march to keep their skin intact.
  if (surfaceMotion > 0.0) scene.distance *= 0.72;
  return scene;
}

vec3 getNormal(`;

const PBR_SIGNATURE =
  "vec3 getLight(const in vec3 position, const in vec3 normal, const in vec3 diffuse) {\n  PhysicalMaterial";
const PBR_RETURN =
  "  return reflectedLight.indirectDiffuse + reflectedLight.indirectSpecular;\n}\n";

// Uneven pigment and paper tooth, not a reflection of a studio light.
const INK_LIGHT = `${PBR_RETURN}
vec3 getLight(const in vec3 position, const in vec3 normal, const in vec3 diffuse) {
  vec3 viewDir = normalize(cameraPosition - position);
  float grazing = 1.0 - saturate(dot(normal, viewDir));
  vec2 p = position.xy;
  float cloud = inkNoise(p * 2.8 + vec2(3.2, 7.1)) * 0.6
    + inkNoise(p * 7.5) * 0.28 + inkNoise(p * 19.0) * 0.12;
  float tooth = inkNoise(p * 240.0);
  float wash = smoothstep(-0.65, 0.85, p.y + p.x * 0.32);
  float density = 0.96 - wash * (0.3 + cloud * 0.25)
    - pow(grazing, 2.4) * bleed + (tooth - 0.5) * 0.055;
  vec4 ground = sRGBTransferOETF(vec4(paper, 1.0));
  vec4 ink = sRGBTransferOETF(vec4(pigment, 1.0));
  return sRGBTransferEOTF(mix(ground, ink, clamp(density, 0.18, 0.99))).rgb;
}
`;

export function applyInkFinish(material: THREE.RawShaderMaterial) {
  const finish = {
    time: { value: 0 },
    paper: { value: new THREE.Color() },
    pigment: { value: new THREE.Color() },
    bleed: { value: 0 },
    morph: { value: 1 },
    morphSplit: { value: 0 },
    living: { value: 0 },
    pointer: { value: new THREE.Vector2() },
    impulse: { value: 0 },
    surfaceMotion: { value: 0 },
    surfaceStrength: { value: 1 },
    motionTime: { value: 0 },
    revealEnabled: { value: 0 },
    inkReveal: { value: [] as THREE.Vector4[] },
  };
  Object.assign(material.uniforms, finish);
  material.fragmentShader = material.fragmentShader
    .replace("uniform float roughness;", INK_UNIFORMS)
    .replace(PARTS_SIGNATURE, PARTS_RANGE)
    .replaceAll("sdEntity(p, entities[i])", "inkEntity(p, i)")
    .replace("vec3 getNormal(", INK_MAP)
    .replace(PBR_SIGNATURE, PBR_SIGNATURE.replace("getLight", "getLightPbr"))
    .replace(PBR_RETURN, INK_LIGHT);
  material.needsUpdate = true;
  return finish;
}
