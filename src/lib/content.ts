/*
  All marketing copy lives here. Components render it; they don't own it.

  Grounded in the Socratink Brain (CONSTITUTION → NORTH-STAR → Canon):
  - optimize for independently demonstrated durable capability;
  - learner-authored work is the evidence; assistance provenance survives;
  - exposure ≠ evidence, immediate performance ≠ durable learning;
  - product language must not exceed available evidence (DEC-0003), so this
    copy describes the method and what Socratink is built to do, and avoids
    mastery scores, manufactured progress, or engagement language.

  Wedge (Company Thesis): adults facing consequential performance demands in
  difficult technical or academic material: self-directed learners, university
  and certification learners, professionals acquiring hard bodies of knowledge.
*/

export const site = {
  name: "Socratink",
  tagline: "Know what you actually know",
  description:
    "A learning agent for hard material. It makes you do the thinking, keeps the evidence of what you produced, and is built to come back later to see whether the capability became yours.",
  url: "https://socratink.ai",
  appUrl: "https://app.socratink.ai/",
  year: new Date().getFullYear(),
  pronunciation: {
    respell: "so-cre-tink",
    syllables: ["soʊ", "krə", "tɪŋk"],
  },
} as const;

export const nav = {
  links: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Disciplines", href: "#material" },
    { label: "Why it sticks", href: "#retention-science" },
    { label: "Memory", href: "#memory" },
  ],
  login: { label: "Log in", href: `${site.appUrl}login` },
  cta: { label: "Try the free diagnostic", shortLabel: "Try free", href: site.appUrl },
} as const;

export const hero = {
  primary: { label: "Try the free diagnostic", href: site.appUrl },
  secondary: { label: "See how it works", href: "#how-it-works" },
} as const;




export type OrbitDisciplineId =
  | "stats"
  | "biochem"
  | "boards"
  | "cloud"
  | "law"
  | "signals"
  | "med"
  | "analysis"
  | "accounting"
  | "ml";

export type OrbitDiscipline = {
  id: OrbitDisciplineId;
  label: string;
  question: string;
  target: string;
  aiTrap: string;
  transferAsk: string;
};

/** In-place Orbit switcher cards. Gemini DISCIPLINE_CARDS; labels match prior orbit.nodes. */
export const orbitDisciplines: readonly OrbitDiscipline[] = [
  {
    id: "stats",
    label: "Statistics",
    question: "Can a bigger survey still give the wrong answer?",
    target: "Sampling Bias Invariance under Sample Size",
    aiTrap:
      "AI fluently increases n, conflating standard error reduction with the correction of systematic sampling frame flaws.",
    transferAsk:
      "A medical survey polls 25,000 opt-in app users to estimate national diabetes rates. Explain why tighter variance does not cure the estimate, without multiple choice.",
  },
  {
    id: "biochem",
    label: "Organic chemistry",
    question: "Why can the same molecule react in two different ways?",
    target: "Steric Hindrance vs. Nucleophilicity in SN2 Pathways",
    aiTrap:
      "AI recites 'backside attack causes inversion', leaving the student unaware that a sterically hindered tertiary carbon forces an E2 elimination instead.",
    transferAsk:
      "Predict the major product when (R)-2-bromobutane is treated with sodium cyanide in DMSO vs. potassium tert-butoxide in tert-butanol. Explain the governing divergence unprompted.",
  },
  {
    id: "boards",
    label: "Board exams",
    question: "Does a positive test always mean someone is sick?",
    target: "Bayesian Positive Predictive Value in Low-Prevalence Screening",
    aiTrap:
      "AI praises a 99% test sensitivity, while the candidate forgets that when disease prevalence is 0.1%, false positives vastly outnumber true positives.",
    transferAsk:
      "A test with 99% sensitivity and 95% specificity tests positive in an asymptomatic screening population (prevalence 0.1%). Calculate without notes why the patient still only has a ~2% chance of disease.",
  },
  {
    id: "cloud",
    label: "Cloud certifications",
    question: "What happens when two servers disagree about your balance?",
    target: "Consistency Boundaries under Network Partition (CAP Theorem)",
    aiTrap:
      "AI recommends multi-region read replicas, obscuring the reality that replicas only scale reads and introduce split-brain write conflicts when the cross-region link drops.",
    transferAsk:
      "A fiber cut isolates two availability zones handling a banking ledger. Prove why the database cannot maintain both zero-downtime balance deductions and ledger consistency.",
  },
  {
    id: "law",
    label: "Contract law",
    question: "When does a promise become something you can enforce?",
    target: "Pre-Existing Duty Rule vs. Promissory Estoppel",
    aiTrap:
      "AI gives a generic definition of detrimental reliance, missing whether a subcontractor's verbal promise is unenforceable due to an existing contractual obligation.",
    transferAsk:
      "A contractor promises an electrician a $10,000 bonus to finish an on-time completion they were already legally bound to deliver. Analyze whether the electrician can enforce payment without reference notes.",
  },
  {
    id: "signals",
    label: "Signal processing",
    question: "How can a recording pick up a sound that was never there?",
    target: "Analog Anti-Aliasing Filtration prior to Sampling",
    aiTrap:
      "AI quotes the Nyquist limit (fs > 2fmax), while the engineer forgets that high-frequency noise folds permanently into the baseband unless an analog low-pass filter precedes the ADC.",
    transferAsk:
      "A sensor samples a 1 kHz acoustic signal at 1.5 kHz. What spurious alias frequency appears in the output, and explain why no downstream DSP algorithm can remove it.",
  },
  {
    id: "med",
    label: "Pathophysiology",
    question: "Why can the same treatment help one patient and harm another?",
    target: "Hemodynamic Divergence in Cardiogenic vs. Hypovolemic Shock",
    aiTrap:
      "AI explains the Frank-Starling curve fluently, while the learner reflexively orders IV fluid boluses for a patient whose lungs are already filling with fluid.",
    transferAsk:
      "A hypotensive patient presents with cold extremities, elevated jugular venous pressure, and bilateral pulmonary crackles. Explain why standard fluid resuscitation will precipitate respiratory arrest.",
  },
  {
    id: "analysis",
    label: "Real analysis",
    question: "If every step is continuous, does the limit have to be?",
    target: "Pointwise vs. Uniform Convergence of Function Sequences",
    aiTrap:
      "AI proves fn(x) = x^n converges pointwise to 0 on [0, 1), masking the failure of the limit function to preserve continuity on the closed interval [0, 1].",
    transferAsk:
      "Construct a sequence of continuous functions on [0, 1] that converges to 0 pointwise, but whose integrals converge to 1. State unprompted why uniform convergence fails.",
  },
  {
    id: "accounting",
    label: "Accounting",
    question: "Does getting paid mean you have earned the revenue?",
    target: "Performance Obligation Bundling under ASC 606",
    aiTrap:
      "AI lists the 5-step revenue framework, while missing whether ongoing proprietary security patches make software licenses a single bundled service rather than upfront point-in-time revenue.",
    transferAsk:
      "A SaaS vendor sells a 3-year term license with essential daily proprietary vulnerability updates. Defend why revenue cannot be recognized upfront on key delivery.",
  },
  {
    id: "ml",
    label: "Machine learning",
    question: "Why can a model ace a test and fail in the real world?",
    target: "Data Leakage across Cross-Validation Splits",
    aiTrap:
      "AI writes a clean scikit-learn preprocessing block, but fits standard scalers across the full dataset prior to k-fold splitting, leaking test-fold distribution parameters into training.",
    transferAsk:
      "Explain why fitting a TF-IDF vectorizer before train/test partitioning produces an artificially inflated evaluation metric, even if target labels were excluded.",
  },
] as const;

export const orbit = {
  title: "Put your subject to the test.",
  bridge: "Choose a subject. See what you can explain from memory.",
  exampleLabel: "Example",
  instruction: "Explain why, without your notes.",
  ownMaterial: "Or bring your own study outline.",
  pauseLabel: "Pause orbit",
  resumeLabel: "Resume orbit",
  defaultId: "stats" as const satisfies OrbitDisciplineId,
  cta: {
    label: "Try the free diagnostic",
    href: site.appUrl,
  },
  /** Ordered to match the decorative orbit ring (prior nodes list). */
  disciplines: orbitDisciplines,
  /** Label list for ring geometry / legacy readers; same order as disciplines. */
  nodes: orbitDisciplines.map((d) => d.label),
} as const;

export const memory = {
  eyebrow: "Longitudinal record",
  title: "Your thinking,\nproven across time.",
  body: "An answer tells you what happened once. A longitudinal record proves your understanding didn't evaporate. Track how raw intuition transforms into unshakeable recall before test day.",
  principle: "The original words stay.\nThe proof compounds around them.",
  stages: [
    {
      id: "day-01",
      day: "Day 01",
      stage: "Cold baseline diagnostic",
      shortLabel: "Diagnostic",
      date: "Oct 12 · 09:14",
      prompt: "Why doesn't a massive sample size eliminate sampling bias?",
      attempt: "“More responses should give us a more accurate estimate because the law of large numbers averages out individual errors.”",
      status: "trap" as const,
      statusLabel: "Identified trap",
      annotation: "Conflated variance with bias. A larger sample reduces random noise, but amplifies systematic exclusion with higher false confidence.",
      retentionDelta: "Baseline intuition",
    },
    {
      id: "day-03",
      day: "Day 03",
      stage: "Targeted Socratic repair",
      shortLabel: "Repair",
      date: "Oct 14 · 18:22",
      prompt: "Isolate the distinction between sample size and selection mechanism.",
      attempt: "“Variance shrinks with N, but bias is in the sampling frame. If the door only lets tall people in, measuring 100,000 people just gives a very precise estimate of tall people.”",
      status: "repair" as const,
      statusLabel: "Mechanistic breakthrough",
      annotation: "Causal boundary recognized. Decoupled random error (variance) from structural distortion (selection).",
      retentionDelta: "+45% mechanistic precision",
    },
    {
      id: "day-14",
      day: "Day 14",
      stage: "Unaided retention check",
      shortLabel: "Unaided",
      date: "Oct 26 · 11:05",
      prompt: "Solved cold without notes, aids, or AI suggestions.",
      attempt: "“Large N reduces variance toward the sample’s expected value; it does not shift that expectation toward the true population parameter if selection probability is non-uniform.”",
      status: "mastered" as const,
      statusLabel: "Retention validated",
      annotation: "Exam-ready retrieval. Mechanism recalled cold without scaffolding after two weeks in the 80% retention band.",
      retentionDelta: "80% retention verified cold",
      seal: "RETENTION VALIDATED",
    },
  ],
  exportFormats: [
    { label: "Markdown", ext: ".md" },
    { label: "JSON Ledger", ext: ".json" },
    { label: "Anki Deck", ext: ".csv" },
  ],
  ownership: "Your records belong to you. Export as Markdown or JSON, or delete them anytime. Private sessions are never used to train public models.",
  privacyNotice: "Zero public model training · Your thinking stays yours · Client-side export",
} as const;

export type MemoryStageId = (typeof memory.stages)[number]["id"];


export const finalCta = {
  title: "Know what you\nactually know.",
  prompt: "Start with one question.",
  button: { label: "Try the free diagnostic", href: site.appUrl },
  sub: "Free · No sign-up required · Works in your browser",
} as const;

export const footer = {
  index: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Disciplines", href: "#material" },
    { label: "Why it sticks", href: "#retention-science" },
    { label: "Memory", href: "#memory" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "mailto:support@socratink.ai" },
  ],
  legalNote: "All rights reserved.",
} as const;


/** Approved hero presentation, retained while restoring the original page story. */
export const notebook = {
  heroEyebrow: "Self-test engine",
  heroTitle: "Practice hard material.\nKnow what you actually know before test day.",
  heroBody:
    "Answer one realistic exam prompt from memory. No multiple choice, no notes, and no AI autocomplete. You will immediately see which parts of your reasoning hold up and where the gaps are.",
  heroTrust: "Free trial · No sign-up required · Works directly in your browser",
  heroNote: "One realistic prompt · Answered from memory",
} as const;


