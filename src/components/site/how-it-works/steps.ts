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
    title: "Pick one target",
    description: "Choose a concept from medical boards, bar outlines, technical certifications, or your own notes.",
  },
  {
    id: "explain",
    stepNumber: "02",
    title: "Explain it unaided",
    description: "Answer in your own words. No multiple choice, no autocomplete, and no hints.",
  },
  {
    id: "inspect",
    stepNumber: "03",
    title: "Inspect what holds",
    description: "See where your reasoning held up, where gaps appeared, and what needs review later.",
  },
] as const;

export const previewData = {
  target: {
    category: "Organic chemistry",
    activeTarget: "Steric Hindrance vs. Nucleophilicity in SN2 Pathways",
    activeContext: "Reactivity divergence under strong, hindered base conditions",
    otherTargets: [
      { subject: "Statistics", name: "Sampling Bias Invariance under Sample Size" },
      { subject: "Cloud certs", name: "Consistency Boundaries under Network Partition (CAP)" },
      { subject: "Accounting", name: "Performance Obligation Bundling under ASC 606" },
    ],
  },
  explain: {
    prompt:
      "Predict the major product when (R)-2-bromobutane is treated with potassium tert-butoxide in tert-butanol. Explain the governing divergence.",
    response:
      "Potassium tert-butoxide is a sterically hindered strong base. The bulky tert-butyl group cannot readily attack the secondary carbon via an SN2 substitution. Instead, it abstracts a beta-hydrogen in an E2 elimination pathway, producing 2-butene as the major product.",
    badges: [
      "Assistance: None",
      "Free response",
      "No multiple choice",
    ],
  },
  inspect: {
    subject: "Diagnostic evaluation",
    held: {
      label: "Held concept",
      detail: "Correctly identified steric hindrance as the mechanism forcing an E2 elimination over SN2.",
    },
    gap: {
      label: "Identified gap",
      detail: "Did not specify why bulky bases favor Hofmann orientation over Zaitsev products.",
    },
    schedule: {
      label: "Continuity probe",
      detail: "Follow-up verification queued for review in 14 days.",
    },
  },
} as const;
