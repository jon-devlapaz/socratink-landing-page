import { z } from "zod";
import {
  generateSomaticScene,
  type SomaticState,
  type SomaticTelemetry,
} from "./somatic";
import type { InkScene } from "./scene";

export const inkSomaticSchema = z.strictObject({
  state: z.enum(["settled", "listening", "thinking", "explaining"]),
  intensity: z.number().min(0).max(1).optional(),
  conserveVolume: z.boolean().optional(),
});

export const inkSomaticDescription =
  "Embody an AI cognitive state in fluid liquid ink: settled (rest/synthesis), listening (receptive attention), thinking (deliberation/bifurcation), explaining (articulation). Calculates mass-conserving fluid geometry.";

export interface InkSomaticInput {
  state: SomaticState;
  intensity?: number;
  conserveVolume?: boolean;
}

export function resolveSomaticScene(input: InkSomaticInput): {
  scene: InkScene;
  telemetry: SomaticTelemetry;
} {
  return generateSomaticScene(input);
}
