export type StepId = "target" | "explain" | "inspect";

export type StepItem = {
  id: StepId;
  stepNumber: string;
  title: string;
  description: string;
};

export const steps: readonly StepItem[] = [
  {
    id: "target",
    stepNumber: "01",
    title: "Deconstruct & Predict",
    description:
      "Decompose any syllabus into a causal graph of prerequisite necessity. Prediction gates force you to commit a hypothesis before you are shown.",
  },
  {
    id: "explain",
    stepNumber: "02",
    title: "Socratic Struggle & Explorables",
    description:
      "The AI is strictly forbidden from giving solutions. Productive struggle through minimal hints, counter-examples, and interactive HTML simulations for threshold concepts.",
  },
  {
    id: "inspect",
    stepNumber: "03",
    title: "Separation of Powers & Receipts",
    description:
      "The tutor teaches, but a blind assessor evaluates your free recall in a fresh context. Every grade is an immutable written receipt on disk. No receipts, no mastery claim.",
  },
] as const;

export const previewData = {
  target: {
    category: "Statistics",
    activeTarget: "Sampling Bias Invariance under Sample Size",
    activeContext: "Threshold node † · Prerequisite: variance vs selection",
  },
  explain: {
    prompt:
      "A medical survey polls 25,000 opt-in app users to estimate national diabetes rates. Explain why tighter variance does not cure the estimate.",
  },
  inspect: {
    subject: "Blind Assessor Receipt · Grade: Partial",
    held: {
      label: "Held concept",
      detail: "Correctly recognized that large N activates the law of large numbers.",
    },
    gap: {
      label: "Identified gap",
      detail: "Conflated variance with bias: tighter spread amplifies systematic error with false certainty.",
    },
  },
} as const;
