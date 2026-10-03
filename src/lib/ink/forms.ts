import type { InkPart, InkScene } from "./scene";

export const HERO_FORMS = [
  "sphere", "droplet", "ribbon", "crescent", "open circle", "branch", "confluence",
] as const;

// Every form is the same ordered strand. Moving its volumes preserves a body
// through the transition, including when the strand opens into a circle.
const VOLUMES = 12;

function volume(x: number, y: number, z: number, diameter: number): InkPart {
  return {
    shape: "sphere", operation: "union",
    position: [x, y, z], scale: [diameter, diameter, Math.max(0.06, diameter * 0.32)], rotation: [0, 0, 0],
  };
}

export function heroInkScene(form: number): InkScene {
  const name = HERO_FORMS[form] ?? "sphere";
  const parts = Array.from({ length: VOLUMES }, (_, i) => {
    const u = i / (VOLUMES - 1);
    const t = u * 2 - 1;
    switch (name) {
      case "sphere":
        // Wordmark disc: twelve coincident volumes so morphs still have a strand.
        return volume(0.12, -0.06, 0, 1.58);
      case "droplet":
        return volume(0.14 + 0.2 * u * u, -0.62 + u * 1.35, 0, 0.78 - 0.65 * u);
      case "ribbon": {
        const part = volume(0.3 * Math.sin(t * Math.PI), t * 0.86, 0, 0.22 + 0.19 * Math.sin(u * Math.PI));
        part.scale[1] *= 1.35;
        return part;
      }
      case "crescent": {
        const a = (0.3 + u * 1.36) * Math.PI;
        const part = volume(Math.cos(a) * 0.71 + 0.16, Math.sin(a) * 0.71, 0, 0.16 + 0.28 * Math.sin(u * Math.PI));
        part.scale[0] = 0.4;
        part.rotation[2] = (a * 180 / Math.PI + 90) % 180;
        return part;
      }
      case "open circle": {
        const a = (0.18 + u * 1.58) * Math.PI;
        const part = volume(Math.cos(a) * 0.78, Math.sin(a) * 0.81, 0, 0.11 + 0.2 * Math.sin(u * Math.PI));
        part.scale[0] = 0.43;
        part.rotation[2] = (a * 180 / Math.PI + 90) % 180;
        return part;
      }
      case "branch": {
        // Trace from the left tip to the root and back to the right tip.
        const side = t < 0 ? -1 : 1;
        const reach = Math.abs(t);
        return volume(side * 0.74 * reach + 0.16 * reach * reach, -0.56 + (side < 0 ? 1.03 : 1.42) * reach, 0, 0.48 - 0.34 * reach);
      }
      case "confluence":
        return volume(t * 0.8, -0.16 + 0.15 * Math.sin(t * 2.2), 0, 0.15 + 0.48 * Math.pow(Math.abs(t), 0.7));
    }
  });
  return {
    version: 1,
    name: `Hero ink: ${name}`,
    blend: 0.12,
    material: { color: "#100f0f", roughness: 0.74, metalness: 0 },
    motion: { speed: 0, amplitude: 0, pointer: 0.065 },
    parts,
  };
}
