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
    title: "Pick your topic",
    description: "Choose a concept from medical boards, bar outlines, cloud certifications, or paste your own syllabus.",
  },
  {
    id: "explain",
    stepNumber: "02",
    title: "Explain it from memory",
    description: "Write out the mechanism in your own words. There are no hints, no multiple choice options to guess between, and no autocomplete.",
  },
  {
    id: "inspect",
    stepNumber: "03",
    title: "See where the gaps are",
    description: "Compare your explanation against the benchmark to identify what held and what needs review before test day.",
  },
] as const;

export const previewData = {
  target: {
    category: "Statistics",
    activeTarget: "Sampling Bias Invariance under Sample Size",
    activeContext: "Systematic exclusion under large-N measurement",
  },
  explain: {
    prompt:
      "A medical survey polls 25,000 opt-in app users to estimate national diabetes rates. Explain why tighter variance does not cure the estimate.",
  },
  inspect: {
    subject: "Benchmark comparison",
    held: {
      label: "Held concept",
      detail: "Reached for a mechanism — the law of large numbers — instead of guessing.",
    },
    gap: {
      label: "Identified gap",
      detail: "Conflated variance with bias: a larger sample tightens spread around a skewed frame.",
    },
  },
} as const;
