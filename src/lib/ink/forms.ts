import type { InkPart, InkScene } from "./scene";

export const HERO_FORMS = [
  "sphere", "droplet", "ribbon", "crescent", "open circle", "branch", "confluence",
] as const;
export type HeroForm = (typeof HERO_FORMS)[number];

// Every form is the same ordered strand. Moving its volumes preserves a body
// through the transition, including when the strand opens into a circle.
const VOLUMES = 12;

function volume(x: number, y: number, z: number, diameter: number): InkPart {
  return {
    shape: "sphere", operation: "union",
    position: [x, y, z], scale: [diameter, diameter, diameter], rotation: [0, 0, 0],
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
        return volume(0, 0, 0, 1.7);
      case "droplet":
        return volume(0.16 * t * t, t * 0.59, 0.06 * Math.sin(u * Math.PI), 1.16 - 0.83 * u);
      case "ribbon":
        return volume(0.40 * Math.sin(t * Math.PI), t * 0.82, 0.14 * Math.cos(t * Math.PI), 0.56 + 0.12 * Math.sin(u * Math.PI));
      case "crescent": {
        const a = (0.28 + u * 1.44) * Math.PI;
        return volume(Math.cos(a) * 0.69 + 0.13, Math.sin(a) * 0.69, 0.08 * Math.sin(a * 2), 0.22 + 0.54 * Math.sin(u * Math.PI));
      }
      case "open circle": {
        const a = (0.18 + u * 1.64) * Math.PI;
        return volume(Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.12 * Math.sin(a), 0.46 + 0.16 * Math.sin(u * Math.PI));
      }
      case "branch": {
        // Trace from the left tip to the root and back to the right tip.
        const side = t < 0 ? -1 : 1;
        const reach = Math.abs(t);
        return volume(side * 0.74 * reach, -0.53 + 1.24 * reach, 0.10 * Math.sin(u * Math.PI), 0.76 - 0.38 * reach);
      }
      case "confluence":
        return volume(t * 0.62, 0.17 * Math.sin(t * 2.2), 0.08 * Math.cos(t * Math.PI), 0.43 + 0.55 * Math.pow(Math.abs(t), 0.7));
    }
  });
  return {
    version: 1,
    name: `Hero ink: ${name}`,
    blend: 0.28,
    material: { color: "#060709", roughness: 0.23, metalness: 0 },
    motion: { speed: 0.65, amplitude: 0.035, pointer: 0.22 },
    parts,
  };
}
