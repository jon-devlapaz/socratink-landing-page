import { z } from "zod";
import { INK_EXPRESSIONS, type InkExpression } from "./expressions";
import { generateProceduralConceptScene, type ProceduralConceptKind } from "./random";
import { parseInkScene, type InkScene } from "./scene";

export const inkExpressSchema = z.strictObject({
  expression: z.enum([
    "rest",
    "question",
    "lightbulb",
    "target",
    "key",
    "bolt",
    "aporia",
    "iris",
    "nib",
    "connect",
    "explain",
  ]),
});

export const inkExpressDescription =
  "Express a Socratink learning moment: rest (ink droplet), question (question mark), lightbulb (insight), target (bullseye), key (retention), bolt (recall), aporia (knot), iris (aperture), nib (pen), connect (bridge), explain (notebook). Choose from interaction context; these are visual cues, not assessments of learning.";

export function resolveExpressionScene(args: {
  expression: InkExpression;
}): InkScene {
  const proceduralKinds: Record<string, ProceduralConceptKind> = {
    rest: "rest",
    question: "question",
    lightbulb: "lightbulb",
    target: "target",
    key: "key",
  };
  const kind = proceduralKinds[args.expression];
  if (kind) {
    return generateProceduralConceptScene(kind);
  }
  return parseInkScene(INK_EXPRESSIONS[args.expression].scene);
}
