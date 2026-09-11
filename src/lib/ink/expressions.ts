import { INK_PRESETS, type InkScene } from "./scene";
import { compileSculptToScene, SCULPT_CATALOG } from "./sculpt";

export const INK_EXPRESSIONS = {
  rest: {
    label: "At rest",
    symbol: "Ink droplet",
    meaning: "An idea has room to take shape.",
    scene: {
      ...structuredClone(INK_PRESETS.ink),
      name: "Ink droplet",
      kinematics: "respiration",
    },
  },
  question: {
    label: "A question opens",
    symbol: "Question mark",
    meaning: "Stay with the question. There is something to explore.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.question_aperture.definition),
      name: "Question mark",
      kinematics: "serpentine",
    },
  },
  lightbulb: {
    label: "Breakthrough insight",
    symbol: "Lightbulb",
    meaning: "The conceptual breakthrough. The realization clicks unassisted.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.lightbulb.definition),
      name: "Lightbulb",
      kinematics: "pulse",
    },
  },
  target: {
    label: "On target",
    symbol: "Bullseye target",
    meaning: "Precision under pressure. Hitting the crux of the concept unassisted.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.target.definition),
      name: "Bullseye target",
      kinematics: "vortex",
    },
  },
  key: {
    label: "Proven retention",
    symbol: "Socratic key",
    meaning: "Unlocking retention. The reasoning and mastery stay yours.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.key.definition),
      name: "Socratic key",
      kinematics: "respiration",
    },
  },
  bolt: {
    label: "Flash recall",
    symbol: "Lightning bolt",
    meaning: "Fast, instinctive retrieval on exam day.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.bolt.definition),
      name: "Lightning bolt",
      kinematics: "serpentine",
    },
  },
  aporia: {
    label: "Productive struggle",
    symbol: "Aporia knot",
    meaning: "Epistemic friction. Reconstructing the concept under pressure.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.aporia.definition),
      name: "Aporia knot",
      kinematics: "pulse",
    },
  },
  iris: {
    label: "Maieutic inquiry",
    symbol: "Maieutic iris",
    meaning: "The aperture dilates: unassisted inquiry begins.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.maieutic_iris.definition),
      name: "Maieutic iris",
      kinematics: "vortex",
    },
  },
  nib: {
    label: "In your own words",
    symbol: "Dipped nib",
    meaning: "Write the answer unassisted. The ink marks your own reasoning.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.quill.definition),
      name: "Dipped nib",
      kinematics: "serpentine",
    },
  },
  connect: {
    label: "Ideas connect",
    symbol: "Synaptic bridge",
    meaning: "Two ideas become a connection you can explain across disciplines.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.synaptic_bridge.definition),
      name: "Bridge",
      kinematics: "stokes-bridge",
    },
  },
  explain: {
    label: "Proven retention",
    symbol: "Living codex",
    meaning: "Make the explanation yours. That retention is what the method is built to test.",
    scene: {
      ...compileSculptToScene(SCULPT_CATALOG.codex.definition),
      name: "Open notebook",
      kinematics: "respiration",
    },
  },
} satisfies Record<
  string,
  { label: string; symbol: string; meaning: string; scene: InkScene }
>;
export type InkExpression = keyof typeof INK_EXPRESSIONS;
