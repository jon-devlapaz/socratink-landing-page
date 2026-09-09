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
    {
      label: "Method",
      href: "#method",
      tooltip: "An unassisted attempt · Watch assistance fade",
    },
    {
      label: "Disciplines",
      href: "#material",
      tooltip: "10 rigorous syllabi · Where AI fluency diverges from mastery",
    },
    {
      label: "Memory",
      href: "#memory",
      tooltip: "Your durable record · Evidence that compounds over time",
    },
  ],
  login: { label: "Log in", href: `${site.appUrl}login` },
  cta: { label: "Start a free attempt", href: site.appUrl },
} as const;

export const hero = {
  primary: { label: "Start a free attempt", href: site.appUrl },
  secondary: { label: "See how an attempt works", href: "#method" },
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
  target: string;
  aiTrap: string;
  transferAsk: string;
};

/** In-place Orbit switcher cards. Gemini DISCIPLINE_CARDS; labels match prior orbit.nodes. */
export const orbitDisciplines: readonly OrbitDiscipline[] = [
  {
    id: "stats",
    label: "Statistics",
    target: "Sampling Bias Invariance under Sample Size",
    aiTrap:
      "AI fluently increases n, conflating standard error reduction with the correction of systematic sampling frame flaws.",
    transferAsk:
      "A medical survey polls 25,000 opt-in app users to estimate national diabetes rates. Explain why tighter variance does not cure the estimate, without multiple choice.",
  },
  {
    id: "biochem",
    label: "Organic chemistry",
    target: "Steric Hindrance vs. Nucleophilicity in SN2 Pathways",
    aiTrap:
      "AI recites 'backside attack causes inversion', leaving the student unaware that a sterically hindered tertiary carbon forces an E2 elimination instead.",
    transferAsk:
      "Predict the major product when (R)-2-bromobutane is treated with sodium cyanide in DMSO vs. potassium tert-butoxide in tert-butanol. Explain the governing divergence unprompted.",
  },
  {
    id: "boards",
    label: "Board exams",
    target: "Bayesian Positive Predictive Value in Low-Prevalence Screening",
    aiTrap:
      "AI praises a 99% test sensitivity, while the candidate forgets that when disease prevalence is 0.1%, false positives vastly outnumber true positives.",
    transferAsk:
      "A test with 99% sensitivity and 95% specificity tests positive in an asymptomatic screening population (prevalence 0.1%). Calculate without notes why the patient still only has a ~2% chance of disease.",
  },
  {
    id: "cloud",
    label: "Cloud certifications",
    target: "Consistency Boundaries under Network Partition (CAP Theorem)",
    aiTrap:
      "AI recommends multi-region read replicas, obscuring the reality that replicas only scale reads and introduce split-brain write conflicts when the cross-region link drops.",
    transferAsk:
      "A fiber cut isolates two availability zones handling a banking ledger. Prove why the database cannot maintain both zero-downtime balance deductions and ledger consistency.",
  },
  {
    id: "law",
    label: "Contract law",
    target: "Pre-Existing Duty Rule vs. Promissory Estoppel",
    aiTrap:
      "AI gives a generic definition of detrimental reliance, missing whether a subcontractor's verbal promise is unenforceable due to an existing contractual obligation.",
    transferAsk:
      "A contractor promises an electrician a $10,000 bonus to finish an on-time completion they were already legally bound to deliver. Analyze whether the electrician can enforce payment without reference notes.",
  },
  {
    id: "signals",
    label: "Signal processing",
    target: "Analog Anti-Aliasing Filtration prior to Sampling",
    aiTrap:
      "AI quotes the Nyquist limit (fs > 2fmax), while the engineer forgets that high-frequency noise folds permanently into the baseband unless an analog low-pass filter precedes the ADC.",
    transferAsk:
      "A sensor samples a 1 kHz acoustic signal at 1.5 kHz. What spurious alias frequency appears in the output, and explain why no downstream DSP algorithm can remove it.",
  },
  {
    id: "med",
    label: "Pathophysiology",
    target: "Hemodynamic Divergence in Cardiogenic vs. Hypovolemic Shock",
    aiTrap:
      "AI explains the Frank-Starling curve fluently, while the learner reflexively orders IV fluid boluses for a patient whose lungs are already filling with fluid.",
    transferAsk:
      "A hypotensive patient presents with cold extremities, elevated jugular venous pressure, and bilateral pulmonary crackles. Explain why standard fluid resuscitation will precipitate respiratory arrest.",
  },
  {
    id: "analysis",
    label: "Real analysis",
    target: "Pointwise vs. Uniform Convergence of Function Sequences",
    aiTrap:
      "AI proves fn(x) = x^n converges pointwise to 0 on [0, 1), masking the failure of the limit function to preserve continuity on the closed interval [0, 1].",
    transferAsk:
      "Construct a sequence of continuous functions on [0, 1] that converges to 0 pointwise, but whose integrals converge to 1. State unprompted why uniform convergence fails.",
  },
  {
    id: "accounting",
    label: "Accounting",
    target: "Performance Obligation Bundling under ASC 606",
    aiTrap:
      "AI lists the 5-step revenue framework, while missing whether ongoing proprietary security patches make software licenses a single bundled service rather than upfront point-in-time revenue.",
    transferAsk:
      "A SaaS vendor sells a 3-year term license with essential daily proprietary vulnerability updates. Defend why revenue cannot be recognized upfront on key delivery.",
  },
  {
    id: "ml",
    label: "Machine learning",
    target: "Data Leakage across Cross-Validation Splits",
    aiTrap:
      "AI writes a clean scikit-learn preprocessing block, but fits standard scalers across the full dataset prior to k-fold splitting, leaking test-fold distribution parameters into training.",
    transferAsk:
      "Explain why fitting a TF-IDF vectorizer before train/test partitioning produces an artificially inflated evaluation metric, even if target labels were excluded.",
  },
] as const;

export const orbit = {
  eyebrow: "For material that has to hold",
  titleSans: "Built for the hard stuff.",
  titleSerif: "When the exam, the license, or the job is real.",
  defaultId: "stats" as const satisfies OrbitDisciplineId,
  cta: {
    label: "Start a free attempt",
    href: site.appUrl,
  },
  /** Ordered to match the decorative orbit ring (prior nodes list). */
  disciplines: orbitDisciplines,
  /** Label list for ring geometry / legacy readers; same order as disciplines. */
  nodes: orbitDisciplines.map((d) => d.label),
} as const;

export const memory = {
  eyebrow: "Built for continuity",
  titleSans: "When you start in the app,",
  titleSerif: "attempts can stack into a record.",
  cards: [
    {
      title: "Attempts can accumulate.",
      sub: "Into a list you can open later.",
      body: "In Socratink, each session can stand alone and stack over weeks into a readable record of what you produced — not a score, your work. This landing walkthrough does not save yours.",
    },
    {
      title: "The model can change.",
      sub: "The meaning of your work does not.",
      body: "Swap the runtime underneath (Default, Chain, or whatever comes next). What you produced is still labeled with its conditions.",
    },
    {
      title: "You hold the record.",
      sub: "Inspect, correct, export, delete.",
      body: "In the app, review how an inference was formed, correct what no longer fits, take your history with you, or erase what you choose.",
    },
  ],
} as const;


export const finalCta = {
  titleSans: "Know what you",
  titleSerif: "actually know.",
  button: { label: "Start a free attempt", href: site.appUrl },
  sub: "Instant in-browser · No account required · Free to start",
} as const;

export const footer = {
  indexLabel: "Site index",
  legalLabel: "Legal",
  attemptLabel: "Attempt",
  index: [
    { label: "Method", href: "#method" },
    { label: "Disciplines", href: "#material" },
    { label: "Memory", href: "#memory" },
  ],
  attempt: { label: "Start a free attempt", href: site.appUrl },
  legalNote: "All rights reserved.",
} as const;


/** Approved hero presentation, retained while restoring the original page story. */
export const notebook = {
  heroTitle: "Know what you\nactually know.",
  heroBody:
    "For medical boards, the bar exam, cloud certs, and hard technical subjects: make the attempt yourself. Socratink keeps unassisted evidence of what you can hold under pressure: your work, not the AI's.",
  heroTrust: "Instant in-browser · No account required · Free to start",
  heroNote: "The thinking stays yours.",
} as const;

/** Contract-slip Encounter copy (Method fold). */
export const contractSlip = {
  eyebrow: "The Socratink Method · Interactive Specimen",
  titleSans: "One question.",
  titleSerif: "No safety net.",
  lead: "AI fluently answers for you. Socratink tests whether you can hold the concept under pressure. Here is how an unassisted attempt works on a classic statistical trap: sampling bias invariance under sample size.",
  railLabel: "Diagnostic Specimen · Statistics",
  question: "What happens when the draw itself is biased?",
  sampleTraceBadge: "Sample Trace · not your evidence",
  sampleText:
    "Bigger sample from the same bad draw just makes the wrong answer more confident.",
  ghostText:
    "Bias is a property of the sampling process, not of sample size. Drawing more observations from the same skewed process reproduces the skew with tighter variance. It does not cancel the systematic error.",
  refuseText: "I don't know yet.",
  claims: [
    "Establishes durable retention",
    "Establishes cold reconstruction",
    "Establishes transfer to novel domains",
  ],
  nonInferences: [
    "Does not establish durable retention",
    "Does not establish unprompted reconstruction",
    "Does not establish transfer to novel domains",
  ],
  hints: {
    cold: "One question. Evidence begins when you attempt.",
    coldScroll: "Scroll.",
    ghostArrive: "Assisted text arrives. Keep scrolling.",
    ghostLeaving: "Assisted text is leaving.",
    ghostGone: "That assistance fades. None of those words were yours.",
    ink: "Your sentence — or a labeled sample. Nothing masquerades.",
    inkDefault: "Write one sentence — or show a labeled sample.",
    inkRecorded: "Ink recorded. Keep scrolling.",
    inkSampleScroll: "Keep scrolling.",
    inkRefuse: "Refusal recorded. Bound next.",
    bound: "Bound. Claims try to land.",
    boundNoInk: "No ink on the slip.",
    exit: "That observation is bounded. The thinking stays yours.",
    exitWalkthrough: "This walkthrough stores nothing on the page.",
  },
  inkPlaceholder: "Your words on the line…",
  commitLabel: "Commit ink",
  sampleLabel: "Show a sample",
  refuseLabel: "I don't know yet",
  cta: { label: "Start a free attempt", href: site.appUrl },
  ctaSub: "Instant in-browser · No account required · Free to start",
} as const;

