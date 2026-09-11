import { z } from "zod";
import { INK_EXPRESSIONS, type InkExpression } from "./expressions";
import { parseInkScene, type InkScene } from "./scene";

export const inkExpressSchema = z.strictObject({
  expression: z.enum([
    "rest",
    "question",
    "aporia",
    "iris",
    "nib",
    "connect",
    "explain",
  ]),
});

export const inkExpressDescription =
  "Express a Socratink learning moment: rest (ink droplet), question (question mark), aporia (aporia knot), iris (maieutic aperture), nib (dipped nib), connect (bridge), explain (open notebook). Choose from interaction context; these are visual cues, not assessments of learning. Replaces the scene with a validated starting recipe. Use ink_set_scene for a custom form.";

export function resolveExpressionScene(args: {
  expression: InkExpression;
}): InkScene {
  return parseInkScene(INK_EXPRESSIONS[args.expression].scene);
}
